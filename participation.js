// -----------------------------------------------------------------------------
// Participação atleta ↔ etapa
// Define QUAIS atletas disputam cada EVENTO de cada etapa de um campeonato — a
// ponte entre atletas (via clube/contrato) e as provas. Com os participantes
// definidos, resolve o RESULTADO de cada evento (via ResultSystem) e desgasta os
// participantes (fadiga/ritmo).
//
// Uma etapa pode rodar VÁRIOS eventos (ver stage.events — tournaments.js). Cada
// evento é disputado pelos atletas cujo EVENTO FAVORITO é aquele (o atleta
// compete só na sua prova — ver athletes.js).
//
// REGRA DE TESTE (temporária): cada clube inscreve seus atletas contratados nos
// eventos correspondentes ao evento favorito deles. Participantes de um evento =
// atletas com contrato ATIVO (na data) em clube do país + elegíveis (geografia +
// idade) + com aquele evento favorito, limitados pela cota por clube. Agentes
// livres não disputam (ninguém os inscreve).
//
// FALTA (ver TODO.md): mecânica REAL de cadastro (o clube escolhendo quais
// atletas inscrever, vagas, critérios) e a lógica de chave do mata-mata.
// -----------------------------------------------------------------------------

// Mapa atleta → clube (contrato ATIVO na data) para os clubes de um país. É a
// base da participação: quem está contratado, e por qual clube, naquela data.
function buildAthleteClubMap(championship, referenceDate) {
  const athleteClubId = new Map();
  for (const club of getClubsByCountry(championship.countryId)) {
    for (const contract of getContractsByClub(club.id, referenceDate)) {
      athleteClubId.set(contract.athleteId, club.id);
    }
  }
  return athleteClubId;
}

// Elenco elegível de uma ETAPA, agrupado por EVENTO favorito. Constrói o mapa
// atleta→clube e avalia a elegibilidade (geografia + idade) UMA vez por etapa —
// não por evento —, o que importa quando a etapa roda muitos eventos com muitos
// atletas (evita reprocessar o elenco inteiro a cada prova). Retorna
// { athleteClubId, byEvent } onde byEvent: eventId → atletas elegíveis daquele
// evento (o atleta compete só na sua prova favorita).
function buildStageRoster(championship, stage) {
  const athleteClubId = buildAthleteClubMap(championship, stage.date);
  const byEvent = new Map();
  for (const athleteId of athleteClubId.keys()) {
    const athlete = getAthlete(athleteId);
    if (!athlete) continue;
    if (!isAthleteEligibleForChampionship(athlete, championship)) continue;
    if (!byEvent.has(athlete.favoriteEventId)) byEvent.set(athlete.favoriteEventId, []);
    byEvent.get(athlete.favoriteEventId).push(athlete);
  }
  return { athleteClubId, byEvent };
}

