// -----------------------------------------------------------------------------
// TimeResultSystem — sistema de resultado por TEMPO
//
// Resolve os eventos cuja disputa é medida em TEMPO (corridas do atletismo,
// provas de natação, remo, contrarrelógio, etc.). É GENÉRICO: um único sistema
// serve TODAS as provas de tempo. O que MUDA de uma prova para outra vem dos
// PARÂMETROS do próprio evento (`event.time`); o que é COMUM tem defaults aqui.
//
// Modelo (o mesmo já usado nos 100 m, agora generalizado):
//   Força efetiva = Força − redutor de fadiga − redutor de forma
//     - redutor de fadiga = (100 − fatigue) × fatiguePenaltyPerPoint
//     - redutor de forma   = (100 − ritmo)  × formPenaltyPerPoint
//   Tempo = recordTime + (100 − Força efetiva) × secondsPerStrengthPoint
//     - Força efetiva 100 → recordTime (o piso/recorde). Quanto menor a força
//       efetiva, mais lento (tempo maior).
//
// COMO ADICIONAR UMA PROVA DE TEMPO (sem tocar em código): no evento, declare
//   resultSystem: "TimeResultSystem"
//   time: { recordTime: <piso da prova em s> }        // único obrigatório
// e, se a prova precisar, sobrescreva qualquer default em `time`
//   (secondsPerStrengthPoint, fatiguePenaltyPerPoint, formPenaltyPerPoint).
// Ex.: uma corrida longa costuma usar um `secondsPerStrengthPoint` maior (a
// diferença entre atletas pesa mais segundos). As diferenças entram evento a
// evento; o sistema não precisa saber de esporte nenhum — daí ser fácil inserir
// novos esportes de tempo depois.
//
// Depende de: resultsEngine.js (ordenação/ranqueamento). NÃO conhece atletas,
// esportes ou modalidades além do que o evento entrega.
// -----------------------------------------------------------------------------

