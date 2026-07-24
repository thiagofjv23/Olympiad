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
// TRAVAS DE INSCRIÇÃO:
//   - de ATLETA (ver eligibility.js): só disputa quem é elegível à ABRANGÊNCIA
//     (`scope`) e à FAIXA ETÁRIA (`ageRestriction`) do campeonato. Ex.: um
//     Estadual de São Paulo só recebe atletas nascidos em SP.
//   - de COTA por clube (`clubQuota`): cada clube inscreve no máximo N atletas
//     por etapa (ex.: CNA = 1). É uma trava de GRUPO, aplicada aqui.
//
// FALTA (ver TODO.md — prioridade média): a mecânica REAL de cadastro de atletas
// em campeonatos (o clube escolhendo quais atletas inscrever, vagas, critérios).
// -----------------------------------------------------------------------------

// Retorna os atletas participantes de uma etapa de um campeonato: contratados via
// clube (na data da etapa), que passam nas travas de atleta (geográfica + idade)
// e respeitando a cota por clube. Sem duplicatas.
function getStageParticipants(championship, stage) {
  // Mapa atleta → clube (contrato ativo na data da etapa) nos clubes do país.
  const athleteClubId = new Map();
  for (const club of getClubsByCountry(championship.countryId)) {
    for (const contract of getContractsByClub(club.id, stage.date)) {
      athleteClubId.set(contract.athleteId, club.id);
    }
  }
  // Contratados via clube E elegíveis pelas travas de atleta (abrangência + idade).
  let participants = ATHLETES.filter(
    (athlete) =>
      athleteClubId.has(athlete.id) &&
      isAthleteEligibleForChampionship(athlete, championship)
  );
  // Trava de cota: cada clube inscreve no máximo `clubQuota` atletas.
  const quota = getChampionshipClubQuota(championship);
  if (quota != null) {
    participants = limitAthletesPerClub(participants, athleteClubId, quota);
  }
  return participants;
}

// Limita a `quota` atletas por clube. Placeholder de seleção (enquanto a
// inscrição REAL não existe): cada clube manda os seus MAIS FORTES (maior
// `strength`; desempate por id). Determinístico, para o resultado travado de uma
// etapa não variar entre recálculos.
function limitAthletesPerClub(athletes, athleteClubId, quota) {
  const byClub = new Map();
  for (const athlete of athletes) {
    const clubId = athleteClubId.get(athlete.id);
    if (!byClub.has(clubId)) byClub.set(clubId, []);
    byClub.get(clubId).push(athlete);
  }
  const selected = [];
  for (const list of byClub.values()) {
    list.sort((a, b) => b.strength - a.strength || a.id - b.id);
    for (const athlete of list.slice(0, quota)) selected.push(athlete);
  }
  return selected;
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
  // Resultado com a fadiga e o ritmo ATUAIS (antes dos efeitos desta etapa).
  const results = modality ? resolveModality(participants, modality) : [];
  _stageResults.set(key, results);
  // Ranking: soma os pontos desta etapa (conforme a tier do campeonato).
  recordStageForRanking(championship, results);
  // Depois de competir: os participantes se cansam (fadiga) e ganham ritmo (forma).
  applyStageFatigueToParticipants(participants);
  applyRaceRitmoToParticipants(participants);
  return results;
}

// Processa UM dia da simulação:
//   0) na virada de ano (1º de janeiro), ENCERRA a temporada: arquiva o ranking
//      (histórico) e o zera, e reinicia o RITMO de todos para o piso de temporada;
//   1) as etapas que ocorrem NESTE dia são resolvidas; seus participantes se
//      cansam e GANHAM ritmo (via processStage);
//   2) todos os demais atletas DESCANSAM: recuperam Cansaço e PERDEM ritmo (forma
//      esfriando) — quem competiu hoje não descansa hoje.
// Chamado dia a dia por `advanceDays`. O tempo só anda para frente.
function processDay(date) {
  // Virada de ano: encerra a temporada anterior e começa uma nova.
  if (date.getMonth() === 0 && date.getDate() === 1) {
    // Ranking: arquiva a temporada que terminou (histórico) e zera o acúmulo.
    archiveSeason(date.getFullYear() - 1);
    resetRankingSeason();
    // Ritmo: todos recomeçam o ano com forma baixa.
    for (const athlete of ATHLETES) resetSeasonRitmo(athlete);
  }

  const competingIds = new Set();
  for (const { championship, stage } of getStagesOnDate(date)) {
    const results = processStage(championship, stage);
    for (const entry of results) competingIds.add(entry.id);
  }
  for (const athlete of ATHLETES) {
    if (competingIds.has(athlete.id)) continue; // competiu hoje: não descansa
    applyRestDay(athlete); // recupera Cansaço
    applyRestDayRitmo(athlete); // perde um pouco de ritmo (forma esfria)
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
