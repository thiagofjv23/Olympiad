// -----------------------------------------------------------------------------
// Entidade: Estados (States)
//
// Nível geográfico ENTRE a região e a cidade, formando a hierarquia:
//   país (countries.js) → região (regions.js) → ESTADO (este arquivo) → cidade (cities.js)
//
// Um estado pertence a uma região (regionId) e a um país (countryId). É a base do
// porte ESTADUAL do calendário de competições (ver competitionCategories.js e
// CALENDARIO_DE_COMPETICOES.md): uma competição estadual acontece dentro de um
// estado.
//
// Cada estado possui:
//   - id           : identificador único (ex.: "EST-RJ")
//   - name         : nome do estado (ex.: "Rio de Janeiro")
//   - abbreviation : sigla (ex.: "RJ")
//   - countryId    : país do estado (ver countries.js). Redundante com a região
//                    (país é derivável via regionId), mas guardado direto para
//                    filtragem por país, no mesmo estilo de cidades/clubes.
//   - regionId     : região do estado (ver regions.js)
//
// Conjunto inicial: os estados das cidades já cadastradas (ver cities.js) — 10
// estados cobrindo as 5 regiões. NÃO é o conjunto completo das 27 unidades
// federativas do Brasil; ampliar depois (mesmo espírito das "10 cidades de
// teste" — ver TODO.md).
// -----------------------------------------------------------------------------

const STATES = {
  "EST-AM": {
    id: "EST-AM",
    name: "Amazonas",
    abbreviation: "AM",
    countryId: "BRA",
    regionId: "REG-NORTE",
  },
  "EST-BA": {
    id: "EST-BA",
    name: "Bahia",
    abbreviation: "BA",
    countryId: "BRA",
    regionId: "REG-NORDESTE",
  },
  "EST-CE": {
    id: "EST-CE",
    name: "Ceará",
    abbreviation: "CE",
    countryId: "BRA",
    regionId: "REG-NORDESTE",
  },
  "EST-PE": {
    id: "EST-PE",
    name: "Pernambuco",
    abbreviation: "PE",
    countryId: "BRA",
    regionId: "REG-NORDESTE",
  },
  "EST-DF": {
    id: "EST-DF",
    name: "Distrito Federal",
    abbreviation: "DF",
    countryId: "BRA",
    regionId: "REG-CENTRO-OESTE",
  },
  "EST-SP": {
    id: "EST-SP",
    name: "São Paulo",
    abbreviation: "SP",
    countryId: "BRA",
    regionId: "REG-SUDESTE",
  },
  "EST-RJ": {
    id: "EST-RJ",
    name: "Rio de Janeiro",
    abbreviation: "RJ",
    countryId: "BRA",
    regionId: "REG-SUDESTE",
  },
  "EST-MG": {
    id: "EST-MG",
    name: "Minas Gerais",
    abbreviation: "MG",
    countryId: "BRA",
    regionId: "REG-SUDESTE",
  },
  "EST-PR": {
    id: "EST-PR",
    name: "Paraná",
    abbreviation: "PR",
    countryId: "BRA",
    regionId: "REG-SUL",
  },
  "EST-RS": {
    id: "EST-RS",
    name: "Rio Grande do Sul",
    abbreviation: "RS",
    countryId: "BRA",
    regionId: "REG-SUL",
  },
};

// Busca um estado pelo id. Retorna undefined se não existir.
function getState(id) {
  return STATES[id];
}

// Retorna todos os estados de um país.
function getStatesByCountry(countryId) {
  return Object.values(STATES).filter((state) => state.countryId === countryId);
}

// Retorna todos os estados de uma região.
function getStatesByRegion(regionId) {
  return Object.values(STATES).filter((state) => state.regionId === regionId);
}

// Região de um estado (objeto de regions.js) ou undefined.
function getStateRegion(state) {
  return getRegion(state.regionId);
}

// Retorna todos os estados.
function getAllStates() {
  return Object.values(STATES);
}
