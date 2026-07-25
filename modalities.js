// -----------------------------------------------------------------------------
// Entidade: Modalidades (Modalities)
//
// Uma MODALIDADE agrupa os EVENTOS (provas) de um ESPORTE. A hierarquia é:
//
//     Esporte  →  Modalidade  →  Evento
//
// Exemplo: no Atletismo (esporte), a "Velocidade" (modalidade) reúne provas como
// os 100 m rasos (evento). Ou seja: o esporte tem modalidades e a modalidade tem
// eventos. Os EVENTOS resolvíveis (com o modelo de resultado) ficam em events.js.
//
// Cada modalidade possui:
//   - id       : identificador único (ex.: "MOD-ATL-VELOCIDADE")
//   - name     : nome da modalidade (ex.: "Velocidade")
//   - sportId  : esporte a que pertence (ver sports.js)
//
// Assim como esportes/clubes/cidades, as modalidades NÃO são geradas: são uma
// database inicial montada a partir da lista de modalidades olímpicas por esporte.
// Ainda SEM UI (ver TODO.md).
// -----------------------------------------------------------------------------

const MODALITIES = {
  // --- Atletismo ---------------------------------------------------------------
  "MOD-ATL-VELOCIDADE": { id: "MOD-ATL-VELOCIDADE", name: "Velocidade", sportId: "SPT-ATLETISMO" },
  "MOD-ATL-MEIO-FUNDO": { id: "MOD-ATL-MEIO-FUNDO", name: "Meio-fundo", sportId: "SPT-ATLETISMO" },
  "MOD-ATL-FUNDO": { id: "MOD-ATL-FUNDO", name: "Fundo", sportId: "SPT-ATLETISMO" },
  "MOD-ATL-BARREIRAS": { id: "MOD-ATL-BARREIRAS", name: "Barreiras", sportId: "SPT-ATLETISMO" },
  "MOD-ATL-OBSTACULOS": { id: "MOD-ATL-OBSTACULOS", name: "Obstáculos", sportId: "SPT-ATLETISMO" },
  "MOD-ATL-REVEZAMENTOS": { id: "MOD-ATL-REVEZAMENTOS", name: "Revezamentos", sportId: "SPT-ATLETISMO" },
  "MOD-ATL-SALTOS": { id: "MOD-ATL-SALTOS", name: "Saltos", sportId: "SPT-ATLETISMO" },
  "MOD-ATL-LANCAMENTOS": { id: "MOD-ATL-LANCAMENTOS", name: "Arremessos/Lançamentos", sportId: "SPT-ATLETISMO" },
  "MOD-ATL-MARCHA": { id: "MOD-ATL-MARCHA", name: "Marcha Atlética", sportId: "SPT-ATLETISMO" },
  "MOD-ATL-COMBINADAS": { id: "MOD-ATL-COMBINADAS", name: "Provas Combinadas", sportId: "SPT-ATLETISMO" },

  // --- Badminton ---------------------------------------------------------------
  "MOD-BAD-BADMINTON": { id: "MOD-BAD-BADMINTON", name: "Badminton", sportId: "SPT-BADMINTON" },

  // --- Basquete ----------------------------------------------------------------
  "MOD-BAS-5X5": { id: "MOD-BAS-5X5", name: "Basquete 5x5", sportId: "SPT-BASQUETE" },
  "MOD-BAS-3X3": { id: "MOD-BAS-3X3", name: "Basquete 3x3", sportId: "SPT-BASQUETE" },

  // --- Beisebol/Softbol --------------------------------------------------------
  "MOD-BEI-BEISEBOL": { id: "MOD-BEI-BEISEBOL", name: "Beisebol", sportId: "SPT-BEISEBOL" },
  "MOD-BEI-SOFTBOL": { id: "MOD-BEI-SOFTBOL", name: "Softbol", sportId: "SPT-BEISEBOL" },

  // --- Boxe --------------------------------------------------------------------
  "MOD-BOX-BOXE": { id: "MOD-BOX-BOXE", name: "Boxe", sportId: "SPT-BOXE" },

  // --- Canoagem ----------------------------------------------------------------
  "MOD-CAN-VELOCIDADE": { id: "MOD-CAN-VELOCIDADE", name: "Velocidade (Sprint)", sportId: "SPT-CANOAGEM" },
  "MOD-CAN-SLALOM": { id: "MOD-CAN-SLALOM", name: "Slalom", sportId: "SPT-CANOAGEM" },

  // --- Ciclismo ----------------------------------------------------------------
  "MOD-CIC-ESTRADA": { id: "MOD-CIC-ESTRADA", name: "Estrada", sportId: "SPT-CICLISMO" },
  "MOD-CIC-PISTA": { id: "MOD-CIC-PISTA", name: "Pista", sportId: "SPT-CICLISMO" },
  "MOD-CIC-MTB": { id: "MOD-CIC-MTB", name: "Mountain Bike", sportId: "SPT-CICLISMO" },
  "MOD-CIC-BMX-RACING": { id: "MOD-CIC-BMX-RACING", name: "BMX Racing", sportId: "SPT-CICLISMO" },
  "MOD-CIC-BMX-FREESTYLE": { id: "MOD-CIC-BMX-FREESTYLE", name: "BMX Freestyle", sportId: "SPT-CICLISMO" },

  // --- Críquete ----------------------------------------------------------------
  "MOD-CRI-T20": { id: "MOD-CRI-T20", name: "Twenty20 (T20)", sportId: "SPT-CRIQUETE" },

  // --- Escalada Esportiva ------------------------------------------------------
  "MOD-ESC-VELOCIDADE": { id: "MOD-ESC-VELOCIDADE", name: "Velocidade (Speed)", sportId: "SPT-ESCALADA" },
  "MOD-ESC-BOULDER": { id: "MOD-ESC-BOULDER", name: "Boulder", sportId: "SPT-ESCALADA" },
  "MOD-ESC-GUIADA": { id: "MOD-ESC-GUIADA", name: "Guiada (Lead)", sportId: "SPT-ESCALADA" },

  // --- Esgrima -----------------------------------------------------------------
  "MOD-ESG-FLORETE": { id: "MOD-ESG-FLORETE", name: "Florete", sportId: "SPT-ESGRIMA" },
  "MOD-ESG-ESPADA": { id: "MOD-ESG-ESPADA", name: "Espada", sportId: "SPT-ESGRIMA" },
  "MOD-ESG-SABRE": { id: "MOD-ESG-SABRE", name: "Sabre", sportId: "SPT-ESGRIMA" },

  // --- Flag Football -----------------------------------------------------------
  "MOD-FLAG-FLAG": { id: "MOD-FLAG-FLAG", name: "Flag Football", sportId: "SPT-FLAG-FOOTBALL" },

  // --- Futebol -----------------------------------------------------------------
  "MOD-FUT-FUTEBOL": { id: "MOD-FUT-FUTEBOL", name: "Futebol", sportId: "SPT-FUTEBOL" },

  // --- Ginástica ---------------------------------------------------------------
  "MOD-GIN-ARTISTICA": { id: "MOD-GIN-ARTISTICA", name: "Artística", sportId: "SPT-GINASTICA" },
  "MOD-GIN-RITMICA": { id: "MOD-GIN-RITMICA", name: "Rítmica", sportId: "SPT-GINASTICA" },
  "MOD-GIN-TRAMPOLIM": { id: "MOD-GIN-TRAMPOLIM", name: "Trampolim", sportId: "SPT-GINASTICA" },

  // --- Golfe -------------------------------------------------------------------
  "MOD-GOL-GOLFE": { id: "MOD-GOL-GOLFE", name: "Golfe", sportId: "SPT-GOLFE" },

  // --- Handebol ----------------------------------------------------------------
  "MOD-HAN-INDOOR": { id: "MOD-HAN-INDOOR", name: "Handebol Indoor", sportId: "SPT-HANDEBOL" },

  // --- Hipismo -----------------------------------------------------------------
  "MOD-HIP-ADESTRAMENTO": { id: "MOD-HIP-ADESTRAMENTO", name: "Adestramento", sportId: "SPT-HIPISMO" },
  "MOD-HIP-CCE": { id: "MOD-HIP-CCE", name: "Concurso Completo de Equitação (CCE)", sportId: "SPT-HIPISMO" },
  "MOD-HIP-SALTOS": { id: "MOD-HIP-SALTOS", name: "Saltos", sportId: "SPT-HIPISMO" },

  // --- Hóquei sobre Grama ------------------------------------------------------
  "MOD-HOQ-GRAMA": { id: "MOD-HOQ-GRAMA", name: "Hóquei sobre Grama", sportId: "SPT-HOQUEI-GRAMA" },

  // --- Judô --------------------------------------------------------------------
  "MOD-JUD-JUDO": { id: "MOD-JUD-JUDO", name: "Judô", sportId: "SPT-JUDO" },

  // --- Lacrosse ----------------------------------------------------------------
  "MOD-LAC-SIXES": { id: "MOD-LAC-SIXES", name: "Lacrosse Sixes", sportId: "SPT-LACROSSE" },

  // --- Levantamento de Peso ----------------------------------------------------
  "MOD-LEV-LEVANTAMENTO": { id: "MOD-LEV-LEVANTAMENTO", name: "Levantamento de Peso", sportId: "SPT-LEVANTAMENTO-PESO" },

  // --- Lutas -------------------------------------------------------------------
  "MOD-LUT-LIVRE": { id: "MOD-LUT-LIVRE", name: "Livre", sportId: "SPT-LUTAS" },
  "MOD-LUT-GRECO": { id: "MOD-LUT-GRECO", name: "Greco-Romana", sportId: "SPT-LUTAS" },

  // --- Natação (Esportes Aquáticos) --------------------------------------------
  "MOD-NAT-NATACAO": { id: "MOD-NAT-NATACAO", name: "Natação", sportId: "SPT-NATACAO" },
  "MOD-NAT-MARATONA": { id: "MOD-NAT-MARATONA", name: "Maratona Aquática", sportId: "SPT-NATACAO" },
  "MOD-NAT-SALTOS": { id: "MOD-NAT-SALTOS", name: "Saltos Ornamentais", sportId: "SPT-NATACAO" },
  "MOD-NAT-ARTISTICO": { id: "MOD-NAT-ARTISTICO", name: "Nado Artístico", sportId: "SPT-NATACAO" },

  // --- Pentatlo Moderno --------------------------------------------------------
  "MOD-PEN-PENTATLO": { id: "MOD-PEN-PENTATLO", name: "Pentatlo Moderno", sportId: "SPT-PENTATLO" },

  // --- Remo --------------------------------------------------------------------
  "MOD-REM-REMO": { id: "MOD-REM-REMO", name: "Remo", sportId: "SPT-REMO" },

  // --- Rugby -------------------------------------------------------------------
  "MOD-RUG-SEVENS": { id: "MOD-RUG-SEVENS", name: "Rugby Sevens", sportId: "SPT-RUGBY" },

  // --- Skate -------------------------------------------------------------------
  "MOD-SKA-STREET": { id: "MOD-SKA-STREET", name: "Street", sportId: "SPT-SKATE" },
  "MOD-SKA-PARK": { id: "MOD-SKA-PARK", name: "Park", sportId: "SPT-SKATE" },

  // --- Surfe -------------------------------------------------------------------
  "MOD-SUR-SHORTBOARD": { id: "MOD-SUR-SHORTBOARD", name: "Shortboard", sportId: "SPT-SURFE" },

  // --- Squash ------------------------------------------------------------------
  "MOD-SQU-SQUASH": { id: "MOD-SQU-SQUASH", name: "Squash", sportId: "SPT-SQUASH" },

  // --- Taekwondo ---------------------------------------------------------------
  "MOD-TAE-KYORUGI": { id: "MOD-TAE-KYORUGI", name: "Kyorugi", sportId: "SPT-TAEKWONDO" },

  // --- Tênis -------------------------------------------------------------------
  "MOD-TEN-TENIS": { id: "MOD-TEN-TENIS", name: "Tênis", sportId: "SPT-TENIS" },

  // --- Tênis de Mesa -----------------------------------------------------------
  "MOD-TENM-MESA": { id: "MOD-TENM-MESA", name: "Tênis de Mesa", sportId: "SPT-TENIS-MESA" },

  // --- Tiro Esportivo ----------------------------------------------------------
  "MOD-TIRE-RIFLE": { id: "MOD-TIRE-RIFLE", name: "Rifle", sportId: "SPT-TIRO-ESPORTIVO" },
  "MOD-TIRE-PISTOLA": { id: "MOD-TIRE-PISTOLA", name: "Pistola", sportId: "SPT-TIRO-ESPORTIVO" },
  "MOD-TIRE-SHOTGUN": { id: "MOD-TIRE-SHOTGUN", name: "Shotgun", sportId: "SPT-TIRO-ESPORTIVO" },

  // --- Tiro com Arco -----------------------------------------------------------
  "MOD-TIRA-RECURVO": { id: "MOD-TIRA-RECURVO", name: "Recurvo", sportId: "SPT-TIRO-ARCO" },

  // --- Triatlo -----------------------------------------------------------------
  "MOD-TRI-TRIATLO": { id: "MOD-TRI-TRIATLO", name: "Triatlo", sportId: "SPT-TRIATLO" },

  // --- Vela --------------------------------------------------------------------
  "MOD-VEL-DINGHY": { id: "MOD-VEL-DINGHY", name: "Dinghy", sportId: "SPT-VELA" },
  "MOD-VEL-SKIFF": { id: "MOD-VEL-SKIFF", name: "Skiff", sportId: "SPT-VELA" },
  "MOD-VEL-MULTICASCO": { id: "MOD-VEL-MULTICASCO", name: "Multicasco", sportId: "SPT-VELA" },
  "MOD-VEL-PRANCHA": { id: "MOD-VEL-PRANCHA", name: "Prancha à Vela", sportId: "SPT-VELA" },
  "MOD-VEL-KITE": { id: "MOD-VEL-KITE", name: "Kite", sportId: "SPT-VELA" },

  // --- Voleibol ----------------------------------------------------------------
  "MOD-VOL-QUADRA": { id: "MOD-VOL-QUADRA", name: "Quadra", sportId: "SPT-VOLEI" },
  "MOD-VOL-PRAIA": { id: "MOD-VOL-PRAIA", name: "Praia", sportId: "SPT-VOLEI" },
};

// Busca uma modalidade pelo id. Retorna undefined se não existir.
function getModality(id) {
  return MODALITIES[id];
}

// Retorna todas as modalidades de um esporte.
function getModalitiesBySport(sportId) {
  return Object.values(MODALITIES).filter(
    (modality) => modality.sportId === sportId
  );
}

// Esporte a que uma modalidade pertence (objeto de sports.js) ou undefined.
function getModalitySport(modality) {
  return modality ? getSport(modality.sportId) : undefined;
}
