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
//   - resultSystems     : lista dos "ResultSystem" do esporte (ex.:
//                         "TimeResultSystem", "MatchResultSystem", ...). Por
//                         enquanto é APENAS UM INDICADOR (rótulo) — NÃO há
//                         nenhuma mecânica ligada a ele ainda. A criação da
//                         mecânica de ResultSystem está no TODO.md como
//                         PRIORIDADE ALTA.
//
// Assim como clubes e cidades, os esportes NÃO são gerados: são uma database
// inicial, a ser revisada e ampliada (ver TODO.md). A popularidade, os anos de
// início e as origens são aproximações para fins de simulação.
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
    resultSystems: [
      "TimeResultSystem",
      "DistanceResultSystem",
      "HeightResultSystem",
      "CombinedResultSystem",
    ],
  },
  "SPT-NATACAO": {
    id: "SPT-NATACAO",
    name: "Natação",
    description: "Provas de velocidade e resistência na água.",
    generalPopularity: 78,
    practiceStartYear: 1837, // primeiras competições organizadas em Londres
    originCountry: "Reino Unido",
    resultSystems: ["TimeResultSystem", "JudgeResultSystem"],
  },
  "SPT-FUTEBOL": {
    id: "SPT-FUTEBOL",
    name: "Futebol",
    description: "Esporte coletivo disputado com os pés, de grande alcance popular.",
    generalPopularity: 98,
    practiceStartYear: 1863, // fundação da Football Association
    originCountry: "Inglaterra",
    resultSystems: ["MatchResultSystem"],
  },
  "SPT-BASQUETE": {
    id: "SPT-BASQUETE",
    name: "Basquete",
    description: "Esporte coletivo de arremesso à cesta.",
    generalPopularity: 80,
    practiceStartYear: 1891, // criado por James Naismith
    originCountry: "Estados Unidos",
    resultSystems: ["MatchResultSystem"],
  },
  "SPT-VOLEI": {
    id: "SPT-VOLEI",
    name: "Vôlei",
    description: "Esporte coletivo disputado sobre uma rede.",
    generalPopularity: 74,
    practiceStartYear: 1895, // criado por William G. Morgan
    originCountry: "Estados Unidos",
    resultSystems: ["MatchResultSystem"],
  },
  "SPT-GINASTICA": {
    id: "SPT-GINASTICA",
    name: "Ginástica Artística",
    description: "Provas em aparelhos, avaliadas por dificuldade e execução.",
    generalPopularity: 66,
    practiceStartYear: 1811, // Turnplatz de Friedrich Ludwig Jahn
    originCountry: "Alemanha",
    resultSystems: ["JudgeResultSystem"],
  },
  "SPT-BADMINTON": {
    id: "SPT-BADMINTON",
    name: "Badminton",
    description: "Esporte de raquete disputado com uma peteca sobre uma rede.",
    generalPopularity: 60,
    practiceStartYear: 1873, // versão moderna, Badminton House (Inglaterra)
    originCountry: "Inglaterra",
    resultSystems: ["MatchResultSystem"],
  },
  "SPT-BEISEBOL": {
    id: "SPT-BEISEBOL",
    name: "Beisebol/Softbol",
    description:
      "Esporte de rebatida e corrida entre bases, disputado por dois times.",
    generalPopularity: 62,
    practiceStartYear: 1845, // Knickerbocker Rules
    originCountry: "Estados Unidos",
    resultSystems: ["MatchResultSystem"],
  },
  "SPT-BOXE": {
    id: "SPT-BOXE",
    name: "Boxe",
    description: "Esporte de combate disputado com golpes de punho em um ringue.",
    generalPopularity: 68,
    practiceStartYear: 1867, // regras de Queensberry
    originCountry: "Reino Unido",
    resultSystems: ["MatchResultSystem"],
  },
  "SPT-CANOAGEM": {
    id: "SPT-CANOAGEM",
    name: "Canoagem",
    description: "Provas de velocidade e slalom em canoas e caiaques.",
    generalPopularity: 45,
    practiceStartYear: 1866, // Royal Canoe Club
    originCountry: "Reino Unido",
    resultSystems: ["TimeResultSystem"],
  },
  "SPT-CICLISMO": {
    id: "SPT-CICLISMO",
    name: "Ciclismo",
    description: "Provas de estrada, pista, montanha e BMX sobre bicicletas.",
    generalPopularity: 72,
    practiceStartYear: 1868, // primeira corrida, Parc de Saint-Cloud
    originCountry: "França",
    resultSystems: [
      "TimeResultSystem",
      "MatchResultSystem",
      "PointsResultSystem",
    ],
  },
  "SPT-CRIQUETE": {
    id: "SPT-CRIQUETE",
    name: "Críquete",
    description:
      "Esporte de rebatida entre dois times, tradicional na Commonwealth.",
    generalPopularity: 64,
    practiceStartYear: 1744, // primeiras leis conhecidas do jogo
    originCountry: "Inglaterra",
    resultSystems: ["MatchResultSystem"],
  },
  "SPT-ESCALADA": {
    id: "SPT-ESCALADA",
    name: "Escalada Esportiva",
    description:
      "Provas de velocidade, boulder e dificuldade em paredes de escalada.",
    generalPopularity: 40,
    practiceStartYear: 1985, // primeiras competições de escalada esportiva
    originCountry: "Itália",
    resultSystems: [
      "TimeResultSystem",
      "HeightResultSystem",
      "PointsResultSystem",
    ],
  },
  "SPT-ESGRIMA": {
    id: "SPT-ESGRIMA",
    name: "Esgrima",
    description: "Duelo esportivo com armas brancas (florete, espada e sabre).",
    generalPopularity: 42,
    practiceStartYear: 1913, // fundação da FIE
    originCountry: "França",
    resultSystems: ["MatchResultSystem"],
  },
  "SPT-FLAG-FOOTBALL": {
    id: "SPT-FLAG-FOOTBALL",
    name: "Flag Football",
    description: "Variante sem contato do futebol americano, com bandeiras.",
    generalPopularity: 35,
    practiceStartYear: 1944, // difundido em bases militares dos EUA
    originCountry: "Estados Unidos",
    resultSystems: ["MatchResultSystem"],
  },
  "SPT-GOLFE": {
    id: "SPT-GOLFE",
    name: "Golfe",
    description:
      "Esporte de precisão: completar percursos com o menor número de tacadas.",
    generalPopularity: 58,
    practiceStartYear: 1764, // volta padrão de 18 buracos, St Andrews
    originCountry: "Escócia",
    resultSystems: ["ScoreResultSystem"],
  },
  "SPT-HANDEBOL": {
    id: "SPT-HANDEBOL",
    name: "Handebol",
    description: "Esporte coletivo de arremesso à baliza com as mãos.",
    generalPopularity: 56,
    practiceStartYear: 1917, // handebol de campo moderno (Alemanha)
    originCountry: "Alemanha",
    resultSystems: ["MatchResultSystem"],
  },
  "SPT-HIPISMO": {
    id: "SPT-HIPISMO",
    name: "Hipismo",
    description: "Provas com cavalos: adestramento, saltos e concurso completo.",
    generalPopularity: 44,
    practiceStartYear: 1912, // hipismo moderno nos Jogos Olímpicos
    originCountry: "Reino Unido",
    resultSystems: [
      "JudgeResultSystem",
      "MatchResultSystem",
      "TimeResultSystem",
    ],
  },
  "SPT-HOQUEI-GRAMA": {
    id: "SPT-HOQUEI-GRAMA",
    name: "Hóquei sobre Grama",
    description: "Esporte coletivo disputado com tacos e uma bola sobre a grama.",
    generalPopularity: 50,
    practiceStartYear: 1886, // Hockey Association (Inglaterra)
    originCountry: "Inglaterra",
    resultSystems: ["MatchResultSystem"],
  },
  "SPT-JUDO": {
    id: "SPT-JUDO",
    name: "Judô",
    description:
      "Arte marcial e esporte de combate com projeções e imobilizações.",
    generalPopularity: 60,
    practiceStartYear: 1882, // Kodokan, de Jigoro Kano
    originCountry: "Japão",
    resultSystems: ["MatchResultSystem"],
  },
  "SPT-LACROSSE": {
    id: "SPT-LACROSSE",
    name: "Lacrosse",
    description: "Esporte coletivo com raquetes (crosses) e uma bola de borracha.",
    generalPopularity: 33,
    practiceStartYear: 1867, // codificado no Canadá
    originCountry: "Canadá",
    resultSystems: ["MatchResultSystem"],
  },
  "SPT-LEVANTAMENTO-PESO": {
    id: "SPT-LEVANTAMENTO-PESO",
    name: "Levantamento de Peso",
    description:
      "Prova de força: erguer o máximo de peso no arranco e no arremesso.",
    generalPopularity: 52,
    practiceStartYear: 1891, // primeiro campeonato mundial
    originCountry: "Reino Unido",
    resultSystems: ["WeightResultSystem"],
  },
  "SPT-LUTAS": {
    id: "SPT-LUTAS",
    name: "Lutas",
    description: "Esporte de combate corpo a corpo (livre e greco-romana).",
    generalPopularity: 54,
    practiceStartYear: -708, // luta nos Jogos da Antiguidade (708 a.C.)
    originCountry: "Grécia Antiga",
    resultSystems: ["MatchResultSystem"],
  },
  "SPT-PENTATLO": {
    id: "SPT-PENTATLO",
    name: "Pentatlo Moderno",
    description:
      "Cinco provas: esgrima, natação, hipismo e tiro/corrida combinados.",
    generalPopularity: 30,
    practiceStartYear: 1912, // introduzido por Pierre de Coubertin
    originCountry: "França",
    resultSystems: [
      "CombinedResultSystem",
      "MatchResultSystem",
      "TimeResultSystem",
      "ScoreResultSystem",
    ],
  },
  "SPT-REMO": {
    id: "SPT-REMO",
    name: "Remo",
    description: "Provas de velocidade em barcos movidos a remo.",
    generalPopularity: 48,
    practiceStartYear: 1715, // Doggett's Coat and Badge (Tâmisa)
    originCountry: "Reino Unido",
    resultSystems: ["TimeResultSystem"],
  },
  "SPT-RUGBY": {
    id: "SPT-RUGBY",
    name: "Rugby",
    description: "Esporte coletivo de contato, disputado com uma bola oval.",
    generalPopularity: 63,
    practiceStartYear: 1845, // primeiras regras, Rugby School
    originCountry: "Inglaterra",
    resultSystems: ["MatchResultSystem"],
  },
  "SPT-SKATE": {
    id: "SPT-SKATE",
    name: "Skate",
    description: "Manobras sobre skate, avaliadas por dificuldade e execução.",
    generalPopularity: 55,
    practiceStartYear: 1950, // difusão na Califórnia
    originCountry: "Estados Unidos",
    resultSystems: ["JudgeResultSystem"],
  },
  "SPT-SURFE": {
    id: "SPT-SURFE",
    name: "Surfe",
    description: "Manobras sobre ondas em uma prancha, avaliadas por juízes.",
    generalPopularity: 57,
    practiceStartYear: 1900, // retomada moderna no Havaí
    originCountry: "Havaí",
    resultSystems: ["JudgeResultSystem"],
  },
  "SPT-SQUASH": {
    id: "SPT-SQUASH",
    name: "Squash",
    description: "Esporte de raquete disputado em quadra fechada contra a parede.",
    generalPopularity: 38,
    practiceStartYear: 1830, // Harrow School (Inglaterra)
    originCountry: "Inglaterra",
    resultSystems: ["MatchResultSystem"],
  },
  "SPT-TAEKWONDO": {
    id: "SPT-TAEKWONDO",
    name: "Taekwondo",
    description: "Arte marcial coreana de combate com ênfase em chutes.",
    generalPopularity: 50,
    practiceStartYear: 1955, // consolidação do nome na Coreia
    originCountry: "Coreia do Sul",
    resultSystems: ["MatchResultSystem"],
  },
  "SPT-TENIS": {
    id: "SPT-TENIS",
    name: "Tênis",
    description: "Esporte de raquete disputado em quadra, individual ou em duplas.",
    generalPopularity: 76,
    practiceStartYear: 1873, // lawn tennis, de Walter Wingfield
    originCountry: "Reino Unido",
    resultSystems: ["MatchResultSystem"],
  },
  "SPT-TENIS-MESA": {
    id: "SPT-TENIS-MESA",
    name: "Tênis de Mesa",
    description: "Esporte de raquete disputado sobre uma mesa com rede.",
    generalPopularity: 58,
    practiceStartYear: 1901, // primeiras competições organizadas (Inglaterra)
    originCountry: "Inglaterra",
    resultSystems: ["MatchResultSystem"],
  },
  "SPT-TIRO-ESPORTIVO": {
    id: "SPT-TIRO-ESPORTIVO",
    name: "Tiro Esportivo",
    description: "Provas de pontaria com armas de fogo e de pressão em alvos.",
    generalPopularity: 40,
    practiceStartYear: 1896, // primeiros Jogos Olímpicos modernos
    originCountry: "Reino Unido",
    resultSystems: ["ScoreResultSystem"],
  },
  "SPT-TIRO-ARCO": {
    id: "SPT-TIRO-ARCO",
    name: "Tiro com Arco",
    description: "Provas de pontaria com arco e flecha em alvos.",
    generalPopularity: 46,
    practiceStartYear: 1844, // primeiros encontros modernos de arco (Inglaterra)
    originCountry: "Inglaterra",
    resultSystems: ["ScoreResultSystem", "MatchResultSystem"],
  },
  "SPT-TRIATLO": {
    id: "SPT-TRIATLO",
    name: "Triatlo",
    description: "Prova combinada de natação, ciclismo e corrida em sequência.",
    generalPopularity: 49,
    practiceStartYear: 1974, // primeira prova moderna, San Diego
    originCountry: "Estados Unidos",
    resultSystems: ["TimeResultSystem"],
  },
  "SPT-VELA": {
    id: "SPT-VELA",
    name: "Vela",
    description: "Regatas com barcos a vela em diferentes classes.",
    generalPopularity: 43,
    practiceStartYear: 1720, // Water Club of Cork
    originCountry: "Países Baixos",
    resultSystems: ["ScoreResultSystem", "MatchResultSystem"],
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
