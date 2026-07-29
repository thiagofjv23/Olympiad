// -----------------------------------------------------------------------------
// Entidade: Clubes (Clubs)
// Os clubes são responsáveis por inscrever atletas nas competições — um atleta
// só entra em uma competição através de um clube. (A mecânica de inscrição
// ainda NÃO existe; ver TODO.md.)
//
// Ao contrário dos atletas, os clubes NÃO são gerados: são uma database inicial
// com clubes reais de tradição no atletismo (etapas de 100m). Começamos com 10 e
// depois cada cidade que ainda não tinha clube recebeu 2 (mesmos parâmetros),
// totalizando 22 — todos do Brasil. A database será expandida depois (ver
// TODO.md).
//
// Cada clube possui:
//   - id                  : identificador único
//   - name                : nome do clube
//   - countryId           : país do clube (ver countries.js)
//   - cityId              : cidade-sede do clube (ver cities.js)
//   - president           : presidente — ainda não utilizado (ver TODO.md)
//   - foundationYear      : ano de fundação
//   - infrastructureLevel : nível de infraestrutura (0-100), definido
//                           considerando a força olímpica do país
//   - prestige            : prestígio (0-100). Ainda NÃO é utilizado; servirá de
//                           base para futuras features (Finanças, contratações e
//                           ordenamento de clubes) — ver TODO.md.
//   - finances            : finanças — ainda não utilizado (ver TODO.md)
//   - rivals              : clubes rivais (ids) — a evoluir (ver TODO.md)
//
// Observação: todos são do Brasil (BRA), único país existente por enquanto, e
// são clubes multiesportivos reais com tradição no atletismo brasileiro. Este
// é um conjunto inicial de teste, a ser revisado e ampliado.
// -----------------------------------------------------------------------------