const TimeResultSystem = {
  // Identificador do sistema (casa com o campo `event.resultSystem`).
  id: "TimeResultSystem",

  // Rótulo amigável (para UI/depuração, se quiser).
  label: "Tempo",

  // Parâmetros de ordenação padrão: prova de TEMPO, MENOR tempo vence.
  // `precision: 3` = o tempo é guardado/ordenado em MILÉSIMOS de segundo. Essa 3ª
  // casa é a granularidade INTERNA (ordenação/desempate); a exibição arredonda
  // para CENTÉSIMOS (2 casas) — ver `formatTime`.
  DEFAULT_RESOLUTION: {
    metric: ResultsEngine.METRICS.TIME,
    order: ResultsEngine.ORDERS.ASCENDING, // menor tempo vence
    aggregation: ResultsEngine.AGGREGATIONS.SINGLE,
    precision: 3,
  },

  // Defaults do MODELO (o que é comum a toda prova de tempo). Cada evento pode
  // sobrescrever qualquer um em `event.time`.
  DEFAULTS: {
    // Quanto cada ponto de Força efetiva ABAIXO de 100 acrescenta ao tempo (s).
    secondsPerStrengthPoint: 0.05,
    // Cada ponto de fadiga ACUMULADA (100 − fatigue) reduz a Força efetiva.
    fatiguePenaltyPerPoint: 0.3,
    // Cada ponto de DÉFICIT DE FORMA (100 − ritmo) reduz a Força efetiva.
    formPenaltyPerPoint: 0.15,
  },

  // Limita um número ao intervalo [min, max].
  clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  },

  // Parâmetros efetivos de um evento (os do evento sobre os defaults).
  params(event) {
    const t = (event && event.time) || {};
    const d = this.DEFAULTS;
    return {
      recordTime: t.recordTime,
      secondsPerStrengthPoint:
        t.secondsPerStrengthPoint != null ? t.secondsPerStrengthPoint : d.secondsPerStrengthPoint,
      fatiguePenaltyPerPoint:
        t.fatiguePenaltyPerPoint != null ? t.fatiguePenaltyPerPoint : d.fatiguePenaltyPerPoint,
      formPenaltyPerPoint:
        t.formPenaltyPerPoint != null ? t.formPenaltyPerPoint : d.formPenaltyPerPoint,
    };
  },

  // Parâmetros de ordenação do evento (os do evento, senão o default do sistema).
  resolution(event) {
    return (event && event.resolution) || this.DEFAULT_RESOLUTION;
  },

  // Este sistema consegue RESOLVER o evento? (precisa do piso da prova, recordTime.)
  resolves(event) {
    return !!(event && event.time && event.time.recordTime != null);
  },

  // Força efetiva do atleta neste evento (aplica os redutores de fadiga e forma).
  effectiveStrength(athlete, event) {
    const p = this.params(event);
    const accumulatedFatigue = 100 - athlete.fatigue; // 0 = descansado
    const fatigueReducer = accumulatedFatigue * p.fatiguePenaltyPerPoint;
    const ritmo = athlete.ritmo != null ? athlete.ritmo : 100; // ausente => sem penalidade
    const formReducer = (100 - ritmo) * p.formPenaltyPerPoint;
    return this.clamp(athlete.strength - fatigueReducer - formReducer, 1, 100);
  },

  // Resultado numérico do atleta (o TEMPO da prova).
  computeResult(athlete, event) {
    const p = this.params(event);
    const effective = this.effectiveStrength(athlete, event);
    return p.recordTime + (100 - effective) * p.secondsPerStrengthPoint;
  },

  // Formata um tempo (em SEGUNDOS) como relógio, mostrando só as unidades
  // necessárias — a forma padrão dos esportes, mais apresentável ao jogador:
  //   - abaixo de 1 min → "S.cc"          (ex.: 9.81)
  //   - abaixo de 1 h   → "M:SS.cc"       (ex.: 1:40.91, 3:26.00)
  //   - a partir de 1 h → "H:MM:SS.cc"    (ex.: 2:00:35.00)
  // A EXIBIÇÃO usa CENTÉSIMOS (2 casas). Os MILÉSIMOS não somem: ficam na lógica
  // interna (o valor é guardado com `precision: 3`) e servem de critério de
  // DESEMPATE na ordenação — dois tempos iguais nos centésimos podem ser
  // separados pelo milésimo, sem que o jogador veja a 3ª casa. Arredonda a partir
  // dos milésimos guardados (inteiros) e trabalha em centésimos inteiros para o
  // arredondamento não "vazar" entre as unidades (ex.: 59,997 s → 1:00.00, e não
  // 60.00). Genérico: serve qualquer prova de tempo (corrida, natação, marcha…).
  formatTime(seconds) {
    if (seconds == null || Number.isNaN(seconds)) return "—";
    const totalMs = Math.max(0, Math.round(seconds * 1000)); // milésimos guardados
    const totalCs = Math.round(totalMs / 10); // → centésimos, só para exibir
    const h = Math.floor(totalCs / 360000);
    const m = Math.floor((totalCs % 360000) / 6000);
    const s = Math.floor((totalCs % 6000) / 100);
    const cs = totalCs % 100;
    const pad2 = (n) => String(n).padStart(2, "0");
    if (h > 0) return `${h}:${pad2(m)}:${pad2(s)}.${pad2(cs)}`;
    if (m > 0) return `${m}:${pad2(s)}.${pad2(cs)}`;
    return `${s}.${pad2(cs)}`;
  },

  // Formata um resultado de tempo para exibição (ex.: "9.81", "1:40.91",
  // "2:00:35.00"). Delega a `formatTime` — a notação de relógio já se descreve
  // (sem sufixo de unidade). `event` fica na assinatura por compatibilidade.
  format(value, event) {
    return this.formatTime(value);
  },

  // Gera o tempo de cada atleta e resolve o ranking pela ResultsEngine.
  // Retorna [{ id, result, position }] — `result` é o tempo alcançado.
  resolve(athletes, event) {
    const competitors = athletes.map((athlete) => ({
      id: athlete.id,
      value: this.computeResult(athlete, event),
    }));
    return ResultsEngine.resolveResults(competitors, this.resolution(event));
  },
};
