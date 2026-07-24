// -----------------------------------------------------------------------------
// Participação atleta ↔ etapa
// Define QUAIS atletas disputam cada etapa de um campeonato — a ponte que faltava
// entre atletas (via clube/contrato) e as etapas. Com os participantes definidos,
// é possível desgastá-los (fadiga) e, no futuro, resolver os resultados.
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

// --- aplicação da fadiga por participação -------------------------------------
// A fadiga de uma etapa deve ser aplicada UMA única vez, quando a etapa é
// realizada. Guardamos as etapas já processadas para não desgastar de novo a
// cada passagem de tempo/re-render.
const _fatiguedStages = new Set();

function stageKey(championship, stage) {
  return `${championship.id}#${stage.number}`;
}

// Percorre todos os campeonatos e, para cada etapa JÁ REALIZADA até a data de
// referência e ainda não processada, aplica o desgaste de participação aos seus
// participantes (individualmente) e a marca como processada. Chamado após a
// passagem de tempo. Avança apenas para frente (o tempo não retrocede).
function applyParticipationFatigue(referenceDate) {
  for (const championship of Object.values(CHAMPIONSHIPS)) {
    for (const stage of championship.stages) {
      if (!isStageDone(stage, referenceDate)) continue;
      const key = stageKey(championship, stage);
      if (_fatiguedStages.has(key)) continue;
      applyStageFatigueToParticipants(getStageParticipants(championship, stage));
      _fatiguedStages.add(key);
    }
  }
}

// Zera o controle de etapas já desgastadas (ex.: ao reiniciar a simulação).
function resetParticipation() {
  _fatiguedStages.clear();
}