const CLUBS = {
  "CLB-PINHEIROS": {
    id: "CLB-PINHEIROS",
    name: "Esporte Clube Pinheiros",
    countryId: "BRA",
    cityId: "CID-SAO-PAULO",
    president: null,
    foundationYear: 1899,
    infrastructureLevel: 90,
    prestige: 80,
    finances: null,
    rivals: [],
  },
  "CLB-SOGIPA": {
    id: "CLB-SOGIPA",
    name: "Sociedade de Ginástica Porto Alegre (Sogipa)",
    countryId: "BRA",
    cityId: "CID-PORTO-ALEGRE",
    president: null,
    foundationYear: 1867,
    infrastructureLevel: 85,
    prestige: 70,
    finances: null,
    rivals: [],
  },
  "CLB-GNU": {
    id: "CLB-GNU",
    name: "Grêmio Náutico União",
    countryId: "BRA",
    cityId: "CID-PORTO-ALEGRE",
    president: null,
    foundationYear: 1906,
    infrastructureLevel: 80,
    prestige: 62,
    finances: null,
    rivals: [],
  },
  "CLB-MINAS": {
    id: "CLB-MINAS",
    name: "Minas Tênis Clube",
    countryId: "BRA",
    cityId: "CID-BELO-HORIZONTE",
    president: null,
    foundationYear: 1935,
    infrastructureLevel: 88,
    prestige: 78,
    finances: null,
    rivals: [],
  },
  "CLB-FLAMENGO": {
    id: "CLB-FLAMENGO",
    name: "Clube de Regatas do Flamengo",
    countryId: "BRA",
    cityId: "CID-RIO-DE-JANEIRO",
    president: null,
    foundationYear: 1895,
    infrastructureLevel: 82,
    prestige: 92,
    finances: null,
    rivals: [],
  },
  "CLB-VASCO": {
    id: "CLB-VASCO",
    name: "Club de Regatas Vasco da Gama",
    countryId: "BRA",
    cityId: "CID-RIO-DE-JANEIRO",
    president: null,
    foundationYear: 1898,
    infrastructureLevel: 74,
    prestige: 78,
    finances: null,
    rivals: [],
  },
  "CLB-BOTAFOGO": {
    id: "CLB-BOTAFOGO",
    name: "Botafogo de Futebol e Regatas",
    countryId: "BRA",
    cityId: "CID-RIO-DE-JANEIRO",
    president: null,
    foundationYear: 1894,
    infrastructureLevel: 70,
    prestige: 74,
    finances: null,
    rivals: [],
  },
  "CLB-FLUMINENSE": {
    id: "CLB-FLUMINENSE",
    name: "Fluminense Football Club",
    countryId: "BRA",
    cityId: "CID-RIO-DE-JANEIRO",
    president: null,
    foundationYear: 1902,
    infrastructureLevel: 72,
    prestige: 75,
    finances: null,
    rivals: [],
  },
  "CLB-CORINTHIANS": {
    id: "CLB-CORINTHIANS",
    name: "Sport Club Corinthians Paulista",
    countryId: "BRA",
    cityId: "CID-SAO-PAULO",
    president: null,
    foundationYear: 1910,
    infrastructureLevel: 78,
    prestige: 90,
    finances: null,
    rivals: [],
  },
  "CLB-PAULISTANO": {
    id: "CLB-PAULISTANO",
    name: "Clube Atlético Paulistano",
    countryId: "BRA",
    cityId: "CID-SAO-PAULO",
    president: null,
    foundationYear: 1900,
    infrastructureLevel: 68,
    prestige: 60,
    finances: null,
    rivals: [],
  },

  // --- Clubes das demais cidades (2 por cidade que ainda não tinha clube) ------
  // Mesmos parâmetros dos anteriores: clubes reais de tradição, com
  // infraestrutura próxima à da cidade-sede (considerando a força olímpica do
  // país) e prestígio dentro da mesma faixa. Todos do Brasil.

  // Brasília (CID-BRASILIA, infra da cidade 80)
  "CLB-GAMA": {
    id: "CLB-GAMA",
    name: "Sociedade Esportiva do Gama",
    countryId: "BRA",
    cityId: "CID-BRASILIA",
    president: null,
    foundationYear: 1938,
    infrastructureLevel: 78,
    prestige: 62,
    finances: null,
    rivals: [],
  },
  "CLB-BRASILIENSE": {
    id: "CLB-BRASILIENSE",
    name: "Brasiliense Futebol Clube",
    countryId: "BRA",
    cityId: "CID-BRASILIA",
    president: null,
    foundationYear: 2000,
    infrastructureLevel: 76,
    prestige: 60,
    finances: null,
    rivals: [],
  },

  // Salvador (CID-SALVADOR, infra da cidade 74)
  "CLB-BAHIA": {
    id: "CLB-BAHIA",
    name: "Esporte Clube Bahia",
    countryId: "BRA",
    cityId: "CID-SALVADOR",
    president: null,
    foundationYear: 1931,
    infrastructureLevel: 76,
    prestige: 78,
    finances: null,
    rivals: [],
  },
  "CLB-VITORIA": {
    id: "CLB-VITORIA",
    name: "Esporte Clube Vitória",
    countryId: "BRA",
    cityId: "CID-SALVADOR",
    president: null,
    foundationYear: 1899,
    infrastructureLevel: 72,
    prestige: 72,
    finances: null,
    rivals: [],
  },

  // Fortaleza (CID-FORTALEZA, infra da cidade 70)
  "CLB-FORTALEZA": {
    id: "CLB-FORTALEZA",
    name: "Fortaleza Esporte Clube",
    countryId: "BRA",
    cityId: "CID-FORTALEZA",
    president: null,
    foundationYear: 1918,
    infrastructureLevel: 72,
    prestige: 74,
    finances: null,
    rivals: [],
  },
  "CLB-CEARA": {
    id: "CLB-CEARA",
    name: "Ceará Sporting Club",
    countryId: "BRA",
    cityId: "CID-FORTALEZA",
    president: null,
    foundationYear: 1914,
    infrastructureLevel: 70,
    prestige: 72,
    finances: null,
    rivals: [],
  },

  // Manaus (CID-MANAUS, infra da cidade 68)
  "CLB-NACIONAL-AM": {
    id: "CLB-NACIONAL-AM",
    name: "Nacional Futebol Clube (AM)",
    countryId: "BRA",
    cityId: "CID-MANAUS",
    president: null,
    foundationYear: 1913,
    infrastructureLevel: 70,
    prestige: 64,
    finances: null,
    rivals: [],
  },
  "CLB-FAST": {
    id: "CLB-FAST",
    name: "Fast Clube",
    countryId: "BRA",
    cityId: "CID-MANAUS",
    president: null,
    foundationYear: 1930,
    infrastructureLevel: 68,
    prestige: 60,
    finances: null,
    rivals: [],
  },

  // Curitiba (CID-CURITIBA, infra da cidade 78)
  "CLB-CORITIBA": {
    id: "CLB-CORITIBA",
    name: "Coritiba Foot Ball Club",
    countryId: "BRA",
    cityId: "CID-CURITIBA",
    president: null,
    foundationYear: 1909,
    infrastructureLevel: 80,
    prestige: 76,
    finances: null,
    rivals: [],
  },
  "CLB-ATHLETICO-PR": {
    id: "CLB-ATHLETICO-PR",
    name: "Club Athletico Paranaense",
    countryId: "BRA",
    cityId: "CID-CURITIBA",
    president: null,
    foundationYear: 1924,
    infrastructureLevel: 82,
    prestige: 80,
    finances: null,
    rivals: [],
  },

  // Recife (CID-RECIFE, infra da cidade 72)
  "CLB-SPORT-RECIFE": {
    id: "CLB-SPORT-RECIFE",
    name: "Sport Club do Recife",
    countryId: "BRA",
    cityId: "CID-RECIFE",
    president: null,
    foundationYear: 1905,
    infrastructureLevel: 74,
    prestige: 76,
    finances: null,
    rivals: [],
  },
  "CLB-NAUTICO": {
    id: "CLB-NAUTICO",
    name: "Clube Náutico Capibaribe",
    countryId: "BRA",
    cityId: "CID-RECIFE",
    president: null,
    foundationYear: 1901,
    infrastructureLevel: 72,
    prestige: 70,
    finances: null,
    rivals: [],
  },
};

// Busca um clube pelo id. Retorna undefined se não existir.
function getClub(id) {
  return CLUBS[id];
}

// Retorna todos os clubes de um país.
function getClubsByCountry(countryId) {
  return Object.values(CLUBS).filter((club) => club.countryId === countryId);
}

// Retorna todos os clubes (de todos os países).
function getAllClubs() {
  return Object.values(CLUBS);
}
