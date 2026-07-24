// -----------------------------------------------------------------------------
// Entidade: Modalidades (Modalities)
// Ligada diretamente a um esporte (sportId). Usada em esportes que têm mais de
// uma variação de prática — por exemplo, o Atletismo (100 m, salto em distância,
// arremesso de peso, etc.).
//
// Cada modalidade possui:
//   - id                : identificador único
//   - name              : nome da modalidade
//   - sportId           : esporte primário (ver sports.js)
//   - resolution        : forma de resolução — objeto de parâmetros compatível
//                         com a ResultsEngine (ex.: { metric, order, aggregation,
//                         precision }). Define como o resultado é apurado/ranqueado.
//   - performance       : parâmetros do modelo que TRANSFORMA os atributos do
//                         atleta no número do resultado (ver cálculo abaixo).
//   - generalPopularity : popularidade geral da modalidade DENTRO do esporte (0-100)
//   - countryPopularity : popularidade por país — relação a ser feita depois
//                         (ver TODO.md)
// -----------------------------------------------------------------------------

const MODALITIES = {
  // 100 metros rasos do Atletismo.
  "MOD-ATL-100M": {
    id: "MOD-ATL-100M",
    name: "100 metros rasos",
    sportId: "SPT-ATLETISMO",
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
    },
    generalPopularity: 95,
    countryPopularity: null, // relação futura (ver TODO.md)
  },
};

// Limita um número ao intervalo [min, max].
function clampModalityValue(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// Busca uma modalidade pelo id. Retorna undefined se não existir.
function getModality(id) {
  return MODALITIES[id];
}

// Retorna todas as modalidades de um esporte.
function getModalitiesBySport(sportId) {
  return Object.values(MODALITIES).filter(
    (modality) => modality.sportId === sportId
  );
}

// -----------------------------------------------------------------------------
// Modelo de desempenho
//
// Força efetiva = Força − redutor de fadiga.
//   - Fadiga acumulada = 100 − fatigue  (o stat `fatigue` começa em 100 = descansado;
//     quanto mais baixo, mais cansado).
//   - Redutor = fadiga acumulada × fatiguePenaltyPerPoint.
//   - Ou seja: atleta descansado (fatigue 100) não perde nada; cansado perde força.
//
// Tempo (100 m) = recordTime + (100 − Força efetiva) × secondsPerStrengthPoint.
//   - Força efetiva 100 → recorde (9,58 s). Quanto menor a Força efetiva, mais
//     lento (tempo maior). O tempo nunca fica abaixo do recorde.
// -----------------------------------------------------------------------------

// Força efetiva do atleta nesta modalidade (aplica o redutor de fadiga).
function effectiveStrengthForModality(athlete, modality) {
  const perf = modality.performance;
  const accumulatedFatigue = 100 - athlete.fatigue; // 0 = descansado
  const reducer = accumulatedFatigue * perf.fatiguePenaltyPerPoint;
  return clampModalityValue(athlete.strength - reducer, 1, 100);
}

// Resultado numérico do atleta na modalidade (aqui: o tempo dos 100 m).
function computeModalityResult(athlete, modality) {
  const perf = modality.performance;
  const effective = effectiveStrengthForModality(athlete, modality);
  return perf.recordTime + (100 - effective) * perf.secondsPerStrengthPoint;
}

// Formata um resultado para exibição, conforme a métrica/precisão da modalidade.
function formatModalityResult(value, modality) {
  if (value == null) return "—";
  const { metric, precision = 2 } = modality.resolution;
  const unit = ResultsEngine.UNITS[metric] || "";
  return `${value.toFixed(precision)} ${unit}`.trim();
}

// Gera o resultado de cada atleta e resolve o ranking pela ResultsEngine.
// Retorna [{ id, result, position }] — `result` é o tempo alcançado.
function resolveModality(athletes, modality) {
  const competitors = athletes.map((athlete) => ({
    id: athlete.id,
    value: computeModalityResult(athlete, modality),
  }));
  return ResultsEngine.resolveResults(competitors, modality.resolution);
}
