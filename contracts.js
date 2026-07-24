// -----------------------------------------------------------------------------
// Entidade: Contratos (Contracts) — o ELO entre Atletas e Clubes.
//
// Um atleta se vincula a um clube por meio de um CONTRATO. O contrato tem uma
// duração estipulada logo no início, sempre ANUAL: 1, 2 ou 3 anos. Ao término:
//   - o clube pode RENOVAR (novo termo, começando quando o anterior acaba), ou
//   - o contrato EXPIRA e o atleta volta ao POOL DE AGENTES LIVRES.
//
// Ao contrário de clubes/cidades (databases fixas), os contratos são criados
// durante a simulação (assinaturas/renovações). A lista viva fica em CONTRACTS.
//
// Cada contrato possui:
//   - id            : identificador único ("CTR-1", "CTR-2", ...)
//   - athleteId     : atleta vinculado (ver athletes.js)
//   - clubId        : clube contratante (ver clubs.js)
//   - startDate     : data de início do vínculo
//   - durationYears : duração em anos (1, 2 ou 3) — estipulada no início
//   - endDate       : data de término (startDate + durationYears), derivada
//   - renewalOf     : id do contrato anterior quando é uma renovação (senão null)
//
// PRINCÍPIO (igual ao resto do projeto): o status "ativo/encerrado" é DERIVADO
// das datas do próprio contrato comparadas com uma data de referência — sem
// datas fixas/hardcoded e sem um campo de status que possa divergir. O vínculo
// atual de um atleta é simplesmente o seu contrato ativo naquela data.
//
// DESACOPLAMENTO: este módulo guarda o elo em si; NÃO altera as entidades Atleta
// ou Clube. O clube de um atleta é obtido derivando do contrato ativo
// (getAthleteClub), evitando duplicar o vínculo em dois lugares. Ver PRINCIPIOS_
// CONTRATOS.md e DECISOES.md.
// -----------------------------------------------------------------------------

// Durações permitidas (sempre anual).
const CONTRACT_DURATIONS = [1, 2, 3];

// Lista viva de contratos da simulação atual.
let CONTRACTS = [];

// Contador interno para ids sequenciais de contratos.
let _nextContractId = 1;

// --- utilidades ---------------------------------------------------------------

// Duração válida? (1, 2 ou 3 anos.)
function isValidContractDuration(durationYears) {
  return CONTRACT_DURATIONS.includes(durationYears);
}

// Data de término = início + N anos (contrato anual). Não muta a data original.
function contractEndDate(startDate, durationYears) {
  const end = new Date(startDate);
  end.setFullYear(end.getFullYear() + durationYears);
  return end;
}

// --- consultas de vínculo -----------------------------------------------------

// Um contrato está ATIVO numa data de referência se ela está no intervalo
// [startDate, endDate): vale do dia de início (inclusive) até a véspera do
// término; no dia do término o contrato já está encerrado. Comparação em nível
// de dia (toDayStart), dinâmica, lendo as datas do próprio contrato.
function isContractActive(contract, referenceDate) {
  const ref = toDayStart(referenceDate);
  return ref >= toDayStart(contract.startDate) && ref < toDayStart(contract.endDate);
}

// O contrato já terminou (a data de referência alcançou ou passou o término)?
function isContractEnded(contract, referenceDate) {
  return toDayStart(referenceDate) >= toDayStart(contract.endDate);
}

// Busca um contrato pelo id. Retorna undefined se não existir.
function getContract(id) {
  return CONTRACTS.find((contract) => contract.id === id);
}

// Todos os contratos (histórico completo, ativos ou já encerrados).
function getAllContracts() {
  return CONTRACTS.slice();
}

// Contrato ativo de um atleta numa data (o seu vínculo atual) ou null.
function getActiveContractForAthlete(athleteId, referenceDate) {
  return (
    CONTRACTS.find(
      (contract) =>
        contract.athleteId === athleteId && isContractActive(contract, referenceDate)
    ) || null
  );
}

// Clube atual de um atleta (derivado do contrato ativo) ou null se agente livre.
function getAthleteClub(athleteId, referenceDate) {
  const contract = getActiveContractForAthlete(athleteId, referenceDate);
  return contract ? getClub(contract.clubId) : null;
}

