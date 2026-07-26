// -----------------------------------------------------------------------------
// Sistema de Ranking (cálculo) — SEPARADO da UI
//
// Acumula PONTOS por atleta ao longo da TEMPORADA (ano-calendário), a partir dos
// resultados das etapas. A pontuação de cada etapa depende da CATEGORIA/tier do
// campeonato (ver competitionCategories.js): campeonatos maiores valem mais
// pontos (a categoria dá a base do campeão), menores valem menos.
//
// Este módulo NÃO desenha nada — só calcula e guarda. A aba de Rankings
// (script.js) apenas LÊ `getSeasonRanking()` e exibe. Assim, a UI é um indicador
// visual do que o sistema de ranking fez.
//
// Ciclo de temporada: o acúmulo é do ano corrente. Na virada de ano, o ranking
// final é ARQUIVADO em `RANKING_HISTORY` (histórico salvo para uso posterior —
// ver TODO.md) e o acúmulo é zerado para a nova temporada. A orquestração fica em
// participation.js (`processDay`, junto do reset de ritmo).
// -----------------------------------------------------------------------------

// Acúmulo da temporada CORRENTE: athleteId -> { points, stages }.
const RANKING_POINTS = {};

// Histórico de temporadas encerradas: year -> ranking (snapshot ordenado).
const RANKING_HISTORY = {};

// Pontos de uma POSIÇÃO a partir da base da categoria (rankingPoints).
// Modelo (placeholder, fácil de recalibrar): decaimento harmônico — o campeão
// leva a base cheia e as posições seguintes levam frações (base / posição).
// Assim, categoria maior (base maior) => mais pontos em cada posição.
function pointsForPosition(basePoints, position) {
  if (!basePoints || position < 1) return 0;
  return Math.round(basePoints / position);
}

// Registra os pontos de uma etapa JÁ RESOLVIDA no acúmulo da temporada.
// `results` = [{ id, result, position }]. A idempotência (uma vez por etapa) é
// garantida por quem chama (processStage só resolve/registra cada etapa uma vez).
function recordStageForRanking(championship, results) {
  const category = getChampionshipCategory(championship);
  const basePoints = category ? category.rankingPoints : 0;
  for (const entry of results) {
    const points = pointsForPosition(basePoints, entry.position);
    const acc = RANKING_POINTS[entry.id] || { points: 0, stages: 0 };
    acc.points += points;
    acc.stages += 1; // uma etapa disputada a mais na temporada
    RANKING_POINTS[entry.id] = acc;
  }
}

// Ranking da temporada corrente, ordenado por pontos (desc). Desempate: mais
// etapas disputadas, depois menor id. Empates em PONTOS compartilham a posição
// (1, 2, 2, 4 — mesmo padrão da ResultsEngine).
// Retorna [{ position, athleteId, points, stages }].
function getSeasonRanking() {
  const entries = Object.keys(RANKING_POINTS).map((id) => ({
    athleteId: Number(id),
    points: RANKING_POINTS[id].points,
    stages: RANKING_POINTS[id].stages,
  }));
  entries.sort(
    (a, b) =>
      b.points - a.points || b.stages - a.stages || a.athleteId - b.athleteId
  );
  let lastPoints = null;
  let lastPosition = 0;
  entries.forEach((entry, index) => {
    if (entry.points === lastPoints) {
      entry.position = lastPosition; // empate em pontos: mesma posição
    } else {
      entry.position = index + 1;
      lastPosition = entry.position;
      lastPoints = entry.points;
    }
  });
  return entries;
}

// Arquiva a temporada que terminou (snapshot do ranking) sob o seu ano. Não
// arquiva temporada vazia.
function archiveSeason(year) {
  if (Object.keys(RANKING_POINTS).length === 0) return;
  RANKING_HISTORY[year] = getSeasonRanking();
}

// Zera o acúmulo da temporada (nova temporada). Não mexe no histórico.
function resetRankingSeason() {
  for (const key of Object.keys(RANKING_POINTS)) delete RANKING_POINTS[key];
}

// Ranking arquivado de um ano (ou null). Uso posterior — ver TODO.md.
function getRankingHistory(year) {
  return RANKING_HISTORY[year] || null;
}

// Anos com histórico arquivado (crescente).
function getRankingHistoryYears() {
  return Object.keys(RANKING_HISTORY)
    .map(Number)
    .sort((a, b) => a - b);
}

// Zera tudo (acúmulo + histórico), ex.: ao reiniciar a simulação.
function resetRanking() {
  resetRankingSeason();
  for (const key of Object.keys(RANKING_HISTORY)) delete RANKING_HISTORY[key];
}
