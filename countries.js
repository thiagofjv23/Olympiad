// -----------------------------------------------------------------------------
// Entidade: Países (Countries)
// Cada país possui id, nome, população e um rating de "força olímpica" (0-100).
// -----------------------------------------------------------------------------

const COUNTRIES = {
  BRA: {
    id: "BRA",
    name: "Brasil",
    // Código do COI (usado no nome dos atletas, ex.: "Atleta 1 (BRA)").
    iocCode: "BRA",
    population: 213_421_037,
    // Força Olímpica: rating de 0 a 100.
    olympicStrength: 78,
  },
};

// Busca um país pelo id. Retorna undefined se não existir.
function getCountry(id) {
  return COUNTRIES[id];
}
