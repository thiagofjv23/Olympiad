// -----------------------------------------------------------------------------
// Entidade: Continentes (Continents)
//
// Nível geográfico ENTRE o mundo e o país, completando a hierarquia:
//   MUNDO (World) → CONTINENTE (este arquivo) → país (countries.js)
//     → região (regions.js) → estado (states.js) → cidade (cities.js)
//
// Há um ÚNICO mundo (a raiz), do qual todos os continentes descendem; cada país
// aponta para o seu continente (`country.continentId`). Assim como regiões e
// estados, é uma database à mão. NÃO tem UI própria — é só a lógica/estrutura da
// hierarquia (ver DOCUMENTACAO.md).
//
// Cada continente possui:
//   - id      : identificador único (ex.: "CONT-AMERICA-SUL")
//   - name    : nome do continente (ex.: "América do Sul")
//   - worldId : o mundo ao qual pertence (raiz única — "WORLD")
//
// Os continentes seguem o agrupamento da database inicial de países (55 países):
// América do Sul; América do Norte, Central e Caribe; África; Ásia; Oceania;
// Europa.
// -----------------------------------------------------------------------------

// Raiz da hierarquia geográfica: o MUNDO (único).
const WORLD = { id: "WORLD", name: "Mundo" };

const CONTINENTS = {
  "CONT-AMERICA-SUL": {
    id: "CONT-AMERICA-SUL",
    name: "América do Sul",
    worldId: WORLD.id,
  },
  "CONT-AMERICA-NORTE": {
    id: "CONT-AMERICA-NORTE",
    name: "América do Norte, Central e Caribe",
    worldId: WORLD.id,
  },
  "CONT-AFRICA": {
    id: "CONT-AFRICA",
    name: "África",
    worldId: WORLD.id,
  },
  "CONT-ASIA": {
    id: "CONT-ASIA",
    name: "Ásia",
    worldId: WORLD.id,
  },
  "CONT-OCEANIA": {
    id: "CONT-OCEANIA",
    name: "Oceania",
    worldId: WORLD.id,
  },
  "CONT-EUROPA": {
    id: "CONT-EUROPA",
    name: "Europa",
    worldId: WORLD.id,
  },
};

// O mundo (raiz única da hierarquia).
function getWorld() {
  return WORLD;
}

// Busca um continente pelo id. Retorna undefined se não existir.
function getContinent(id) {
  return CONTINENTS[id];
}

// Retorna todos os continentes.
function getAllContinents() {
  return Object.values(CONTINENTS);
}

// Retorna os continentes de um mundo (há um só mundo; completa a hierarquia
// Mundo → Continente).
function getContinentsByWorld(worldId) {
  return Object.values(CONTINENTS).filter(
    (continent) => continent.worldId === worldId
  );
}

// O mundo de um continente (derivado do worldId). Retorna null se ausente.
function getContinentWorld(continent) {
  return continent && continent.worldId === WORLD.id ? WORLD : null;
}
