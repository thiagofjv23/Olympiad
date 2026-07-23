// -----------------------------------------------------------------------------
// Engine de resolução de resultados (Results Engine)
//
// Módulo GENÉRICO e independente: NÃO conhece esportes, atletas nem nenhuma
// outra entidade. Ele contém apenas os PARÂMETROS de simulação e as funções
// puras para, dado um conjunto de resultados numéricos, decidir a ordem/posições.
//
// A ideia: cada esporte/prova (definido em outro lugar, no futuro) monta um
// objeto de parâmetros usando as constantes daqui e entrega números à engine;
// a engine resolve o ranking sem saber de qual esporte se trata.
//
// Formato dos parâmetros (params):
//   {
//     order:       ORDERS.ASCENDING | ORDERS.DESCENDING   // obrigatório: quem vence
//     aggregation: AGGREGATIONS.*                          // opcional (padrão SINGLE)
//     metric:      METRICS.*                               // opcional (informativo)
//     precision:   número de casas decimais                // opcional
//   }
//
// Formato dos competidores (entradas de resolveResults):
//   { id, values: number[] }   // uma ou várias tentativas
//   { id, value: number }      // resultado único (açúcar sintático)
//   Um resultado ausente/ inválido é representado por `null` (fica por último).
// -----------------------------------------------------------------------------

const ResultsEngine = {
  // O que é medido (informativo — a engine opera sobre números puros).
  METRICS: {
    TIME: "time", // tempo
    DISTANCE: "distance", // distância
    HEIGHT: "height", // altura
    POINTS: "points", // pontuação
  },

  // Direção de ordenação = quem vence.
  ORDERS: {
    ASCENDING: "ascending", // menor valor vence (do menor para o maior). Ex.: tempo de corrida.
    DESCENDING: "descending", // maior valor vence (do maior para o menor). Ex.: distância, altura, pontos.
  },

  // Como combinar várias tentativas/parciais num único resultado.
  AGGREGATIONS: {
    SINGLE: "single", // um único resultado
    BEST: "best", // melhor tentativa (conforme a direção)
    SUM: "sum", // soma (ex.: pontos somados de várias provas)
    AVERAGE: "average", // média das tentativas
  },

  // Unidade padrão de cada métrica (apenas informativo, para exibição futura).
  UNITS: {
    time: "s",
    distance: "m",
    height: "m",
    points: "pts",
  },

  // --- validação ------------------------------------------------------------

  isValidOrder(order) {
    return order === this.ORDERS.ASCENDING || order === this.ORDERS.DESCENDING;
  },

  isValidAggregation(aggregation) {
    return Object.values(this.AGGREGATIONS).includes(aggregation);
  },

  isValidMetric(metric) {
    return Object.values(this.METRICS).includes(metric);
  },

  // --- núcleo ---------------------------------------------------------------

  // `candidate` é melhor que `current` conforme a direção?
  isBetterResult(candidate, current, order) {
    if (candidate == null) return false;
    if (current == null) return true;
    return order === this.ORDERS.ASCENDING
      ? candidate < current
      : candidate > current;
  },

  // Comparador para ordenação (melhor primeiro). Nulos vão para o fim.
  compareResults(a, b, order) {
    if (a == null && b == null) return 0;
    if (a == null) return 1;
    if (b == null) return -1;
    if (a === b) return 0;
    return order === this.ORDERS.ASCENDING ? a - b : b - a;
  },

  // Arredonda um valor para a precisão (casas decimais) informada.
  roundToPrecision(value, precision) {
    if (value == null || precision == null) return value;
    const factor = Math.pow(10, precision);
    return Math.round(value * factor) / factor;
  },

  // Combina uma lista de valores num único resultado, conforme os parâmetros.
  aggregateValues(values, params) {
    const list = (values || []).filter((v) => v != null);
    if (list.length === 0) return null;

    const aggregation = params.aggregation || this.AGGREGATIONS.SINGLE;
    const order = params.order;

    switch (aggregation) {
      case this.AGGREGATIONS.SUM:
        return list.reduce((sum, v) => sum + v, 0);
      case this.AGGREGATIONS.AVERAGE:
        return list.reduce((sum, v) => sum + v, 0) / list.length;
      case this.AGGREGATIONS.BEST:
        return list.reduce(
          (best, v) => (this.isBetterResult(v, best, order) ? v : best),
          list[0]
        );
      case this.AGGREGATIONS.SINGLE:
      default:
        return list[0];
    }
  },

  // Resolve o ranking de um conjunto de competidores.
  // Retorna [{ id, result, position }] ordenado do melhor para o pior.
  // Empates compartilham a posição (ranking de competição: 1, 2, 2, 4).
  resolveResults(competitors, params) {
    const order = params.order;
    const precision = params.precision;

    const scored = competitors.map((c) => {
      const values = c.values != null ? c.values : [c.value];
      const result = this.roundToPrecision(
        this.aggregateValues(values, params),
        precision
      );
      return { id: c.id, result };
    });

    scored.sort((a, b) => this.compareResults(a.result, b.result, order));

    let position = 0;
    let previous = undefined;
    return scored.map((entry, index) => {
      if (previous === undefined || entry.result !== previous) {
        position = index + 1;
        previous = entry.result;
      }
      return { id: entry.id, result: entry.result, position };
    });
  },
};

// Exporta em Node (testes); no navegador fica como global.
if (typeof module !== "undefined" && module.exports) {
  module.exports = ResultsEngine;
}