// Participantes de UM evento de uma etapa (contratados + elegíveis + com este
// evento favorito), respeitando a cota por clube. Atalho para uso avulso; a
// resolução em massa (processStage) usa buildStageRoster uma vez por etapa.
function getStageEventParticipants(championship, stage, event) {
  const { athleteClubId, byEvent } = buildStageRoster(championship, stage);
  let participants = byEvent.get(event.id) || [];
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

// Eventos (objetos) que uma etapa disputa (os ids em stage.events resolvidos).
function getStageEvents(championship, stage) {
  return (stage.events || []).map((id) => getEvent(id)).filter(Boolean);
}

// Primeiro evento DISPUTÁVEL de uma etapa (atalho/compat, ex.: para a UI simples).
// Retorna null se a etapa não tiver nenhum evento jogável.
function getStageEvent(championship, stage) {
  const events = getStageEvents(championship, stage);
  return events.find((event) => isEventPlayable(event)) || null;
}

// --- resolução de resultados e fadiga por etapa -------------------------------
// Uma etapa é processada UMA única vez, ao ser realizada. Para cada EVENTO
// disputável da etapa: (1) resolve-se o resultado com a fadiga/ritmo ATUAIS dos
// participantes daquele evento e trava-se o resultado; (2) somam-se os pontos e
// registra-se a marca; (3) os participantes daquele evento se cansam e ganham
// ritmo. Um resultado é histórico (fixado no momento da realização).
const _stageEventResults = new Map(); // `${champ}#${stage}#${event}` -> results
const _processedStages = new Set(); // `${champ}#${stage}` (idempotência)

function stageKey(championship, stage) {
  return `${championship.id}#${stage.number}`;
}

function stageEventKey(championship, stage, event) {
  return `${championship.id}#${stage.number}#${event.id}`;
}

// Processa uma etapa (idempotente): resolve cada evento disputável e desgasta os
// seus participantes. Retorna a lista de ids dos atletas que competiram (em
// qualquer evento da etapa), para a orquestração do descanso em processDay.
function processStage(championship, stage) {
  const key = stageKey(championship, stage);
  if (_processedStages.has(key)) return [];
  _processedStages.add(key);

  // Elenco elegível agrupado por evento favorito: construído UMA vez para a
  // etapa e reaproveitado em todos os seus eventos (ver buildStageRoster).
  const { athleteClubId, byEvent } = buildStageRoster(championship, stage);
  const quota = getChampionshipClubQuota(championship);

  const competedIds = [];
  for (const event of getStageEvents(championship, stage)) {
    if (!isEventPlayable(event)) continue; // sem ResultSystem/params ainda: pula

    let participants = byEvent.get(event.id) || [];
    if (quota != null) {
      participants = limitAthletesPerClub(participants, athleteClubId, quota);
    }
    // Resultado com a fadiga e o ritmo ATUAIS (antes dos efeitos deste evento).
    const results = resolveEvent(participants, event);
    _stageEventResults.set(stageEventKey(championship, stage, event), results);
    // Ranking de pontos (conforme a tier do campeonato) e de marcas (por evento).
    recordStageForRanking(championship, results);
    recordStageMarks(championship, stage, event, results);
    // Depois de competir: os participantes se cansam e ganham ritmo (forma).
    applyStageFatigueToParticipants(participants);
    applyRaceRitmoToParticipants(participants);
    for (const athlete of participants) competedIds.push(athlete.id);
  }
  return competedIds;
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
    // Rankings: arquiva a temporada que terminou (pontos e marcas) e zera.
    const endedYear = date.getFullYear() - 1;
    archiveSeason(endedYear);
    resetRankingSeason();
    archiveMarksSeason(endedYear);
    resetMarksSeason();
    // Ritmo: todos recomeçam o ano com forma baixa.
    for (const athlete of ATHLETES) resetSeasonRitmo(athlete);
  }

  const competingIds = new Set();
  for (const { championship, stage } of getStagesOnDate(date)) {
    for (const athleteId of processStage(championship, stage)) {
      competingIds.add(athleteId);
    }
  }
  for (const athlete of ATHLETES) {
    if (competingIds.has(athlete.id)) continue; // competiu hoje: não descansa
    applyRestDay(athlete); // recupera Cansaço
    applyRestDayRitmo(athlete); // perde um pouco de ritmo (forma esfria)
  }
}

// Resultado travado de um EVENTO de uma etapa ([{ id, result, position }]) ou
// null se ainda não realizado/processado.
function getStageEventResult(championship, stage, event) {
  return _stageEventResults.get(stageEventKey(championship, stage, event)) || null;
}

// Resultado do primeiro evento disputável de uma etapa (atalho/compat).
function getStageResult(championship, stage) {
  const event = getStageEvent(championship, stage);
  return event ? getStageEventResult(championship, stage, event) : null;
}

// Zera os resultados processados (ex.: ao reiniciar a simulação).
function resetParticipation() {
  _stageEventResults.clear();
  _processedStages.clear();
}
