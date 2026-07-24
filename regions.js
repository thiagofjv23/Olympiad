// -----------------------------------------------------------------------------
// Entidade: Regiões (Regions)
//
// Nível geográfico ENTRE o país e o estado, formando a hierarquia:
//   país (countries.js) → REGIÃO (este arquivo) → estado (states.js) → cidade (cities.js)
//
// Uma região agrupa estados de um mesmo país (ex.: "Sudeste"). É a base do porte
// REGIONAL do calendário de competições (ver competitionCategories.js e
// CALENDARIO_DE_COMPETICOES.md): uma competição regional acontece dentro de uma
// região.
//
// Cada região possui:
//   - id        : identificador único (ex.: "REG-SUDESTE")
//   - name      : nome da região (ex.: "Sudeste")
//   - countryId : país da região (ver countries.js)
//
// Conjunto inicial: as 5 regiões do Brasil (único país existente). Assim como
// cidades/clubes, são uma database à mão — a ser ampliada quando houver mais
// países.
// -----------------------------------------------------------------------------

const REGIONS = {
  "REG-NORTE": {
    id: "REG-NORTE",
    name: "Norte",
    countryId: "BRA",
  },
  "REG-NORDESTE": {
    id: "REG-NORDESTE",
    name: "Nordeste",
    countryId: "BRA",
  },
  "REG-CENTRO-OESTE": {
    id: "REG-CENTRO-OESTE",
    name: "Centro-Oeste",
    countryId: "BRA",
  },
  "REG-SUDESTE": {
    id: "REG-SUDESTE",
    name: "Sudeste",
    countryId: "BRA",
  },
  "REG-SUL": {
    id: "REG-SUL",
    name: "Sul",
    countryId: "BRA",
  },
};

// Busca uma região pelo id. Retorna undefined se não existir.
function getRegion(id) {
  return REGIONS[id];
}

// Retorna todas as regiões de um país.
function getRegionsByCountry(countryId) {
  return Object.values(REGIONS).filter((region) => region.countryId === countryId);
}

// Retorna todas as regiões.
function getAllRegions() {
  return Object.values(REGIONS);
}
