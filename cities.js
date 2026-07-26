// -----------------------------------------------------------------------------
// Entidade: Cidades (Cities)
// Relaciona-se com:
//   - Países  : cada cidade pertence a um país (countryId).
//   - Estados : cada cidade pertence a um estado (stateId → states.js). A
//               hierarquia completa é país → região → estado → cidade.
//   - Clubes  : cada clube tem uma cidade-sede (club.cityId → city).
//   - Atletas : cada atleta tem uma cidade de nascimento (athlete.birthCityId).
//
// Cada cidade possui:
//   - id                   : identificador único
//   - name                 : nome da cidade
//   - countryId            : país da cidade (ver countries.js)
//   - stateId              : estado da cidade (ver states.js). A região e o país
//                            são deriváveis via estado; countryId é mantido para
//                            filtragem direta por país.
//   - populationEstimate   : população estimada (base para o tamanho)
//   - size                 : tamanho — derivado da população
//                            (pequena | média | grande | metrópole)
//   - sportsInfrastructure : infraestrutura esportiva (0-100), influenciada
//                            pela força olímpica do país
//
// Os princípios de criação/geração de cidades estão em PRINCIPIOS_CIDADES.md
// (ex.: 10 cidades por país implantado, no início). Este conjunto inicial são
// 10 cidades reais do Brasil.
// -----------------------------------------------------------------------------

// Faixas de tamanho por população estimada (do maior para o menor).
const CITY_SIZE_THRESHOLDS = [
  { size: "metrópole", min: 2_000_000 },
  { size: "grande", min: 500_000 },
  { size: "média", min: 100_000 },
  { size: "pequena", min: 0 },
];

// Deriva o tamanho da cidade a partir da população estimada.
function citySizeFromPopulation(population) {
  for (const threshold of CITY_SIZE_THRESHOLDS) {
    if (population >= threshold.min) return threshold.size;
  }
  return "pequena";
}

// Peso de cada tamanho de cidade. Usado, por exemplo, para sortear a cidade de
// nascimento dos atletas: quanto maior a cidade, maior a chance (proporção).
const CITY_SIZE_WEIGHTS = {
  pequena: 1,
  "média": 2,
  grande: 4,
  "metrópole": 8,
};

// Retorna o peso de um tamanho de cidade (1 se desconhecido).
function citySizeWeight(size) {
  return CITY_SIZE_WEIGHTS[size] || 1;
}

const CITIES = {
  "CID-SAO-PAULO": {
    id: "CID-SAO-PAULO",
    name: "São Paulo",
    countryId: "BRA",
    stateId: "EST-SP",
    populationEstimate: 12_300_000,
    sportsInfrastructure: 90,
  },
  "CID-RIO-DE-JANEIRO": {
    id: "CID-RIO-DE-JANEIRO",
    name: "Rio de Janeiro",
    countryId: "BRA",
    stateId: "EST-RJ",
    populationEstimate: 6_700_000,
    sportsInfrastructure: 92,
  },
  "CID-BRASILIA": {
    id: "CID-BRASILIA",
    name: "Brasília",
    countryId: "BRA",
    stateId: "EST-DF",
    populationEstimate: 3_050_000,
    sportsInfrastructure: 80,
  },
  "CID-SALVADOR": {
    id: "CID-SALVADOR",
    name: "Salvador",
    countryId: "BRA",
    stateId: "EST-BA",
    populationEstimate: 2_900_000,
    sportsInfrastructure: 74,
  },
  "CID-FORTALEZA": {
    id: "CID-FORTALEZA",
    name: "Fortaleza",
    countryId: "BRA",
    stateId: "EST-CE",
    populationEstimate: 2_700_000,
    sportsInfrastructure: 70,
  },
  "CID-BELO-HORIZONTE": {
    id: "CID-BELO-HORIZONTE",
    name: "Belo Horizonte",
    countryId: "BRA",
    stateId: "EST-MG",
    populationEstimate: 2_520_000,
    sportsInfrastructure: 82,
  },
  "CID-MANAUS": {
    id: "CID-MANAUS",
    name: "Manaus",
    countryId: "BRA",
    stateId: "EST-AM",
    populationEstimate: 2_230_000,
    sportsInfrastructure: 68,
  },
  "CID-CURITIBA": {
    id: "CID-CURITIBA",
    name: "Curitiba",
    countryId: "BRA",
    stateId: "EST-PR",
    populationEstimate: 1_960_000,
    sportsInfrastructure: 78,
  },
  "CID-RECIFE": {
    id: "CID-RECIFE",
    name: "Recife",
    countryId: "BRA",
    stateId: "EST-PE",
    populationEstimate: 1_650_000,
    sportsInfrastructure: 72,
  },
  "CID-PORTO-ALEGRE": {
    id: "CID-PORTO-ALEGRE",
    name: "Porto Alegre",
    countryId: "BRA",
    stateId: "EST-RS",
    populationEstimate: 1_490_000,
    sportsInfrastructure: 80,
  },
};

// Deriva o tamanho de cada cidade a partir da população estimada.
for (const city of Object.values(CITIES)) {
  city.size = citySizeFromPopulation(city.populationEstimate);
}

// Busca uma cidade pelo id. Retorna undefined se não existir.
function getCity(id) {
  return CITIES[id];
}

// Retorna todas as cidades de um país.
function getCitiesByCountry(countryId) {
  return Object.values(CITIES).filter((city) => city.countryId === countryId);
}

// Retorna todas as cidades de um estado.
function getCitiesByState(stateId) {
  return Object.values(CITIES).filter((city) => city.stateId === stateId);
}

// Estado de uma cidade (objeto de states.js) ou undefined.
function getCityState(city) {
  return city ? getState(city.stateId) : undefined;
}

// Região de uma cidade (objeto de regions.js), derivada via estado, ou undefined.
function getCityRegion(city) {
  const state = getCityState(city);
  return state ? getStateRegion(state) : undefined;
}
