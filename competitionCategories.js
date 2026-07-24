// -----------------------------------------------------------------------------
// Entidade: Categorias de Competição (Competition Categories)
//
// Define os NÍVEIS (tiers) do calendário de competições — a estrutura que
// organiza TODAS as competições, do menor ao maior porte. É uma database GLOBAL
// e independente de país: as mesmas categorias valem para qualquer país. Uma
// competição (ver championships.js) aponta para uma categoria via `categoryId`,
// herdando dela o seu porte (prestígio), o valor de ranking e — no futuro — a
// premiação.
//
// A ideia é dar ao clube uma ESCOLHA: em qual competição inscrever cada tipo de
// atleta (manter ritmo/forma em categorias menores, buscar ranking e índices em
// categorias maiores, etc.). Essa lógica de inscrição real ainda NÃO existe
// (ver TODO.md, prioridade média) — aqui montamos só o calendário/estrutura que
// a sustenta. O aprofundamento do desenho está em CALENDARIO_DE_COMPETICOES.md.
//
// Cada categoria possui:
//   - id            : identificador único (ex.: "CAT-NACIONAL")
//   - name          : nome da categoria (ex.: "Nacional")
//   - level         : nível numérico 1..9 (1 = menor porte, 9 = maior) — ordena
//                     as categorias e serve para comparar "quem é maior".
//   - scope         : alcance geográfico (ver COMPETITION_SCOPES abaixo).
//   - prestige      : prestígio do porte (0-100). Pensado para casar clubes/
//                     atletas ao nível certo de competição (uso futuro).
//   - rankingPoints : pontos de ranking que a categoria vale (base do campeão).
//                     Quanto maior o porte, mais pontos. A DISTRIBUIÇÃO por
//                     posição (e o peso por etapa/final) fica para depois — ver
//                     TODO.md.
//
// PREMIAÇÃO (dinheiro): NÃO é modelada aqui de propósito. A tabela de valores
// (Regional = $, ... , Nacional = $$$$$$$; internacionais a definir) está
// registrada em TODO.md e em CALENDARIO_DE_COMPETICOES.md como referência para
// quando o SISTEMA FINANCEIRO for criado. Ver DECISOES.md.
// -----------------------------------------------------------------------------

// Alcance geográfico de uma categoria. Determina a QUEM a competição pertence:
//   - SUBNACIONAL  : abaixo do país (região/estado). As entidades geográficas
//                    correspondentes (região, estado) ainda NÃO existem — por ora
//                    o scope apenas classifica o nível (ver CALENDARIO_DE_COMPETICOES.md).
//   - NACIONAL     : dentro de UM país (divisões e o campeonato nacional).
//   - INTERNACIONAL: abrange VÁRIOS países (continental/mundial/olímpico).
const COMPETITION_SCOPES = {
  SUBNACIONAL: "subnacional",
  NACIONAL: "nacional",
  INTERNACIONAL: "internacional",
};

// Database global das categorias, do menor (level 1) ao maior porte (level 9).
const COMPETITION_CATEGORIES = {
  "CAT-REGIONAL": {
    id: "CAT-REGIONAL",
    name: "Regional",
    level: 1,
    scope: COMPETITION_SCOPES.SUBNACIONAL,
    prestige: 20,
    rankingPoints: 20,
  },
  "CAT-ESTADUAL": {
    id: "CAT-ESTADUAL",
    name: "Estadual",
    level: 2,
    scope: COMPETITION_SCOPES.SUBNACIONAL,
    prestige: 35,
    rankingPoints: 40,
  },
  "CAT-SERIE-C": {
    id: "CAT-SERIE-C",
    name: "Série C",
    level: 3,
    scope: COMPETITION_SCOPES.NACIONAL,
    prestige: 45,
    rankingPoints: 60,
  },
  "CAT-SERIE-B": {
    id: "CAT-SERIE-B",
    name: "Série B",
    level: 4,
    scope: COMPETITION_SCOPES.NACIONAL,
    prestige: 60,
    rankingPoints: 100,
  },
  "CAT-SERIE-A": {
    id: "CAT-SERIE-A",
    name: "Série A",
    level: 5,
    scope: COMPETITION_SCOPES.NACIONAL,
    prestige: 75,
    rankingPoints: 160,
  },
  "CAT-NACIONAL": {
    id: "CAT-NACIONAL",
    name: "Nacional",
    level: 6,
    scope: COMPETITION_SCOPES.NACIONAL,
    prestige: 95,
    rankingPoints: 300,
  },
  "CAT-CONTINENTAL": {
    id: "CAT-CONTINENTAL",
    name: "Continental",
    level: 7,
    scope: COMPETITION_SCOPES.INTERNACIONAL,
    prestige: 98,
    rankingPoints: 450,
  },
  "CAT-MUNDIAL": {
    id: "CAT-MUNDIAL",
    name: "Mundial",
    level: 8,
    scope: COMPETITION_SCOPES.INTERNACIONAL,
    prestige: 99,
    rankingPoints: 700,
  },
  "CAT-OLIMPICO": {
    id: "CAT-OLIMPICO",
    name: "Olímpico",
    level: 9,
    scope: COMPETITION_SCOPES.INTERNACIONAL,
    prestige: 100,
    rankingPoints: 1000,
  },
};

// Busca uma categoria pelo id. Retorna undefined se não existir.
function getCompetitionCategory(id) {
  return COMPETITION_CATEGORIES[id];
}

// Todas as categorias, ordenadas do menor para o maior porte (level crescente).
function getAllCompetitionCategories() {
  return Object.values(COMPETITION_CATEGORIES).sort((a, b) => a.level - b.level);
}

// Categorias de um dado alcance (scope), ordenadas por level crescente.
function getCategoriesByScope(scope) {
  return getAllCompetitionCategories().filter((cat) => cat.scope === scope);
}

// Categoria de um determinado nível (1..9) ou undefined.
function getCategoryByLevel(level) {
  return getAllCompetitionCategories().find((cat) => cat.level === level);
}
