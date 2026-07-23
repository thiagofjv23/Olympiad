// -----------------------------------------------------------------------------
// Entidade: Cidades (Cities)
// Relaciona-se com:
//   - Países  : cada cidade pertence a um país (countryId).
//   - Clubes  : cada clube tem uma cidade-sede (club.cityId → city).
//   - Atletas : cada atleta tem uma cidade de nascimento (athlete.birthCityId).
//
// Cada cidade possui:
//   - id                   : identificador único
//   - name                 : nome da cidade
//   - countryId            : país da cidade (ver countries.js)
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

const CITIES = {
  "CID-SAO-PAULO": {
    id: "CID-SAO-PAULO",
    name: "São Paulo",
    countryId: "BRA",
    populationEstimate: 12_300_000,
    sportsInfrastructure: 90,
  },
  "CID-RIO-DE-JANEIRO": {
    id: "CID-RIO-DE-JANEIRO",
    name: "Rio de Janeiro",
    countryId: "BRA",
    populationEstimate: 6_700_000,
    sportsInfrastructure: 92,
  },
  "CID-BRASILIA": {
    id: "CID-BRASILIA",
    name: "Brasília",
    countryId: "BRA",
    populationEstimate: 3_050_000,
    sportsInfrastructure: 80,
  },
  "CID-SALVADOR": {
    id: "CID-SALVADOR",
    name: "Salvador",
    countryId: "BRA",
    populationEstimate: 2_900_000,
    sportsInfrastructure: 74,
  },
  "CID-FORTALEZA": {
    id: "CID-FORTALEZA",
    name: "Fortaleza",
    countryId: "BRA",
    populationEstimate: 2_700_000,
    sportsInfrastructure: 70,
  },
  "CID-BELO-HORIZONTE": {
    id: "CID-BELO-HORIZONTE",
    name: "Belo Horizonte",
    countryId: "BRA",
    populationEstimate: 2_520_000,
    sportsInfrastructure: 82,
  },
  "CID-MANAUS": {
    id: "CID-MANAUS",
    name: "Manaus",
    countryId: "BRA",
    populationEstimate: 2_230_000,
    sportsInfrastructure: 68,
  },
  "CID-CURITIBA": {
    id: "CID-CURITIBA",
    name: "Curitiba",
    countryId: "BRA",
    populationEstimate: 1_960_000,
    sportsInfrastructure: 78,
  },
  "CID-RECIFE": {
    id: "CID-RECIFE",
    name: "Recife",
    countryId: "BRA",
    populationEstimate: 1_650_000,
    sportsInfrastructure: 72,
  },
  "CID-PORTO-ALEGRE": {
    id: "CID-PORTO-ALEGRE",
    name: "Porto Alegre",
    countryId: "BRA",
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
