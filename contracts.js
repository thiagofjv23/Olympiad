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

// -----------------------------------------------------------------------------
// Índices derivados (aceleradores de consulta)
// Cache de CONTRACTS agrupado por chave, para não varrer TODA a lista a cada
// pergunta ("contrato ativo do atleta X?", "elenco do clube Y?"). Com milhares
// de contratos, a varredura linear repetida (uma por atleta na tela) vira custo
// quadrático — ver DECISOES.md. NÃO são uma segunda fonte de verdade: a situação
// ativo/encerrado continua DERIVADA das datas (isContractActive); estes mapas só
// agrupam os mesmos contratos por atleta e por clube.
//   - _contractsByAthlete : athleteId -> lista de contratos daquele atleta
//   - _contractsByClub    : clubId    -> lista de contratos daquele clube
// Mantidos em sincronia por _indexContract (a cada assinatura) e resetContracts.
// -----------------------------------------------------------------------------
const _contractsByAthlete = new Map();
const _contractsByClub = new Map();

// Registra um contrato recém-criado nos índices (por atleta e por clube).
function _indexContract(contract) {
  if (!_contractsByAthlete.has(contract.athleteId)) {
    _contractsByAthlete.set(contract.athleteId, []);
  }
  _contractsByAthlete.get(contract.athleteId).push(contract);
  if (!_contractsByClub.has(contract.clubId)) {
    _contractsByClub.set(contract.clubId, []);
  }
  _contractsByClub.get(contract.clubId).push(contract);
}

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

// Contrato ativo de um atleta numa data (o seu vínculo atual) ou null. Olha só
// os contratos daquele atleta (via índice), em vez de varrer toda a lista.
function getActiveContractForAthlete(athleteId, referenceDate) {
  const list = _contractsByAthlete.get(athleteId);
  if (!list) return null;
  return (
    list.find((contract) => isContractActive(contract, referenceDate)) || null
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
  const list = _contractsByClub.get(clubId) || [];
  if (referenceDate == null) return list.slice(); // cópia do histórico do clube
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
  _indexContract(contract); // mantém os índices por atleta/por clube em sincronia
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
  _contractsByAthlete.clear();
  _contractsByClub.clear();
  return CONTRACTS;
}

// --- povoamento de TESTE (temporário) ----------------------------------------
// Fração dos atletas deixada como AGENTE LIVRE no seed de teste (para as telas
// terem tanto atletas contratados quanto agentes livres para mostrar).
const TEST_FREE_AGENT_RATE = 0.25;

// Afinidade com a CIDADE-SEDE: quando o clube é da MESMA cidade de nascimento do
// atleta, o peso do clube é multiplicado por este fator — dando ao atleta uma
// chance BEM MAIOR de assinar com um clube da sua cidade. É apenas um PESO (não
// uma regra fixa): aumenta muito a probabilidade do clube local, mas NÃO a
// garante (clubes de outras cidades continuam possíveis) e NÃO interfere na
// chance de o atleta ficar sem clube — a agência livre é decidida à parte, antes
// da escolha do clube (TEST_FREE_AGENT_RATE). Valor de balanceamento (teste).
const TEST_SAME_CITY_AFFINITY = 8;

// Peso de um clube para um atleta no sorteio do seed. Base = NÍVEL DE
// INFRAESTRUTURA (mais infraestrutura → mais atletas; menos → menos),
// multiplicado pela AFINIDADE DE CIDADE quando o clube é da mesma cidade de
// nascimento do atleta. Sem atleta (ou sem cidade), usa só a infraestrutura.
function clubSeedWeight(club, athlete) {
  const infra = Math.max(0, club.infrastructureLevel || 0);
  const sameCity =
    athlete != null && club.cityId != null && club.cityId === athlete.birthCityId;
  return infra * (sameCity ? TEST_SAME_CITY_AFFINITY : 1);
}

// Sorteia um clube dentre uma lista PONDERANDO por (1) nível de infraestrutura e
// (2) afinidade com a cidade de nascimento do atleta (clube da mesma cidade tem
// chance bem maior). Segue o mesmo estilo do sorteio ponderado da cidade de
// nascimento (randomBirthCityId em athletes.js). Retorna null se a lista estiver
// vazia; se a soma dos pesos for 0 (todas as infra zeradas), cai para um sorteio
// uniforme.
function pickClubForAthlete(clubs, athlete) {
  if (clubs.length === 0) return null;

  const totalWeight = clubs.reduce(
    (sum, club) => sum + clubSeedWeight(club, athlete),
    0
  );

  if (totalWeight <= 0) {
    return clubs[Math.floor(Math.random() * clubs.length)];
  }

  let pick = Math.random() * totalWeight;
  for (const club of clubs) {
    pick -= clubSeedWeight(club, athlete);
    if (pick < 0) return club;
  }
  return clubs[clubs.length - 1];
}

// Assina a maioria dos atletas a um clube do seu país — sorteado PONDERANDO pelo
// NÍVEL DE INFRAESTRUTURA do clube (mais infraestrutura → mais atletas; menos →
// menos) E pela AFINIDADE COM A CIDADE de nascimento (chance bem maior de ir a um
// clube da sua cidade), via pickClubForAthlete — com duração anual sorteada (1, 2
// ou 3 anos), começando na data de referência; uma fração (TEST_FREE_AGENT_RATE)
// fica como agente livre. É um povoamento de TESTE, só para dar dados às telas
// enquanto o fluxo real de contratação não existe. Deve ser substituído depois
// pelas regras de contratação (prestígio, finanças, decisão do clube etc. — ver
// TODO.md).
function seedTestContracts(athletes, referenceDate) {
  resetContracts();
  for (const athlete of athletes) {
    if (Math.random() < TEST_FREE_AGENT_RATE) continue; // fica agente livre
    const clubs = getClubsByCountry(athlete.countryId);
    if (clubs.length === 0) continue;
    const club = pickClubForAthlete(clubs, athlete);
    const duration =
      CONTRACT_DURATIONS[Math.floor(Math.random() * CONTRACT_DURATIONS.length)];
    signContract(athlete.id, club.id, referenceDate, duration);
  }
  return CONTRACTS;
}
