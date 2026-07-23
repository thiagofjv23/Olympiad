// -----------------------------------------------------------------------------
// Entidade: Clubes (Clubs)
// Os clubes são responsáveis por inscrever atletas nas competições — um atleta
// só entra em uma competição através de um clube. (A mecânica de inscrição
// ainda NÃO existe; ver TODO.md.)
//
// Ao contrário dos atletas, os clubes NÃO são gerados: são uma database inicial
// com clubes reais de tradição no atletismo (etapas de 100m). Começamos com 10
// para testes — a database será expandida depois (ver TODO.md).
//
// Cada clube possui:
//   - id                  : identificador único
//   - name                : nome do clube
//   - countryId           : país do clube (ver countries.js)
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
    president: null,
    foundationYear: 1900,
    infrastructureLevel: 68,
    prestige: 60,
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
