// -----------------------------------------------------------------------------
// Entidade: Eventos (Events) — as PROVAS de uma modalidade.
//
// Hierarquia: Esporte → Modalidade → EVENTO. O evento é a unidade RESOLVÍVEL da
// simulação: é ele que carrega o modelo de resultado (resolution + performance) e
// é resolvido pela ResultsEngine. Um evento pertence a uma MODALIDADE (modalityId,
// ver modalities.js), que por sua vez pertence a um esporte.
//
// Exemplo: os "100 metros rasos" são um EVENTO da modalidade "Velocidade" do
// esporte "Atletismo".
//
// DATABASE: segue o CALENDÁRIO OLÍMPICO — cada modalidade (ver modalities.js)
// recebe as suas provas olímpicas. Por ora os eventos guardam só a ESTRUTURA
// (id, name, modalityId); o MODELO de resultado (resolution/performance) está
// definido apenas onde já existe (hoje, os 100 m). Os demais eventos ganharão o
// seu modelo quando a mecânica de ResultSystem for criada (ver TODO.md —
// prioridade alta). Eventos sem modelo não são resolvidos (nenhum campeonato os
// disputa ainda) — apenas compõem a estrutura Esporte → Modalidade → Evento.
//
// Cada evento possui:
//   - id                : identificador único (ex.: "EVT-ATL-100M")
//   - name              : nome do evento (ex.: "100 metros rasos")
//   - modalityId        : modalidade a que pertence (ver modalities.js)
//   - resolution        : (opcional) forma de resolução — objeto de parâmetros
//                         compatível com a ResultsEngine (metric/order/aggregation/
//                         precision). Presente só onde há modelo.
//   - performance       : (opcional) parâmetros do modelo que transforma os
//                         atributos do atleta no número do resultado.
//   - generalPopularity : (opcional) popularidade geral do evento (0-100).
//   - countryPopularity : (opcional) popularidade por país — relação futura.
// -----------------------------------------------------------------------------

