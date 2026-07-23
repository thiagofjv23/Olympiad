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
//                         precision }). Define como o resultado da modalidade é
//                         apurado/ranqueado (ver resultsEngine.js).
//   - generalPopularity : popularidade geral da modalidade DENTRO do esporte (0-100)
//   - countryPopularity : popularidade por país — relação a ser feita depois
//                         (ver TODO.md)
//
// Conforme a diretriz de não criar exemplos não solicitados, a database começa
// VAZIA: as modalidades serão adicionadas quando pedido.
// -----------------------------------------------------------------------------

const MODALITIES = {};

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
