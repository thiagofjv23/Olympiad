// -----------------------------------------------------------------------------
// Entidade: Países (Countries)
//
// Cada país possui:
//   - id              : identificador único (o próprio código do COI, ex.: "BRA")
//   - name            : nome do país (ex.: "Brasil")
//   - iocCode         : código do COI (usado no nome dos atletas, ex.: "(BRA)")
//   - population      : população estimada (real aproximada, para simulação)
//   - olympicStrength : rating de "força olímpica" (0-100)
//   - continentId     : continente ao qual pertence (ver continents.js) —
//                       completa a hierarquia Mundo → Continente → País
//
// Database inicial: 55 países/entidades olímpicas, agrupados por continente
// (fonte: lista fornecida). Só a entidade País é modelada para todos; regiões,
// estados, cidades, clubes e atletas continuam existindo apenas onde já foram
// desenhados (por ora, o Brasil) — ver TODO.md. As populações são estimativas
// aproximadas, no mesmo espírito dos valores de Brasil/Argentina.
// -----------------------------------------------------------------------------

const COUNTRIES = {
  // === América do Sul (CONT-AMERICA-SUL) =====================================
  BRA: {
    id: "BRA",
    name: "Brasil",
    iocCode: "BRA",
    population: 213_421_037,
    olympicStrength: 78,
    continentId: "CONT-AMERICA-SUL",
  },
  ARG: {
    id: "ARG",
    name: "Argentina",
    iocCode: "ARG",
    population: 45_808_747,
    olympicStrength: 70,
    continentId: "CONT-AMERICA-SUL",
  },
  COL: {
    id: "COL",
    name: "Colômbia",
    iocCode: "COL",
    population: 52_000_000,
    olympicStrength: 68,
    continentId: "CONT-AMERICA-SUL",
  },
  ECU: {
    id: "ECU",
    name: "Equador",
    iocCode: "ECU",
    population: 18_000_000,
    olympicStrength: 64,
    continentId: "CONT-AMERICA-SUL",
  },
  CHI: {
    id: "CHI",
    name: "Chile",
    iocCode: "CHI",
    population: 19_600_000,
    olympicStrength: 62,
    continentId: "CONT-AMERICA-SUL",
  },
  VEN: {
    id: "VEN",
    name: "Venezuela",
    iocCode: "VEN",
    population: 28_300_000,
    olympicStrength: 61,
    continentId: "CONT-AMERICA-SUL",
  },
  URU: {
    id: "URU",
    name: "Uruguai",
    iocCode: "URU",
    population: 3_400_000,
    olympicStrength: 58,
    continentId: "CONT-AMERICA-SUL",
  },
  PER: {
    id: "PER",
    name: "Peru",
    iocCode: "PER",
    population: 34_000_000,
    olympicStrength: 55,
    continentId: "CONT-AMERICA-SUL",
  },
  PAR: {
    id: "PAR",
    name: "Paraguai",
    iocCode: "PAR",
    population: 6_700_000,
    olympicStrength: 49,
    continentId: "CONT-AMERICA-SUL",
  },
  BOL: {
    id: "BOL",
    name: "Bolívia",
    iocCode: "BOL",
    population: 12_000_000,
    olympicStrength: 43,
    continentId: "CONT-AMERICA-SUL",
  },

  // === América do Norte, Central e Caribe (CONT-AMERICA-NORTE) ===============
  USA: {
    id: "USA",
    name: "Estados Unidos",
    iocCode: "USA",
    population: 335_000_000,
    olympicStrength: 100,
    continentId: "CONT-AMERICA-NORTE",
  },
  CAN: {
    id: "CAN",
    name: "Canadá",
    iocCode: "CAN",
    population: 39_000_000,
    olympicStrength: 89,
    continentId: "CONT-AMERICA-NORTE",
  },
  CUB: {
    id: "CUB",
    name: "Cuba",
    iocCode: "CUB",
    population: 11_200_000,
    olympicStrength: 83,
    continentId: "CONT-AMERICA-NORTE",
  },
  MEX: {
    id: "MEX",
    name: "México",
    iocCode: "MEX",
    population: 128_000_000,
    olympicStrength: 76,
    continentId: "CONT-AMERICA-NORTE",
  },
  JAM: {
    id: "JAM",
    name: "Jamaica",
    iocCode: "JAM",
    population: 2_800_000,
    olympicStrength: 72,
    continentId: "CONT-AMERICA-NORTE",
  },
  DOM: {
    id: "DOM",
    name: "República Dominicana",
    iocCode: "DOM",
    population: 11_200_000,
    olympicStrength: 65,
    continentId: "CONT-AMERICA-NORTE",
  },
  TTO: {
    id: "TTO",
    name: "Trinidad e Tobago",
    iocCode: "TTO",
    population: 1_500_000,
    olympicStrength: 63,
    continentId: "CONT-AMERICA-NORTE",
  },
  BAH: {
    id: "BAH",
    name: "Bahamas",
    iocCode: "BAH",
    population: 410_000,
    olympicStrength: 62,
    continentId: "CONT-AMERICA-NORTE",
  },
  PUR: {
    id: "PUR",
    name: "Porto Rico",
    iocCode: "PUR",
    population: 3_200_000,
    olympicStrength: 61,
    continentId: "CONT-AMERICA-NORTE",
  },
  PAN: {
    id: "PAN",
    name: "Panamá",
    iocCode: "PAN",
    population: 4_400_000,
    olympicStrength: 52,
    continentId: "CONT-AMERICA-NORTE",
  },

  // === África (CONT-AFRICA) ==================================================
  RSA: {
    id: "RSA",
    name: "África do Sul",
    iocCode: "RSA",
    population: 60_000_000,
    olympicStrength: 76,
    continentId: "CONT-AFRICA",
  },
  KEN: {
    id: "KEN",
    name: "Quênia",
    iocCode: "KEN",
    population: 54_000_000,
    olympicStrength: 74,
    continentId: "CONT-AFRICA",
  },
  ETH: {
    id: "ETH",
    name: "Etiópia",
    iocCode: "ETH",
    population: 123_000_000,
    olympicStrength: 71,
    continentId: "CONT-AFRICA",
  },
  EGY: {
    id: "EGY",
    name: "Egito",
    iocCode: "EGY",
    population: 110_000_000,
    olympicStrength: 69,
    continentId: "CONT-AFRICA",
  },
  ALG: {
    id: "ALG",
    name: "Argélia",
    iocCode: "ALG",
    population: 45_000_000,
    olympicStrength: 67,
    continentId: "CONT-AFRICA",
  },
  MAR: {
    id: "MAR",
    name: "Marrocos",
    iocCode: "MAR",
    population: 37_000_000,
    olympicStrength: 66,
    continentId: "CONT-AFRICA",
  },
  TUN: {
    id: "TUN",
    name: "Tunísia",
    iocCode: "TUN",
    population: 12_000_000,
    olympicStrength: 65,
    continentId: "CONT-AFRICA",
  },
  UGA: {
    id: "UGA",
    name: "Uganda",
    iocCode: "UGA",
    population: 47_000_000,
    olympicStrength: 64,
    continentId: "CONT-AFRICA",
  },
  NGR: {
    id: "NGR",
    name: "Nigéria",
    iocCode: "NGR",
    population: 223_000_000,
    olympicStrength: 63,
    continentId: "CONT-AFRICA",
  },
  ZIM: {
    id: "ZIM",
    name: "Zimbábue",
    iocCode: "ZIM",
    population: 16_300_000,
    olympicStrength: 57,
    continentId: "CONT-AFRICA",
  },

  // === Ásia (CONT-ASIA) ======================================================
  CHN: {
    id: "CHN",
    name: "China",
    iocCode: "CHN",
    population: 1_412_000_000,
    olympicStrength: 98,
    continentId: "CONT-ASIA",
  },
  JPN: {
    id: "JPN",
    name: "Japão",
    iocCode: "JPN",
    population: 124_000_000,
    olympicStrength: 92,
    continentId: "CONT-ASIA",
  },
  KOR: {
    id: "KOR",
    name: "Coreia do Sul",
    iocCode: "KOR",
    population: 51_700_000,
    olympicStrength: 90,
    continentId: "CONT-ASIA",
  },
  IRI: {
    id: "IRI",
    name: "Irã",
    iocCode: "IRI",
    population: 88_000_000,
    olympicStrength: 82,
    continentId: "CONT-ASIA",
  },
  UZB: {
    id: "UZB",
    name: "Uzbequistão",
    iocCode: "UZB",
    population: 35_600_000,
    olympicStrength: 79,
    continentId: "CONT-ASIA",
  },
  KAZ: {
    id: "KAZ",
    name: "Cazaquistão",
    iocCode: "KAZ",
    population: 19_600_000,
    olympicStrength: 78,
    continentId: "CONT-ASIA",
  },
  TPE: {
    id: "TPE",
    name: "Taipé Chinês",
    iocCode: "TPE",
    population: 23_400_000,
    olympicStrength: 77,
    continentId: "CONT-ASIA",
  },
  IND: {
    id: "IND",
    name: "Índia",
    iocCode: "IND",
    population: 1_428_000_000,
    olympicStrength: 75,
    continentId: "CONT-ASIA",
  },
  THA: {
    id: "THA",
    name: "Tailândia",
    iocCode: "THA",
    population: 71_800_000,
    olympicStrength: 73,
    continentId: "CONT-ASIA",
  },
  PRK: {
    id: "PRK",
    name: "Coreia do Norte",
    iocCode: "PRK",
    population: 26_000_000,
    olympicStrength: 71,
    continentId: "CONT-ASIA",
  },

  // === Oceania (CONT-OCEANIA) ================================================
  AUS: {
    id: "AUS",
    name: "Austrália",
    iocCode: "AUS",
    population: 26_000_000,
    olympicStrength: 94,
    continentId: "CONT-OCEANIA",
  },
  NZL: {
    id: "NZL",
    name: "Nova Zelândia",
    iocCode: "NZL",
    population: 5_200_000,
    olympicStrength: 88,
    continentId: "CONT-OCEANIA",
  },
  FIJ: {
    id: "FIJ",
    name: "Fiji",
    iocCode: "FIJ",
    population: 925_000,
    olympicStrength: 60,
    continentId: "CONT-OCEANIA",
  },
  SAM: {
    id: "SAM",
    name: "Samoa",
    iocCode: "SAM",
    population: 220_000,
    olympicStrength: 50,
    continentId: "CONT-OCEANIA",
  },
  TGA: {
    id: "TGA",
    name: "Tonga",
    iocCode: "TGA",
    population: 105_000,
    olympicStrength: 48,
    continentId: "CONT-OCEANIA",
  },

  // === Europa (CONT-EUROPA) ==================================================
  GBR: {
    id: "GBR",
    name: "Reino Unido",
    iocCode: "GBR",
    population: 67_700_000,
    olympicStrength: 95,
    continentId: "CONT-EUROPA",
  },
  GER: {
    id: "GER",
    name: "Alemanha",
    iocCode: "GER",
    population: 84_000_000,
    olympicStrength: 94,
    continentId: "CONT-EUROPA",
  },
  FRA: {
    id: "FRA",
    name: "França",
    iocCode: "FRA",
    population: 68_000_000,
    olympicStrength: 94,
    continentId: "CONT-EUROPA",
  },
  ITA: {
    id: "ITA",
    name: "Itália",
    iocCode: "ITA",
    population: 59_000_000,
    olympicStrength: 93,
    continentId: "CONT-EUROPA",
  },
  RUS: {
    id: "RUS",
    name: "Rússia",
    iocCode: "RUS",
    population: 144_000_000,
    olympicStrength: 93,
    continentId: "CONT-EUROPA",
  },
  NED: {
    id: "NED",
    name: "Países Baixos",
    iocCode: "NED",
    population: 17_800_000,
    olympicStrength: 92,
    continentId: "CONT-EUROPA",
  },
  HUN: {
    id: "HUN",
    name: "Hungria",
    iocCode: "HUN",
    population: 9_600_000,
    olympicStrength: 89,
    continentId: "CONT-EUROPA",
  },
  ESP: {
    id: "ESP",
    name: "Espanha",
    iocCode: "ESP",
    population: 48_000_000,
    olympicStrength: 88,
    continentId: "CONT-EUROPA",
  },
  POL: {
    id: "POL",
    name: "Polônia",
    iocCode: "POL",
    population: 37_700_000,
    olympicStrength: 87,
    continentId: "CONT-EUROPA",
  },
  ROU: {
    id: "ROU",
    name: "Romênia",
    iocCode: "ROU",
    population: 19_000_000,
    olympicStrength: 86,
    continentId: "CONT-EUROPA",
  },
};

// Busca um país pelo id. Retorna undefined se não existir.
function getCountry(id) {
  return COUNTRIES[id];
}

// Retorna todos os países.
function getAllCountries() {
  return Object.values(COUNTRIES);
}

// Retorna todos os países de um continente (ver continents.js).
function getCountriesByContinent(continentId) {
  return Object.values(COUNTRIES).filter(
    (country) => country.continentId === continentId
  );
}

// O continente de um país (derivado do continentId). Retorna undefined se o país
// não tiver continente ou ele não existir.
function getCountryContinent(country) {
  return country ? getContinent(country.continentId) : undefined;
}