const EVENTS = {
  // === Atletismo =============================================================
  // Velocidade
  "EVT-ATL-100M": {
    id: "EVT-ATL-100M",
    name: "100 metros rasos",
    modalityId: "MOD-ATL-VELOCIDADE",
    resolution: {
      metric: ResultsEngine.METRICS.TIME,
      order: ResultsEngine.ORDERS.ASCENDING, // menor tempo vence
      aggregation: ResultsEngine.AGGREGATIONS.SINGLE,
      precision: 2,
    },
    performance: {
      // Recorde mundial: melhor tempo possível (piso). Ninguém corre abaixo disso.
      recordTime: 9.58,
      // Cada ponto de Força efetiva ABAIXO de 100 acrescenta este tempo (s).
      secondsPerStrengthPoint: 0.05,
      // Cada ponto de fadiga ACUMULADA reduz a Força efetiva (ver cálculo abaixo).
      fatiguePenaltyPerPoint: 0.3,
      // Cada ponto de DÉFICIT DE FORMA (100 − ritmo) reduz a Força efetiva.
      formPenaltyPerPoint: 0.15,
    },
    generalPopularity: 95,
    countryPopularity: null, // relação futura (ver TODO.md)
  },
  "EVT-ATL-200M": { id: "EVT-ATL-200M", name: "200 metros rasos", modalityId: "MOD-ATL-VELOCIDADE" },
  "EVT-ATL-400M": { id: "EVT-ATL-400M", name: "400 metros rasos", modalityId: "MOD-ATL-VELOCIDADE" },
  // Meio-fundo
  "EVT-ATL-800M": { id: "EVT-ATL-800M", name: "800 metros", modalityId: "MOD-ATL-MEIO-FUNDO" },
  "EVT-ATL-1500M": { id: "EVT-ATL-1500M", name: "1500 metros", modalityId: "MOD-ATL-MEIO-FUNDO" },
  // Fundo
  "EVT-ATL-5000M": { id: "EVT-ATL-5000M", name: "5000 metros", modalityId: "MOD-ATL-FUNDO" },
  "EVT-ATL-10000M": { id: "EVT-ATL-10000M", name: "10000 metros", modalityId: "MOD-ATL-FUNDO" },
  "EVT-ATL-MARATONA": { id: "EVT-ATL-MARATONA", name: "Maratona", modalityId: "MOD-ATL-FUNDO" },
  // Barreiras
  "EVT-ATL-100MB": { id: "EVT-ATL-100MB", name: "100 metros com barreiras", modalityId: "MOD-ATL-BARREIRAS" },
  "EVT-ATL-110MB": { id: "EVT-ATL-110MB", name: "110 metros com barreiras", modalityId: "MOD-ATL-BARREIRAS" },
  "EVT-ATL-400MB": { id: "EVT-ATL-400MB", name: "400 metros com barreiras", modalityId: "MOD-ATL-BARREIRAS" },
  // Obstáculos
  "EVT-ATL-3000MO": { id: "EVT-ATL-3000MO", name: "3000 metros com obstáculos", modalityId: "MOD-ATL-OBSTACULOS" },
  // Revezamentos
  "EVT-ATL-4X100": { id: "EVT-ATL-4X100", name: "Revezamento 4x100 metros", modalityId: "MOD-ATL-REVEZAMENTOS" },
  "EVT-ATL-4X400": { id: "EVT-ATL-4X400", name: "Revezamento 4x400 metros", modalityId: "MOD-ATL-REVEZAMENTOS" },
  "EVT-ATL-4X400-MISTO": { id: "EVT-ATL-4X400-MISTO", name: "Revezamento 4x400 metros misto", modalityId: "MOD-ATL-REVEZAMENTOS" },
  // Saltos
  "EVT-ATL-SALTO-DISTANCIA": { id: "EVT-ATL-SALTO-DISTANCIA", name: "Salto em distância", modalityId: "MOD-ATL-SALTOS" },
  "EVT-ATL-SALTO-TRIPLO": { id: "EVT-ATL-SALTO-TRIPLO", name: "Salto triplo", modalityId: "MOD-ATL-SALTOS" },
  "EVT-ATL-SALTO-ALTURA": { id: "EVT-ATL-SALTO-ALTURA", name: "Salto em altura", modalityId: "MOD-ATL-SALTOS" },
  "EVT-ATL-SALTO-VARA": { id: "EVT-ATL-SALTO-VARA", name: "Salto com vara", modalityId: "MOD-ATL-SALTOS" },
  // Arremessos/Lançamentos
  "EVT-ATL-PESO": { id: "EVT-ATL-PESO", name: "Arremesso de peso", modalityId: "MOD-ATL-LANCAMENTOS" },
  "EVT-ATL-DISCO": { id: "EVT-ATL-DISCO", name: "Lançamento de disco", modalityId: "MOD-ATL-LANCAMENTOS" },
  "EVT-ATL-MARTELO": { id: "EVT-ATL-MARTELO", name: "Lançamento de martelo", modalityId: "MOD-ATL-LANCAMENTOS" },
  "EVT-ATL-DARDO": { id: "EVT-ATL-DARDO", name: "Lançamento de dardo", modalityId: "MOD-ATL-LANCAMENTOS" },
  // Marcha Atlética
  "EVT-ATL-MARCHA-20KM": { id: "EVT-ATL-MARCHA-20KM", name: "Marcha atlética 20 km", modalityId: "MOD-ATL-MARCHA" },
  "EVT-ATL-MARCHA-35KM": { id: "EVT-ATL-MARCHA-35KM", name: "Marcha atlética 35 km", modalityId: "MOD-ATL-MARCHA" },
  // Provas Combinadas
  "EVT-ATL-DECATLO": { id: "EVT-ATL-DECATLO", name: "Decatlo", modalityId: "MOD-ATL-COMBINADAS" },
  "EVT-ATL-HEPTATLO": { id: "EVT-ATL-HEPTATLO", name: "Heptatlo", modalityId: "MOD-ATL-COMBINADAS" },

  // === Badminton =============================================================
  "EVT-BAD-SIMPLES": { id: "EVT-BAD-SIMPLES", name: "Simples", modalityId: "MOD-BAD-BADMINTON" },
  "EVT-BAD-DUPLAS": { id: "EVT-BAD-DUPLAS", name: "Duplas", modalityId: "MOD-BAD-BADMINTON" },
  "EVT-BAD-DUPLAS-MISTAS": { id: "EVT-BAD-DUPLAS-MISTAS", name: "Duplas mistas", modalityId: "MOD-BAD-BADMINTON" },

  // === Basquete ==============================================================
  "EVT-BAS-5X5": { id: "EVT-BAS-5X5", name: "Torneio 5x5", modalityId: "MOD-BAS-5X5" },
  "EVT-BAS-3X3": { id: "EVT-BAS-3X3", name: "Torneio 3x3", modalityId: "MOD-BAS-3X3" },

  // === Beisebol/Softbol ======================================================
  "EVT-BEI-TORNEIO": { id: "EVT-BEI-TORNEIO", name: "Torneio de beisebol", modalityId: "MOD-BEI-BEISEBOL" },
  "EVT-SOF-TORNEIO": { id: "EVT-SOF-TORNEIO", name: "Torneio de softbol", modalityId: "MOD-BEI-SOFTBOL" },

  // === Boxe ==================================================================
  "EVT-BOX-MOSCA": { id: "EVT-BOX-MOSCA", name: "Peso mosca", modalityId: "MOD-BOX-BOXE" },
  "EVT-BOX-PENA": { id: "EVT-BOX-PENA", name: "Peso pena", modalityId: "MOD-BOX-BOXE" },
  "EVT-BOX-LEVE": { id: "EVT-BOX-LEVE", name: "Peso leve", modalityId: "MOD-BOX-BOXE" },
  "EVT-BOX-MEIO-MEDIO": { id: "EVT-BOX-MEIO-MEDIO", name: "Peso meio-médio", modalityId: "MOD-BOX-BOXE" },
  "EVT-BOX-MEDIO": { id: "EVT-BOX-MEDIO", name: "Peso médio", modalityId: "MOD-BOX-BOXE" },
  "EVT-BOX-MEIO-PESADO": { id: "EVT-BOX-MEIO-PESADO", name: "Peso meio-pesado", modalityId: "MOD-BOX-BOXE" },
  "EVT-BOX-PESADO": { id: "EVT-BOX-PESADO", name: "Peso pesado", modalityId: "MOD-BOX-BOXE" },
  "EVT-BOX-SUPERPESADO": { id: "EVT-BOX-SUPERPESADO", name: "Peso superpesado", modalityId: "MOD-BOX-BOXE" },

  // === Canoagem ==============================================================
  // Velocidade (Sprint)
  "EVT-CAN-K200": { id: "EVT-CAN-K200", name: "Caiaque 200 m", modalityId: "MOD-CAN-VELOCIDADE" },
  "EVT-CAN-K500": { id: "EVT-CAN-K500", name: "Caiaque 500 m", modalityId: "MOD-CAN-VELOCIDADE" },
  "EVT-CAN-K1000": { id: "EVT-CAN-K1000", name: "Caiaque 1000 m", modalityId: "MOD-CAN-VELOCIDADE" },
  "EVT-CAN-C200": { id: "EVT-CAN-C200", name: "Canoa 200 m", modalityId: "MOD-CAN-VELOCIDADE" },
  "EVT-CAN-C1000": { id: "EVT-CAN-C1000", name: "Canoa 1000 m", modalityId: "MOD-CAN-VELOCIDADE" },
  // Slalom
  "EVT-CAN-SLALOM-K": { id: "EVT-CAN-SLALOM-K", name: "Slalom caiaque", modalityId: "MOD-CAN-SLALOM" },
  "EVT-CAN-SLALOM-C": { id: "EVT-CAN-SLALOM-C", name: "Slalom canoa", modalityId: "MOD-CAN-SLALOM" },
  "EVT-CAN-KAYAK-CROSS": { id: "EVT-CAN-KAYAK-CROSS", name: "Caiaque cross", modalityId: "MOD-CAN-SLALOM" },

  // === Ciclismo ==============================================================
  // Estrada
  "EVT-CIC-ESTRADA": { id: "EVT-CIC-ESTRADA", name: "Prova de estrada", modalityId: "MOD-CIC-ESTRADA" },
  "EVT-CIC-CONTRARRELOGIO": { id: "EVT-CIC-CONTRARRELOGIO", name: "Contrarrelógio individual", modalityId: "MOD-CIC-ESTRADA" },
  // Pista
  "EVT-CIC-SPRINT": { id: "EVT-CIC-SPRINT", name: "Velocidade individual", modalityId: "MOD-CIC-PISTA" },
  "EVT-CIC-KEIRIN": { id: "EVT-CIC-KEIRIN", name: "Keirin", modalityId: "MOD-CIC-PISTA" },
  "EVT-CIC-PERSEGUICAO": { id: "EVT-CIC-PERSEGUICAO", name: "Perseguição por equipes", modalityId: "MOD-CIC-PISTA" },
  "EVT-CIC-OMNIUM": { id: "EVT-CIC-OMNIUM", name: "Omnium", modalityId: "MOD-CIC-PISTA" },
  "EVT-CIC-MADISON": { id: "EVT-CIC-MADISON", name: "Madison", modalityId: "MOD-CIC-PISTA" },
  // Mountain Bike
  "EVT-CIC-XCO": { id: "EVT-CIC-XCO", name: "Cross-country", modalityId: "MOD-CIC-MTB" },
  // BMX Racing
  "EVT-CIC-BMX-RACING": { id: "EVT-CIC-BMX-RACING", name: "BMX Racing", modalityId: "MOD-CIC-BMX-RACING" },
  // BMX Freestyle
  "EVT-CIC-BMX-FREESTYLE": { id: "EVT-CIC-BMX-FREESTYLE", name: "BMX Freestyle Park", modalityId: "MOD-CIC-BMX-FREESTYLE" },

  // === Críquete ==============================================================
  "EVT-CRI-T20": { id: "EVT-CRI-T20", name: "Torneio Twenty20", modalityId: "MOD-CRI-T20" },

  // === Escalada Esportiva ====================================================
  "EVT-ESC-SPEED": { id: "EVT-ESC-SPEED", name: "Velocidade", modalityId: "MOD-ESC-VELOCIDADE" },
  "EVT-ESC-BOULDER": { id: "EVT-ESC-BOULDER", name: "Boulder", modalityId: "MOD-ESC-BOULDER" },
  "EVT-ESC-LEAD": { id: "EVT-ESC-LEAD", name: "Guiada (Lead)", modalityId: "MOD-ESC-GUIADA" },

  // === Esgrima ===============================================================
  "EVT-ESG-FLORETE-IND": { id: "EVT-ESG-FLORETE-IND", name: "Florete individual", modalityId: "MOD-ESG-FLORETE" },
  "EVT-ESG-FLORETE-EQ": { id: "EVT-ESG-FLORETE-EQ", name: "Florete por equipes", modalityId: "MOD-ESG-FLORETE" },
  "EVT-ESG-ESPADA-IND": { id: "EVT-ESG-ESPADA-IND", name: "Espada individual", modalityId: "MOD-ESG-ESPADA" },
  "EVT-ESG-ESPADA-EQ": { id: "EVT-ESG-ESPADA-EQ", name: "Espada por equipes", modalityId: "MOD-ESG-ESPADA" },
  "EVT-ESG-SABRE-IND": { id: "EVT-ESG-SABRE-IND", name: "Sabre individual", modalityId: "MOD-ESG-SABRE" },
  "EVT-ESG-SABRE-EQ": { id: "EVT-ESG-SABRE-EQ", name: "Sabre por equipes", modalityId: "MOD-ESG-SABRE" },

  // === Flag Football =========================================================
  "EVT-FLAG-TORNEIO": { id: "EVT-FLAG-TORNEIO", name: "Torneio de flag football", modalityId: "MOD-FLAG-FLAG" },

  // === Futebol ===============================================================
  "EVT-FUT-TORNEIO": { id: "EVT-FUT-TORNEIO", name: "Torneio de futebol", modalityId: "MOD-FUT-FUTEBOL" },

  // === Ginástica =============================================================
  // Artística
  "EVT-GIN-ART-GERAL": { id: "EVT-GIN-ART-GERAL", name: "Individual geral", modalityId: "MOD-GIN-ARTISTICA" },
  "EVT-GIN-ART-EQUIPES": { id: "EVT-GIN-ART-EQUIPES", name: "Por equipes", modalityId: "MOD-GIN-ARTISTICA" },
  "EVT-GIN-ART-SALTO": { id: "EVT-GIN-ART-SALTO", name: "Salto", modalityId: "MOD-GIN-ARTISTICA" },
  "EVT-GIN-ART-SOLO": { id: "EVT-GIN-ART-SOLO", name: "Solo", modalityId: "MOD-GIN-ARTISTICA" },
  "EVT-GIN-ART-TRAVE": { id: "EVT-GIN-ART-TRAVE", name: "Trave", modalityId: "MOD-GIN-ARTISTICA" },
  "EVT-GIN-ART-ASSIMETRICAS": { id: "EVT-GIN-ART-ASSIMETRICAS", name: "Barras assimétricas", modalityId: "MOD-GIN-ARTISTICA" },
  "EVT-GIN-ART-CAVALO": { id: "EVT-GIN-ART-CAVALO", name: "Cavalo com alças", modalityId: "MOD-GIN-ARTISTICA" },
  "EVT-GIN-ART-ARGOLAS": { id: "EVT-GIN-ART-ARGOLAS", name: "Argolas", modalityId: "MOD-GIN-ARTISTICA" },
  "EVT-GIN-ART-PARALELAS": { id: "EVT-GIN-ART-PARALELAS", name: "Barras paralelas", modalityId: "MOD-GIN-ARTISTICA" },
  "EVT-GIN-ART-FIXA": { id: "EVT-GIN-ART-FIXA", name: "Barra fixa", modalityId: "MOD-GIN-ARTISTICA" },
  // Rítmica
  "EVT-GIN-RIT-INDIVIDUAL": { id: "EVT-GIN-RIT-INDIVIDUAL", name: "Individual geral", modalityId: "MOD-GIN-RITMICA" },
  "EVT-GIN-RIT-CONJUNTO": { id: "EVT-GIN-RIT-CONJUNTO", name: "Conjunto", modalityId: "MOD-GIN-RITMICA" },
  // Trampolim
  "EVT-GIN-TRAMPOLIM": { id: "EVT-GIN-TRAMPOLIM", name: "Trampolim", modalityId: "MOD-GIN-TRAMPOLIM" },

  // === Golfe =================================================================
  "EVT-GOL-INDIVIDUAL": { id: "EVT-GOL-INDIVIDUAL", name: "Torneio individual", modalityId: "MOD-GOL-GOLFE" },

  // === Handebol ==============================================================
  "EVT-HAN-TORNEIO": { id: "EVT-HAN-TORNEIO", name: "Torneio de handebol", modalityId: "MOD-HAN-INDOOR" },

  // === Hipismo ===============================================================
  "EVT-HIP-ADEST-IND": { id: "EVT-HIP-ADEST-IND", name: "Adestramento individual", modalityId: "MOD-HIP-ADESTRAMENTO" },
  "EVT-HIP-ADEST-EQ": { id: "EVT-HIP-ADEST-EQ", name: "Adestramento por equipes", modalityId: "MOD-HIP-ADESTRAMENTO" },
  "EVT-HIP-CCE-IND": { id: "EVT-HIP-CCE-IND", name: "CCE individual", modalityId: "MOD-HIP-CCE" },
  "EVT-HIP-CCE-EQ": { id: "EVT-HIP-CCE-EQ", name: "CCE por equipes", modalityId: "MOD-HIP-CCE" },
  "EVT-HIP-SALTOS-IND": { id: "EVT-HIP-SALTOS-IND", name: "Saltos individual", modalityId: "MOD-HIP-SALTOS" },
  "EVT-HIP-SALTOS-EQ": { id: "EVT-HIP-SALTOS-EQ", name: "Saltos por equipes", modalityId: "MOD-HIP-SALTOS" },

  // === Hóquei sobre Grama ====================================================
  "EVT-HOQ-TORNEIO": { id: "EVT-HOQ-TORNEIO", name: "Torneio de hóquei sobre grama", modalityId: "MOD-HOQ-GRAMA" },

  // === Judô ==================================================================
  "EVT-JUD-60": { id: "EVT-JUD-60", name: "Até 60 kg", modalityId: "MOD-JUD-JUDO" },
  "EVT-JUD-66": { id: "EVT-JUD-66", name: "Até 66 kg", modalityId: "MOD-JUD-JUDO" },
  "EVT-JUD-73": { id: "EVT-JUD-73", name: "Até 73 kg", modalityId: "MOD-JUD-JUDO" },
  "EVT-JUD-81": { id: "EVT-JUD-81", name: "Até 81 kg", modalityId: "MOD-JUD-JUDO" },
  "EVT-JUD-90": { id: "EVT-JUD-90", name: "Até 90 kg", modalityId: "MOD-JUD-JUDO" },
  "EVT-JUD-100": { id: "EVT-JUD-100", name: "Até 100 kg", modalityId: "MOD-JUD-JUDO" },
  "EVT-JUD-100PLUS": { id: "EVT-JUD-100PLUS", name: "Acima de 100 kg", modalityId: "MOD-JUD-JUDO" },
  "EVT-JUD-EQUIPES": { id: "EVT-JUD-EQUIPES", name: "Equipes mistas", modalityId: "MOD-JUD-JUDO" },

  // === Lacrosse ==============================================================
  "EVT-LAC-TORNEIO": { id: "EVT-LAC-TORNEIO", name: "Torneio Lacrosse Sixes", modalityId: "MOD-LAC-SIXES" },

  // === Levantamento de Peso ==================================================
  "EVT-LEV-61": { id: "EVT-LEV-61", name: "Até 61 kg", modalityId: "MOD-LEV-LEVANTAMENTO" },
  "EVT-LEV-73": { id: "EVT-LEV-73", name: "Até 73 kg", modalityId: "MOD-LEV-LEVANTAMENTO" },
  "EVT-LEV-89": { id: "EVT-LEV-89", name: "Até 89 kg", modalityId: "MOD-LEV-LEVANTAMENTO" },
  "EVT-LEV-102": { id: "EVT-LEV-102", name: "Até 102 kg", modalityId: "MOD-LEV-LEVANTAMENTO" },
  "EVT-LEV-102PLUS": { id: "EVT-LEV-102PLUS", name: "Acima de 102 kg", modalityId: "MOD-LEV-LEVANTAMENTO" },

  // === Lutas =================================================================
  // Livre
  "EVT-LUT-LIVRE-57": { id: "EVT-LUT-LIVRE-57", name: "Até 57 kg", modalityId: "MOD-LUT-LIVRE" },
  "EVT-LUT-LIVRE-65": { id: "EVT-LUT-LIVRE-65", name: "Até 65 kg", modalityId: "MOD-LUT-LIVRE" },
  "EVT-LUT-LIVRE-74": { id: "EVT-LUT-LIVRE-74", name: "Até 74 kg", modalityId: "MOD-LUT-LIVRE" },
  "EVT-LUT-LIVRE-86": { id: "EVT-LUT-LIVRE-86", name: "Até 86 kg", modalityId: "MOD-LUT-LIVRE" },
  "EVT-LUT-LIVRE-97": { id: "EVT-LUT-LIVRE-97", name: "Até 97 kg", modalityId: "MOD-LUT-LIVRE" },
  "EVT-LUT-LIVRE-125": { id: "EVT-LUT-LIVRE-125", name: "Até 125 kg", modalityId: "MOD-LUT-LIVRE" },
  // Greco-Romana
  "EVT-LUT-GRECO-60": { id: "EVT-LUT-GRECO-60", name: "Até 60 kg", modalityId: "MOD-LUT-GRECO" },
  "EVT-LUT-GRECO-67": { id: "EVT-LUT-GRECO-67", name: "Até 67 kg", modalityId: "MOD-LUT-GRECO" },
  "EVT-LUT-GRECO-77": { id: "EVT-LUT-GRECO-77", name: "Até 77 kg", modalityId: "MOD-LUT-GRECO" },
  "EVT-LUT-GRECO-87": { id: "EVT-LUT-GRECO-87", name: "Até 87 kg", modalityId: "MOD-LUT-GRECO" },
  "EVT-LUT-GRECO-97": { id: "EVT-LUT-GRECO-97", name: "Até 97 kg", modalityId: "MOD-LUT-GRECO" },
  "EVT-LUT-GRECO-130": { id: "EVT-LUT-GRECO-130", name: "Até 130 kg", modalityId: "MOD-LUT-GRECO" },

  // === Natação (Esportes Aquáticos) ==========================================
  // Natação (piscina)
  "EVT-NAT-LIVRE-50": { id: "EVT-NAT-LIVRE-50", name: "50 m livre", modalityId: "MOD-NAT-NATACAO" },
  "EVT-NAT-LIVRE-100": { id: "EVT-NAT-LIVRE-100", name: "100 m livre", modalityId: "MOD-NAT-NATACAO" },
  "EVT-NAT-LIVRE-200": { id: "EVT-NAT-LIVRE-200", name: "200 m livre", modalityId: "MOD-NAT-NATACAO" },
  "EVT-NAT-LIVRE-400": { id: "EVT-NAT-LIVRE-400", name: "400 m livre", modalityId: "MOD-NAT-NATACAO" },
  "EVT-NAT-LIVRE-800": { id: "EVT-NAT-LIVRE-800", name: "800 m livre", modalityId: "MOD-NAT-NATACAO" },
  "EVT-NAT-LIVRE-1500": { id: "EVT-NAT-LIVRE-1500", name: "1500 m livre", modalityId: "MOD-NAT-NATACAO" },
  "EVT-NAT-COSTAS-100": { id: "EVT-NAT-COSTAS-100", name: "100 m costas", modalityId: "MOD-NAT-NATACAO" },
  "EVT-NAT-COSTAS-200": { id: "EVT-NAT-COSTAS-200", name: "200 m costas", modalityId: "MOD-NAT-NATACAO" },
  "EVT-NAT-PEITO-100": { id: "EVT-NAT-PEITO-100", name: "100 m peito", modalityId: "MOD-NAT-NATACAO" },
  "EVT-NAT-PEITO-200": { id: "EVT-NAT-PEITO-200", name: "200 m peito", modalityId: "MOD-NAT-NATACAO" },
  "EVT-NAT-BORBOLETA-100": { id: "EVT-NAT-BORBOLETA-100", name: "100 m borboleta", modalityId: "MOD-NAT-NATACAO" },
  "EVT-NAT-BORBOLETA-200": { id: "EVT-NAT-BORBOLETA-200", name: "200 m borboleta", modalityId: "MOD-NAT-NATACAO" },
  "EVT-NAT-MEDLEY-200": { id: "EVT-NAT-MEDLEY-200", name: "200 m medley", modalityId: "MOD-NAT-NATACAO" },
  "EVT-NAT-MEDLEY-400": { id: "EVT-NAT-MEDLEY-400", name: "400 m medley", modalityId: "MOD-NAT-NATACAO" },
  "EVT-NAT-REV-4X100-LIVRE": { id: "EVT-NAT-REV-4X100-LIVRE", name: "Revezamento 4x100 m livre", modalityId: "MOD-NAT-NATACAO" },
  "EVT-NAT-REV-4X200-LIVRE": { id: "EVT-NAT-REV-4X200-LIVRE", name: "Revezamento 4x200 m livre", modalityId: "MOD-NAT-NATACAO" },
  "EVT-NAT-REV-4X100-MEDLEY": { id: "EVT-NAT-REV-4X100-MEDLEY", name: "Revezamento 4x100 m medley", modalityId: "MOD-NAT-NATACAO" },
  "EVT-NAT-REV-MEDLEY-MISTO": { id: "EVT-NAT-REV-MEDLEY-MISTO", name: "Revezamento 4x100 m medley misto", modalityId: "MOD-NAT-NATACAO" },
  // Maratona Aquática
  "EVT-NAT-MARATONA-10KM": { id: "EVT-NAT-MARATONA-10KM", name: "Maratona aquática 10 km", modalityId: "MOD-NAT-MARATONA" },
  // Saltos Ornamentais
  "EVT-NAT-SALTO-3M": { id: "EVT-NAT-SALTO-3M", name: "Trampolim 3 m", modalityId: "MOD-NAT-SALTOS" },
  "EVT-NAT-SALTO-10M": { id: "EVT-NAT-SALTO-10M", name: "Plataforma 10 m", modalityId: "MOD-NAT-SALTOS" },
  "EVT-NAT-SALTO-SINC-3M": { id: "EVT-NAT-SALTO-SINC-3M", name: "Trampolim sincronizado 3 m", modalityId: "MOD-NAT-SALTOS" },
  "EVT-NAT-SALTO-SINC-10M": { id: "EVT-NAT-SALTO-SINC-10M", name: "Plataforma sincronizada 10 m", modalityId: "MOD-NAT-SALTOS" },
  // Nado Artístico
  "EVT-NAT-ART-DUETO": { id: "EVT-NAT-ART-DUETO", name: "Dueto", modalityId: "MOD-NAT-ARTISTICO" },
  "EVT-NAT-ART-EQUIPE": { id: "EVT-NAT-ART-EQUIPE", name: "Equipe", modalityId: "MOD-NAT-ARTISTICO" },

  // === Pentatlo Moderno ======================================================
  "EVT-PEN-INDIVIDUAL": { id: "EVT-PEN-INDIVIDUAL", name: "Pentatlo individual", modalityId: "MOD-PEN-PENTATLO" },

  // === Remo ==================================================================
  "EVT-REM-SKIFF-SIMPLES": { id: "EVT-REM-SKIFF-SIMPLES", name: "Skiff simples", modalityId: "MOD-REM-REMO" },
  "EVT-REM-SKIFF-DUPLO": { id: "EVT-REM-SKIFF-DUPLO", name: "Skiff duplo", modalityId: "MOD-REM-REMO" },
  "EVT-REM-SKIFF-DUPLO-LEVE": { id: "EVT-REM-SKIFF-DUPLO-LEVE", name: "Skiff duplo leve", modalityId: "MOD-REM-REMO" },
  "EVT-REM-DOIS-SEM": { id: "EVT-REM-DOIS-SEM", name: "Dois sem timoneiro", modalityId: "MOD-REM-REMO" },
  "EVT-REM-QUATRO-SEM": { id: "EVT-REM-QUATRO-SEM", name: "Quatro sem timoneiro", modalityId: "MOD-REM-REMO" },
  "EVT-REM-QUATRO-REMOS": { id: "EVT-REM-QUATRO-REMOS", name: "Quatro com remos", modalityId: "MOD-REM-REMO" },
  "EVT-REM-OITO": { id: "EVT-REM-OITO", name: "Oito com timoneiro", modalityId: "MOD-REM-REMO" },

  // === Rugby =================================================================
  "EVT-RUG-TORNEIO": { id: "EVT-RUG-TORNEIO", name: "Torneio Rugby Sevens", modalityId: "MOD-RUG-SEVENS" },

  // === Skate =================================================================
  "EVT-SKA-STREET": { id: "EVT-SKA-STREET", name: "Street", modalityId: "MOD-SKA-STREET" },
  "EVT-SKA-PARK": { id: "EVT-SKA-PARK", name: "Park", modalityId: "MOD-SKA-PARK" },

  // === Surfe =================================================================
  "EVT-SUR-SHORTBOARD": { id: "EVT-SUR-SHORTBOARD", name: "Shortboard", modalityId: "MOD-SUR-SHORTBOARD" },

  // === Squash ================================================================
  "EVT-SQU-INDIVIDUAL": { id: "EVT-SQU-INDIVIDUAL", name: "Torneio individual", modalityId: "MOD-SQU-SQUASH" },

  // === Taekwondo =============================================================
  "EVT-TAE-58": { id: "EVT-TAE-58", name: "Até 58 kg", modalityId: "MOD-TAE-KYORUGI" },
  "EVT-TAE-68": { id: "EVT-TAE-68", name: "Até 68 kg", modalityId: "MOD-TAE-KYORUGI" },
  "EVT-TAE-80": { id: "EVT-TAE-80", name: "Até 80 kg", modalityId: "MOD-TAE-KYORUGI" },
  "EVT-TAE-80PLUS": { id: "EVT-TAE-80PLUS", name: "Acima de 80 kg", modalityId: "MOD-TAE-KYORUGI" },

  // === Tênis =================================================================
  "EVT-TEN-SIMPLES": { id: "EVT-TEN-SIMPLES", name: "Simples", modalityId: "MOD-TEN-TENIS" },
  "EVT-TEN-DUPLAS": { id: "EVT-TEN-DUPLAS", name: "Duplas", modalityId: "MOD-TEN-TENIS" },
  "EVT-TEN-DUPLAS-MISTAS": { id: "EVT-TEN-DUPLAS-MISTAS", name: "Duplas mistas", modalityId: "MOD-TEN-TENIS" },

  // === Tênis de Mesa =========================================================
  "EVT-TENM-SIMPLES": { id: "EVT-TENM-SIMPLES", name: "Simples", modalityId: "MOD-TENM-MESA" },
  "EVT-TENM-DUPLAS": { id: "EVT-TENM-DUPLAS", name: "Duplas", modalityId: "MOD-TENM-MESA" },
  "EVT-TENM-EQUIPES": { id: "EVT-TENM-EQUIPES", name: "Por equipes", modalityId: "MOD-TENM-MESA" },
  "EVT-TENM-DUPLAS-MISTAS": { id: "EVT-TENM-DUPLAS-MISTAS", name: "Duplas mistas", modalityId: "MOD-TENM-MESA" },

  // === Tiro Esportivo ========================================================
  // Rifle
  "EVT-TIRE-CARABINA-AR-10M": { id: "EVT-TIRE-CARABINA-AR-10M", name: "Carabina de ar 10 m", modalityId: "MOD-TIRE-RIFLE" },
  "EVT-TIRE-CARABINA-3P-50M": { id: "EVT-TIRE-CARABINA-3P-50M", name: "Carabina 3 posições 50 m", modalityId: "MOD-TIRE-RIFLE" },
  // Pistola
  "EVT-TIRE-PISTOLA-AR-10M": { id: "EVT-TIRE-PISTOLA-AR-10M", name: "Pistola de ar 10 m", modalityId: "MOD-TIRE-PISTOLA" },
  "EVT-TIRE-PISTOLA-25M": { id: "EVT-TIRE-PISTOLA-25M", name: "Pistola 25 m", modalityId: "MOD-TIRE-PISTOLA" },
  // Shotgun
  "EVT-TIRE-TRAP": { id: "EVT-TIRE-TRAP", name: "Trap", modalityId: "MOD-TIRE-SHOTGUN" },
  "EVT-TIRE-SKEET": { id: "EVT-TIRE-SKEET", name: "Skeet", modalityId: "MOD-TIRE-SHOTGUN" },

  // === Tiro com Arco =========================================================
  "EVT-TIRA-INDIVIDUAL": { id: "EVT-TIRA-INDIVIDUAL", name: "Individual", modalityId: "MOD-TIRA-RECURVO" },
  "EVT-TIRA-EQUIPES": { id: "EVT-TIRA-EQUIPES", name: "Por equipes", modalityId: "MOD-TIRA-RECURVO" },
  "EVT-TIRA-EQUIPES-MISTAS": { id: "EVT-TIRA-EQUIPES-MISTAS", name: "Equipes mistas", modalityId: "MOD-TIRA-RECURVO" },

  // === Triatlo ===============================================================
  "EVT-TRI-INDIVIDUAL": { id: "EVT-TRI-INDIVIDUAL", name: "Individual", modalityId: "MOD-TRI-TRIATLO" },
  "EVT-TRI-REVEZAMENTO-MISTO": { id: "EVT-TRI-REVEZAMENTO-MISTO", name: "Revezamento misto", modalityId: "MOD-TRI-TRIATLO" },

  // === Vela ==================================================================
  "EVT-VEL-ILCA7": { id: "EVT-VEL-ILCA7", name: "Dinghy ILCA 7", modalityId: "MOD-VEL-DINGHY" },
  "EVT-VEL-ILCA6": { id: "EVT-VEL-ILCA6", name: "Dinghy ILCA 6", modalityId: "MOD-VEL-DINGHY" },
  "EVT-VEL-470": { id: "EVT-VEL-470", name: "470 misto", modalityId: "MOD-VEL-DINGHY" },
  "EVT-VEL-49ER": { id: "EVT-VEL-49ER", name: "49er", modalityId: "MOD-VEL-SKIFF" },
  "EVT-VEL-49ERFX": { id: "EVT-VEL-49ERFX", name: "49erFX", modalityId: "MOD-VEL-SKIFF" },
  "EVT-VEL-NACRA17": { id: "EVT-VEL-NACRA17", name: "Nacra 17", modalityId: "MOD-VEL-MULTICASCO" },
  "EVT-VEL-IQFOIL": { id: "EVT-VEL-IQFOIL", name: "iQFoil", modalityId: "MOD-VEL-PRANCHA" },
  "EVT-VEL-FORMULA-KITE": { id: "EVT-VEL-FORMULA-KITE", name: "Formula Kite", modalityId: "MOD-VEL-KITE" },

  // === Voleibol ==============================================================
  "EVT-VOL-QUADRA": { id: "EVT-VOL-QUADRA", name: "Torneio de quadra", modalityId: "MOD-VOL-QUADRA" },
  "EVT-VOL-PRAIA": { id: "EVT-VOL-PRAIA", name: "Torneio de praia", modalityId: "MOD-VOL-PRAIA" },
};

