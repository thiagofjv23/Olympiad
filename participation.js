// -----------------------------------------------------------------------------
// Participação atleta ↔ etapa
// Define QUAIS atletas disputam cada etapa de um campeonato — a ponte entre
// atletas (via clube/contrato) e as etapas. Com os participantes definidos,
// resolve o RESULTADO da etapa (via modalidade + ResultsEngine) e desgasta os
// participantes (fadiga).
//
// REGRA DE TESTE (temporária): cada clube inscreve TODOS os seus atletas em
// TODAS as etapas. Ou seja, os participantes de uma etapa são todos os atletas
// com contrato ATIVO (na data da etapa) em algum clube do país do campeonato.
// Atletas sem clube (agentes livres) não disputam, pois ninguém os inscreve.
//
// FALTA (ver TODO.md — prioridade média): a mecânica REAL de cadastro de atletas
// em campeonatos (o clube escolhendo quais atletas inscrever, vagas, critérios).
// -----------------------------------------------------------------------------

// Retorna os atletas participantes de uma etapa de um campeonato.
// TESTE: todos os atletas com contrato ativo (na data da etapa) em clubes do
// país do campeonato. Sem duplicatas.
function getStageParticipants(championship, stage) {
  const clubs = getClubsByCountry(championship.countryId);
  const participantIds = new Set();
  for (const club of clubs) {
    for (const contract of getContractsByClub(club.id, stage.date)) {
      participantIds.add(contract.athleteId);
    }
  }
  return ATHLETES.filter((athlete) => participantIds.has(athlete.id));
}

// Quantidade de participantes de uma etapa (atalho para a UI/depuração).
function getStageParticipantCount(championship, stage) {
  return getStageParticipants(championship, stage).length;
}

// Modalidade (prova) que uma etapa disputa. Por ora, a primeira modalidade do
// campeonato; na falta, a primeira modalidade do esporte do campeonato.
// TODO: modalidade por etapa (cada etapa uma prova diferente) — ver TODO.md.
function getStageModality(championship, stage) {
  if (championship.modalities && championship.modalities.length > 0) {
    const modality = getModality(championship.modalities[0]);
    if (modality) return modality;
  }
  const sportModalities = getModalitiesBySport(championship.sportId);
  return sportModalities.length > 0 ? sportModalities[0] : null;
}

// --- resolução de resultados e fadiga por etapa -------------------------------
// Uma etapa é processada UMA única vez, ao ser realizada: (1) resolve-se o
// resultado com a fadiga ATUAL dos participantes (antes desta etapa) e trava-se
// o resultado; (2) então os participantes se cansam por esta etapa. Guardar os
// resultados evita recalcular com a fadiga futura (um resultado é histórico).
const _stageResults = new Map(); // stageKey -> [{ id, result, position }]

function stageKey(championship, stage) {
  return `${championship.id}#${stage.number}`;
}

// Processa uma etapa (idempotente): resolve o resultado e desgasta os
// participantes. Retorna o resultado (ranking) da etapa.
function processStage(championship, stage) {
  const key = stageKey(championship, stage);
  if (_stageResults.has(key)) return _stageResults.get(key);

  const participants = getStageParticipants(championship, stage);
  const modality = getStageModality(championship, stage);
  // Resultado com a fadiga atual (acumulada das etapas anteriores, não desta).
  const results = modality ? resolveModality(participants, modality) : [];
  _stageResults.set(key, results);
  // Depois de competir, os participantes se cansam por esta etapa.
  applyStageFatigueToParticipants(participants);
  return results;
}

// Processa todas as etapas JÁ REALIZADAS (em ordem) e ainda não processadas.
// Chamado após a passagem de tempo. O tempo só anda para frente.
function processRealizedStages(referenceDate) {
  for (const championship of Object.values(CHAMPIONSHIPS)) {
    for (const stage of championship.stages) {
      if (!isStageDone(stage, referenceDate)) continue;
      processStage(championship, stage);
    }
  }
}

// Resultado já resolvido de uma etapa ([{ id, result, position }]) ou null se a
// etapa ainda não foi realizada/processada.
function getStageResult(championship, stage) {
  return _stageResults.get(stageKey(championship, stage)) || null;
}

// Zera os resultados processados (ex.: ao reiniciar a simulação).
function resetParticipation() {
  _stageResults.clear();
}
