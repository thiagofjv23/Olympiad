// -----------------------------------------------------------------------------
// Entidade: Esportes (Sports)
// O esporte definirá, no futuro, COMO os atributos dos atletas serão usados na
// simulação de resultados (cada esporte/prova valoriza atributos de formas
// diferentes). Essa lógica de simulação ainda NÃO existe — ver TODO.md.
//
// Cada esporte possui:
//   - id                : identificador único
//   - name              : nome do esporte
//   - description       : descrição
//   - generalPopularity : popularidade geral (0-100)
//   - practiceStartYear : ano de início da prática
//                         (número; valores negativos = a.C., ex.: -776 = 776 a.C.)
//   - originCountry     : país originário (texto). É guardado como nome porque a
//                         origem costuma ser um país não implantado em
//                         countries.js — ver DECISOES.md.
//
// Assim como clubes e cidades, os esportes NÃO são gerados: são uma database
// inicial, a ser revisada e ampliada (ver TODO.md). A popularidade é uma
// aproximação para fins de simulação.
// -----------------------------------------------------------------------------

const SPORTS = {
  "SPT-ATLETISMO": {
    id: "SPT-ATLETISMO",
    name: "Atletismo",
    description:
      "Conjunto de provas de corrida, salto e lançamento; inclui os 100 m rasos.",
    generalPopularity: 85,
    practiceStartYear: -776, // 776 a.C., Jogos da Antiguidade
    originCountry: "Grécia Antiga",
  },
  "SPT-NATACAO": {
    id: "SPT-NATACAO",
    name: "Natação",
    description: "Provas de velocidade e resistência na água.",
    generalPopularity: 78,
    practiceStartYear: 1837, // primeiras competições organizadas em Londres
    originCountry: "Reino Unido",
  },
  "SPT-FUTEBOL": {
    id: "SPT-FUTEBOL",
    name: "Futebol",
    description: "Esporte coletivo disputado com os pés, de grande alcance popular.",
    generalPopularity: 98,
    practiceStartYear: 1863, // fundação da Football Association
    originCountry: "Inglaterra",
  },
  "SPT-BASQUETE": {
    id: "SPT-BASQUETE",
    name: "Basquete",
    description: "Esporte coletivo de arremesso à cesta.",
    generalPopularity: 80,
    practiceStartYear: 1891, // criado por James Naismith
    originCountry: "Estados Unidos",
  },
  "SPT-VOLEI": {
    id: "SPT-VOLEI",
    name: "Vôlei",
    description: "Esporte coletivo disputado sobre uma rede.",
    generalPopularity: 74,
    practiceStartYear: 1895, // criado por William G. Morgan
    originCountry: "Estados Unidos",
  },
  "SPT-GINASTICA": {
    id: "SPT-GINASTICA",
    name: "Ginástica Artística",
    description: "Provas em aparelhos, avaliadas por dificuldade e execução.",
    generalPopularity: 66,
    practiceStartYear: 1811, // Turnplatz de Friedrich Ludwig Jahn
    originCountry: "Alemanha",
  },
};

// Busca um esporte pelo id. Retorna undefined se não existir.
function getSport(id) {
  return SPORTS[id];
}

// Retorna todos os esportes.
function getAllSports() {
  return Object.values(SPORTS);
}
