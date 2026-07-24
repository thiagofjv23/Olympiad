// -----------------------------------------------------------------------------
// Ranking de Marcas (cálculo) — SEPARADO da UI
//
// Para cada MODALIDADE, guarda a MELHOR MARCA de cada atleta na TEMPORADA
// (ano-calendário) e monta o ranking ordenado da melhor para a pior marca.
// "Melhor" depende da modalidade (ver resolution.order na ResultsEngine): nos
// 100 m (tempo) a menor marca é a melhor; num salto, a maior.
//
// É um TEMPLATE GENÉRICO: funciona para qualquer modalidade (indexado por
// `modalityId`, usando a ordem e o formatador da própria modalidade). A UI (aba
// Rankings) apenas LÊ `getSeasonMarksRanking(modalityId)` e exibe — nada de
// cálculo na tela.
//
// De cada melhor marca guardamos também ONDE/QUANDO foi alcançada (data,
// campeonato, etapa), para a UI poder detalhar ao clicar na data.
//
// Ciclo de temporada: como o ranking de pontos (ver ranking.js), na virada de ano
// as marcas são ARQUIVADAS (histórico para uso posterior — ver TODO.md) e zeradas.
// A orquestração fica em participation.js (`processDay`).
// -----------------------------------------------------------------------------

// Melhor marca da temporada CORRENTE: modalityId -> { athleteId -> registro }.
// registro = { value, date, championshipId, stageNumber }.
const MARKS_RANKING = {};

// Histórico de temporadas encerradas: year -> { modalityId -> ranking snapshot }.
const MARKS_HISTORY = {};

// Registra as marcas de uma etapa JÁ RESOLVIDA. Para cada atleta, guarda a marca
// apenas se for MELHOR que a atual da temporada (conforme a ordem da modalidade).
// `results` = [{ id, result, position }] (result = a marca; null = sem marca).
function recordStageMarks(championship, stage, modality, results) {
  if (!modality) return;
  const order = modality.resolution.order;
  const table = MARKS_RANKING[modality.id] || (MARKS_RANKING[modality.id] = {});
  for (const entry of results) {
    if (entry.result == null) continue; // sem marca (ex.: DNF) não entra
    const current = table[entry.id];
    if (!current || ResultsEngine.isBetterResult(entry.result, current.value, order)) {
      table[entry.id] = {
        value: entry.result,
        date: new Date(stage.date),
        championshipId: championship.id,
        stageNumber: stage.number,
      };
    }
  }
}

// Ranking de marcas da temporada corrente para uma modalidade, ordenado da melhor
// para a pior marca. Empates na MARCA compartilham a posição (1, 2, 2, 4).
// Retorna [{ position, athleteId, value, date, championshipId, stageNumber }].
function getSeasonMarksRanking(modalityId) {
  const table = MARKS_RANKING[modalityId];
  if (!table) return [];
  const modality = getModality(modalityId);
  const order = modality
    ? modality.resolution.order
    : ResultsEngine.ORDERS.ASCENDING;

  const entries = Object.keys(table).map((id) => ({
    athleteId: Number(id),
    value: table[id].value,
    date: table[id].date,
    championshipId: table[id].championshipId,
    stageNumber: table[id].stageNumber,
  }));
  entries.sort(
    (a, b) =>
      ResultsEngine.compareResults(a.value, b.value, order) ||
      a.athleteId - b.athleteId
  );
  let lastValue;
  let lastPosition = 0;
  entries.forEach((entry, index) => {
    if (entry.value === lastValue) {
      entry.position = lastPosition; // empate na marca: mesma posição
    } else {
      entry.position = index + 1;
      lastPosition = entry.position;
      lastValue = entry.value;
    }
  });
  return entries;
}

// Modalidades que já têm marcas registradas na temporada corrente.
function getModalitiesWithMarks() {
  return Object.keys(MARKS_RANKING);
}

// Arquiva as marcas da temporada que terminou (snapshot por modalidade). Não
// arquiva temporada vazia.
function archiveMarksSeason(year) {
  const modalityIds = Object.keys(MARKS_RANKING);
  if (modalityIds.length === 0) return;
  const snapshot = {};
  for (const modalityId of modalityIds) {
    snapshot[modalityId] = getSeasonMarksRanking(modalityId);
  }
  MARKS_HISTORY[year] = snapshot;
}

// Zera as marcas da temporada (nova temporada). Não mexe no histórico.
function resetMarksSeason() {
  for (const key of Object.keys(MARKS_RANKING)) delete MARKS_RANKING[key];
}

// Marcas arquivadas de um ano (ou null). Uso posterior — ver TODO.md.
function getMarksHistory(year) {
  return MARKS_HISTORY[year] || null;
}

// Zera tudo (temporada + histórico), ex.: ao reiniciar a simulação.
function resetMarks() {
  resetMarksSeason();
  for (const key of Object.keys(MARKS_HISTORY)) delete MARKS_HISTORY[key];
}
