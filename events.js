// -----------------------------------------------------------------------------
// Entidade: Eventos (Events) — as PROVAS de uma modalidade.
//
// Hierarquia: Esporte → Modalidade → EVENTO. O evento é a unidade RESOLVÍVEL da
// simulação: é ele que carrega o modelo de resultado (resolution + performance) e
// é resolvido pela ResultsEngine. Um evento pertence a uma MODALIDADE (modalityId,
// ver modalities.js), que por sua vez pertence a um esporte.
//
// Exemplo: os "100 metros rasos" são um EVENTO da modalidade "Velocidade" do
// esporte "Atletismo".
//
// Cada evento possui:
//   - id                : identificador único (ex.: "EVT-ATL-100M")
//   - name              : nome do evento (ex.: "100 metros rasos")
//   - modalityId        : modalidade a que pertence (ver modalities.js)
//   - resolution        : forma de resolução — objeto de parâmetros compatível
//                         com a ResultsEngine (ex.: { metric, order, aggregation,
//                         precision }). Define como o resultado é apurado/ranqueado.
//   - performance       : parâmetros do modelo que TRANSFORMA os atributos do
//                         atleta no número do resultado (ver cálculo abaixo).
//   - generalPopularity : popularidade geral do evento DENTRO do esporte (0-100)
//   - countryPopularity : popularidade por país — relação a ser feita depois
//                         (ver TODO.md)
//
// Por enquanto só existe o evento dos 100 m (o mesmo modelo que já tínhamos, agora
// classificado como evento). Popular os demais eventos é passo futuro (ver TODO.md).
// -----------------------------------------------------------------------------

const EVENTS = {
  // 100 metros rasos — evento da modalidade Velocidade (Atletismo).
  "EVT-ATL-100M": {
    id: "EVT-ATL-100M",
    name: "100 metros rasos",
    modalityId: "MOD-ATL-VELOCIDADE",
    resolution: {
      metric: ResultsEngine.METRICS.TIME,
      order: ResultsEngine.ORDERS.ASCENDING, // menor tempo vence
      aggregation: ResultsEngine.AGGREGATIONS.SINGLE,
      precision: 2,
    },
    performance: {
      // Recorde mundial: melhor tempo possível (piso). Ninguém corre abaixo disso.
      recordTime: 9.58,
      // Cada ponto de Força efetiva ABAIXO de 100 acrescenta este tempo (s).
      secondsPerStrengthPoint: 0.05,
      // Cada ponto de fadiga ACUMULADA reduz a Força efetiva (ver cálculo abaixo).
      fatiguePenaltyPerPoint: 0.3,
      // Cada ponto de DÉFICIT DE FORMA (100 − ritmo) reduz a Força efetiva.
      formPenaltyPerPoint: 0.15,
    },
    generalPopularity: 95,
    countryPopularity: null, // relação futura (ver TODO.md)
  },
};

// Limita um número ao intervalo [min, max].
function clampEventValue(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// Busca um evento pelo id. Retorna undefined se não existir.
function getEvent(id) {
  return EVENTS[id];
}

// Retorna todos os eventos de uma modalidade.
function getEventsByModality(modalityId) {
  return Object.values(EVENTS).filter((event) => event.modalityId === modalityId);
}

// Retorna todos os eventos de um esporte (via a modalidade de cada evento).
function getEventsBySport(sportId) {
  return Object.values(EVENTS).filter((event) => {
    const modality = getModality(event.modalityId);
    return modality && modality.sportId === sportId;
  });
}

// Modalidade a que um evento pertence (objeto de modalities.js) ou undefined.
function getEventModality(event) {
  return event ? getModality(event.modalityId) : undefined;
}

// -----------------------------------------------------------------------------
// Modelo de desempenho (do evento)
//
// Força efetiva = Força − redutor de fadiga − redutor de forma.
//   - Fadiga acumulada = 100 − fatigue  (o stat `fatigue` começa em 100 = descansado;
//     quanto mais baixo, mais cansado). Redutor = fadiga acumulada × fatiguePenaltyPerPoint.
//   - Déficit de forma = 100 − ritmo  (ritmo 100 = forma plena; quanto mais baixo,
//     menos afiado). Redutor = déficit de forma × formPenaltyPerPoint.
//   - Ou seja: descansado (fatigue 100) e em plena forma (ritmo 100) não perde nada;
//     cansado E/OU fora de forma perde Força efetiva. Os dois redutores SOMAM — a
//     fadiga (curto prazo) e o ritmo (forma de temporada) são independentes.
//   - Sem `ritmo` definido, o déficit de forma é 0 (não penaliza) — retrocompatível.
//
// Tempo (100 m) = recordTime + (100 − Força efetiva) × secondsPerStrengthPoint.
//   - Força efetiva 100 → recorde (9,58 s). Quanto menor a Força efetiva, mais
//     lento (tempo maior). O tempo nunca fica abaixo do recorde.
// -----------------------------------------------------------------------------

// Força efetiva do atleta neste evento (aplica os redutores de fadiga e forma).
function effectiveStrengthForEvent(athlete, event) {
  const perf = event.performance;
  const accumulatedFatigue = 100 - athlete.fatigue; // 0 = descansado
  const fatigueReducer = accumulatedFatigue * perf.fatiguePenaltyPerPoint;

  // Ritmo/forma: 100 = forma plena. Ausente => sem penalidade (retrocompatível).
  const ritmo = athlete.ritmo != null ? athlete.ritmo : 100;
  const formDeficit = 100 - ritmo; // 0 = em plena forma
  const formPenaltyPerPoint = perf.formPenaltyPerPoint != null ? perf.formPenaltyPerPoint : 0;
  const formReducer = formDeficit * formPenaltyPerPoint;

  return clampEventValue(
    athlete.strength - fatigueReducer - formReducer,
    1,
    100
  );
}

// Resultado numérico do atleta no evento (aqui: o tempo dos 100 m).
function computeEventResult(athlete, event) {
  const perf = event.performance;
  const effective = effectiveStrengthForEvent(athlete, event);
  return perf.recordTime + (100 - effective) * perf.secondsPerStrengthPoint;
}

// Formata um resultado para exibição, conforme a métrica/precisão do evento.
function formatEventResult(value, event) {
  if (value == null) return "—";
  const { metric, precision = 2 } = event.resolution;
  const unit = ResultsEngine.UNITS[metric] || "";
  return `${value.toFixed(precision)} ${unit}`.trim();
}

// Gera o resultado de cada atleta e resolve o ranking pela ResultsEngine.
// Retorna [{ id, result, position }] — `result` é o valor alcançado (ex.: o tempo).
function resolveEvent(athletes, event) {
  const competitors = athletes.map((athlete) => ({
    id: athlete.id,
    value: computeEventResult(athlete, event),
  }));
  return ResultsEngine.resolveResults(competitors, event.resolution);
}
