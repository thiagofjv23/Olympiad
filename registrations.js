// -----------------------------------------------------------------------------
// Entidade: Inscrições (Registrations) — o ELO Atleta ↔ Campeonato
//
// Uma inscrição registra que um ATLETA foi inscrito num CAMPEONATO por um CLUBE.
// É o que define quem disputa: a partir daqui, a participação (participation.js)
// deixa de "inscrever automaticamente todos os contratados" e passa a usar APENAS
// os atletas efetivamente INSCRITOS.
//
// IMPORTANTE (escopo de teste): quem faz a inscrição é o JOGADOR — não há IA que
// inscreva sozinha. O jogador controla os clubes (um de cada vez, ver
// clubControl.js) e inscreve os atletas do clube controlado (ver a aba
// "Inscrições"). Este módulo é só a ESTRUTURA/regras da inscrição; a decisão é
// toda do jogador.
//
// Regras de uma inscrição (canRegisterAthlete):
//   1. O atleta ainda NÃO está inscrito neste campeonato (um por campeonato).
//   2. O atleta está CONTRATADO ao clube que o inscreve (contrato ativo na data).
//      Agentes livres não podem ser inscritos (nenhum clube os inscreve).
//   3. O atleta é ELEGÍVEL ao campeonato (trava geográfica + idade — eligibility.js).
//   4. O EVENTO favorito do atleta está na COBERTURA do campeonato (senão ele não
//      teria prova para disputar).
//   5. A COTA por clube por evento (clubQuota) não foi atingida (se houver cota).
//
// Cada inscrição guarda: { championshipId, athleteId, clubId, eventId } — o
// eventId é o evento favorito do atleta no momento da inscrição (a prova em que
// competirá), guardado para a checagem de cota e para a participação.
// -----------------------------------------------------------------------------

// Índice principal: championshipId -> Map(athleteId -> inscrição). Dá consulta e
// iteração por campeonato sem varrer tudo.
const _regByChampionship = new Map();

// Índice de cota: `champ#club#event` -> quantas inscrições daquele clube naquele
// evento daquele campeonato (para checar clubQuota em O(1)).
const _regCountByChampClubEvent = new Map();

function _quotaKey(championshipId, clubId, eventId) {
  return `${championshipId}#${clubId}#${eventId}`;
}

// Zera todas as inscrições (ex.: ao reiniciar a simulação).
function resetRegistrations() {
  _regByChampionship.clear();
  _regCountByChampClubEvent.clear();
}

// O atleta já está inscrito neste campeonato?
function isAthleteRegistered(championshipId, athleteId) {
  const map = _regByChampionship.get(championshipId);
  return !!(map && map.has(athleteId));
}

// A inscrição do atleta neste campeonato (ou undefined).
function getRegistration(championshipId, athleteId) {
  const map = _regByChampionship.get(championshipId);
  return map ? map.get(athleteId) : undefined;
}

// Todas as inscrições de um campeonato (array de { championshipId, athleteId,
// clubId, eventId }).
function getChampionshipRegistrations(championshipId) {
  const map = _regByChampionship.get(championshipId);
  return map ? [...map.values()] : [];
}

// Quantos atletas estão inscritos num campeonato.
function getChampionshipRegistrationCount(championshipId) {
  const map = _regByChampionship.get(championshipId);
  return map ? map.size : 0;
}

// Quantas inscrições um clube tem para um evento de um campeonato (uso da cota).
function getClubEventRegistrationCount(championshipId, clubId, eventId) {
  return _regCountByChampClubEvent.get(_quotaKey(championshipId, clubId, eventId)) || 0;
}

// Pode inscrever este atleta neste campeonato por este clube, nesta data? Retorna
// { ok, reason }. `reason` (quando !ok): "already" | "notContracted" |
// "notEligible" | "eventNotCovered" | "quotaFull" | "noChampionship".
function canRegisterAthlete(championshipId, athleteId, clubId, referenceDate) {
  const championship = CHAMPIONSHIPS[championshipId];
  if (!championship) return { ok: false, reason: "noChampionship" };
  const athlete = getAthlete(athleteId);
  if (!athlete) return { ok: false, reason: "noAthlete" };

  if (isAthleteRegistered(championshipId, athleteId)) {
    return { ok: false, reason: "already" };
  }
  // Contratado ao clube que o inscreve (contrato ativo na data)?
  const contract = getActiveContractForAthlete(athleteId, referenceDate);
  if (!contract || contract.clubId !== clubId) {
    return { ok: false, reason: "notContracted" };
  }
  // Elegível (trava geográfica + idade)?
  if (!isAthleteEligibleForChampionship(athlete, championship)) {
    return { ok: false, reason: "notEligible" };
  }
  // O evento favorito está na cobertura do campeonato?
  if (!getChampionshipEvents(championship).includes(athlete.favoriteEventId)) {
    return { ok: false, reason: "eventNotCovered" };
  }
  // Cota por clube por evento (se houver).
  const quota = getChampionshipClubQuota(championship);
  if (
    quota != null &&
    getClubEventRegistrationCount(championshipId, clubId, athlete.favoriteEventId) >= quota
  ) {
    return { ok: false, reason: "quotaFull" };
  }
  return { ok: true };
}

// Inscreve um atleta num campeonato por um clube (se as regras permitirem).
// Retorna { ok, reason }. Não lança — a UI usa o resultado para dar feedback.
function registerAthlete(championshipId, athleteId, clubId, referenceDate) {
  const check = canRegisterAthlete(championshipId, athleteId, clubId, referenceDate);
  if (!check.ok) return check;

  const athlete = getAthlete(athleteId);
  const registration = {
    championshipId,
    athleteId,
    clubId,
    eventId: athlete.favoriteEventId,
  };
  if (!_regByChampionship.has(championshipId)) {
    _regByChampionship.set(championshipId, new Map());
  }
  _regByChampionship.get(championshipId).set(athleteId, registration);
  const key = _quotaKey(championshipId, clubId, registration.eventId);
  _regCountByChampClubEvent.set(key, (_regCountByChampClubEvent.get(key) || 0) + 1);
  return { ok: true };
}

// Remove a inscrição de um atleta num campeonato. Retorna true se removeu.
function unregisterAthlete(championshipId, athleteId) {
  const map = _regByChampionship.get(championshipId);
  const registration = map && map.get(athleteId);
  if (!registration) return false;
  map.delete(athleteId);
  const key = _quotaKey(championshipId, registration.clubId, registration.eventId);
  const count = _regCountByChampClubEvent.get(key) || 0;
  if (count <= 1) _regCountByChampClubEvent.delete(key);
  else _regCountByChampClubEvent.set(key, count - 1);
  return true;
}