// Limita um número ao intervalo [min, max].
function clampEventValue(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// Busca um evento pelo id. Retorna undefined se não existir.
function getEvent(id) {
  return EVENTS[id];
}

// Retorna todos os eventos de uma modalidade.
function getEventsByModality(modalityId) {
  return Object.values(EVENTS).filter((event) => event.modalityId === modalityId);
}

// Retorna todos os eventos de um esporte (via a modalidade de cada evento).
function getEventsBySport(sportId) {
  return Object.values(EVENTS).filter((event) => {
    const modality = getModality(event.modalityId);
    return modality && modality.sportId === sportId;
  });
}

// Modalidade a que um evento pertence (objeto de modalities.js) ou undefined.
function getEventModality(event) {
  return event ? getModality(event.modalityId) : undefined;
}

// -----------------------------------------------------------------------------
// Modelo de desempenho (do evento) — aplicado apenas a eventos COM `performance`
//
// Força efetiva = Força − redutor de fadiga − redutor de forma.
//   - Fadiga acumulada = 100 − fatigue  (o stat `fatigue` começa em 100 = descansado;
//     quanto mais baixo, mais cansado). Redutor = fadiga acumulada × fatiguePenaltyPerPoint.
//   - Déficit de forma = 100 − ritmo  (ritmo 100 = forma plena; quanto mais baixo,
//     menos afiado). Redutor = déficit de forma × formPenaltyPerPoint.
//   - Ou seja: descansado (fatigue 100) e em plena forma (ritmo 100) não perde nada;
//     cansado E/OU fora de forma perde Força efetiva. Os dois redutores SOMAM — a
//     fadiga (curto prazo) e o ritmo (forma de temporada) são independentes.
//   - Sem `ritmo` definido, o déficit de forma é 0 (não penaliza) — retrocompatível.
//
// Tempo (100 m) = recordTime + (100 − Força efetiva) × secondsPerStrengthPoint.
//   - Força efetiva 100 → recorde (9,58 s). Quanto menor a Força efetiva, mais
//     lento (tempo maior). O tempo nunca fica abaixo do recorde.
// -----------------------------------------------------------------------------

// Força efetiva do atleta neste evento (aplica os redutores de fadiga e forma).
function effectiveStrengthForEvent(athlete, event) {
  const perf = event.performance;
  const accumulatedFatigue = 100 - athlete.fatigue; // 0 = descansado
  const fatigueReducer = accumulatedFatigue * perf.fatiguePenaltyPerPoint;

  // Ritmo/forma: 100 = forma plena. Ausente => sem penalidade (retrocompatível).
  const ritmo = athlete.ritmo != null ? athlete.ritmo : 100;
  const formDeficit = 100 - ritmo; // 0 = em plena forma
  const formPenaltyPerPoint = perf.formPenaltyPerPoint != null ? perf.formPenaltyPerPoint : 0;
  const formReducer = formDeficit * formPenaltyPerPoint;

  return clampEventValue(
    athlete.strength - fatigueReducer - formReducer,
    1,
    100
  );
}

// Resultado numérico do atleta no evento (aqui: o tempo dos 100 m).
function computeEventResult(athlete, event) {
  const perf = event.performance;
  const effective = effectiveStrengthForEvent(athlete, event);
  return perf.recordTime + (100 - effective) * perf.secondsPerStrengthPoint;
}

// Formata um resultado para exibição, conforme a métrica/precisão do evento.
function formatEventResult(value, event) {
  if (value == null) return "—";
  const { metric, precision = 2 } = event.resolution;
  const unit = ResultsEngine.UNITS[metric] || "";
  return `${value.toFixed(precision)} ${unit}`.trim();
}

// Gera o resultado de cada atleta e resolve o ranking pela ResultsEngine.
// Retorna [{ id, result, position }] — `result` é o valor alcançado (ex.: o tempo).
function resolveEvent(athletes, event) {
  const competitors = athletes.map((athlete) => ({
    id: athlete.id,
    value: computeEventResult(athlete, event),
  }));
  return ResultsEngine.resolveResults(competitors, event.resolution);
}