// Contratos de um clube. Sem `referenceDate`, retorna todos (histórico); com
// `referenceDate`, apenas os ativos naquela data (o elenco atual do clube).
function getContractsByClub(clubId, referenceDate) {
  const list = CONTRACTS.filter((contract) => contract.clubId === clubId);
  if (referenceDate == null) return list;
  return list.filter((contract) => isContractActive(contract, referenceDate));
}

// --- agentes livres -----------------------------------------------------------

// Um atleta é AGENTE LIVRE numa data se não tiver nenhum contrato ativo nela.
function isFreeAgent(athleteId, referenceDate) {
  return getActiveContractForAthlete(athleteId, referenceDate) == null;
}

// Pool de agentes livres: dentre uma lista de atletas, os sem contrato ativo na
// data de referência.
function getFreeAgents(athletes, referenceDate) {
  return athletes.filter((athlete) => isFreeAgent(athlete.id, referenceDate));
}

// --- criação, renovação e reset ----------------------------------------------

// Assina (cria) um contrato entre um atleta e um clube, com duração estipulada
// no início (1, 2 ou 3 anos). Só é possível assinar um AGENTE LIVRE: se o atleta
// já tiver contrato ativo na data de início, lança erro (um vínculo por vez).
// Retorna o contrato criado.
function signContract(athleteId, clubId, startDate, durationYears) {
  if (!isValidContractDuration(durationYears)) {
    throw new Error(
      `Duração de contrato inválida: ${durationYears}. Use 1, 2 ou 3 anos.`
    );
  }
  const start = new Date(startDate);
  if (getActiveContractForAthlete(athleteId, start)) {
    throw new Error(
      `Atleta ${athleteId} já possui contrato ativo — não pode assinar outro.`
    );
  }
  const contract = {
    id: `CTR-${_nextContractId++}`,
    athleteId,
    clubId,
    startDate: start,
    durationYears,
    endDate: contractEndDate(start, durationYears),
    renewalOf: null,
  };
  CONTRACTS.push(contract);
  return contract;
}

// Renovação PELO CLUBE: cria um novo termo para o mesmo atleta e o mesmo clube,
// começando quando o contrato atual termina (sem lacuna e sem sobreposição). A
// nova duração também é anual (1, 2 ou 3 anos). O contrato anterior permanece no
// histórico; o vínculo passa a ser o novo. Retorna o novo contrato.
function renewContract(contract, durationYears) {
  const renewed = signContract(
    contract.athleteId,
    contract.clubId,
    contract.endDate,
    durationYears
  );
  renewed.renewalOf = contract.id;
  return renewed;
}

// Zera os contratos (ex.: ao reiniciar a simulação). Mantido para o futuro fluxo
// de assinaturas; hoje a lista já nasce vazia.
function resetContracts() {
  CONTRACTS = [];
  _nextContractId = 1;
  return CONTRACTS;
}

// --- povoamento de TESTE (temporário) ----------------------------------------
// Fração dos atletas deixada como AGENTE LIVRE no seed de teste (para as telas
// terem tanto atletas contratados quanto agentes livres para mostrar).
const TEST_FREE_AGENT_RATE = 0.25;

// Assina a maioria dos atletas a um clube ALEATÓRIO do seu país, com duração
// anual sorteada (1, 2 ou 3 anos), começando na data de referência; uma fração
// (TEST_FREE_AGENT_RATE) fica como agente livre. É um povoamento de TESTE, só
// para dar dados às telas enquanto o fluxo real de contratação não existe. Deve
// ser substituído depois pelas regras de contratação (prestígio, finanças,
// decisão do clube etc. — ver TODO.md).
function seedTestContracts(athletes, referenceDate) {
  resetContracts();
  for (const athlete of athletes) {
    if (Math.random() < TEST_FREE_AGENT_RATE) continue; // fica agente livre
    const clubs = getClubsByCountry(athlete.countryId);
    if (clubs.length === 0) continue;
    const club = clubs[Math.floor(Math.random() * clubs.length)];
    const duration =
      CONTRACT_DURATIONS[Math.floor(Math.random() * CONTRACT_DURATIONS.length)];
    signContract(athlete.id, club.id, referenceDate, duration);
  }
  return CONTRACTS;
}
