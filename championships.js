// -----------------------------------------------------------------------------
// Entidade: Campeonatos (Championships)
// Relaciona-se com os países (countries.js) através de countryId.
//
// Cada campeonato possui:
//   - id           : identificador único
//   - name         : nome do campeonato
//   - participants : número de participantes (0 inicialmente)
//   - countryId    : referência ao país (ver countries.js)
//   - sportId      : esporte disputado (ver sports.js) — todo campeonato tem um
//   - categoryId   : categoria/porte no calendário (ver competitionCategories.js)
//   - scope        : abrangência geográfica { level, placeId } — a TRAVA de
//                    inscrição (ver eligibility.js). level ∈ country/region/
//                    state/city; placeId aponta para a entidade correspondente.
//                    Só atletas daquele recorte podem disputar.
//   - events       : eventos
//   - modalities   : modalidades
//   - competitors  : lista de participantes
//   - stages       : etapas (datas calculadas)
// -----------------------------------------------------------------------------

// Retorna a data do N-ésimo sábado de um determinado mês/ano (n = 1, 2, 3, ...).
function nthSaturday(year, month, n) {
  const firstWeekday = new Date(year, month, 1).getDay(); // 0=Dom ... 6=Sáb
  const offsetToFirstSaturday = (6 - firstWeekday + 7) % 7;
  const firstSaturday = 1 + offsetToFirstSaturday;
  return new Date(year, month, firstSaturday + (n - 1) * 7);
}

// Retorna a data do segundo sábado de um determinado mês/ano.
function secondSaturday(year, month) {
  return nthSaturday(year, month, 2);
}

// Gera `count` etapas, uma por mês, sempre no N-ésimo sábado (nth), a partir de
// (startYear, startMonth). Níveis diferentes usam sábados diferentes para não
// colidir no calendário (ex.: estadual no 1º, nacional no 2º, regional no 3º).
function buildMonthlyStagesOn(startYear, startMonth, count, nth) {
  const stages = [];
  for (let i = 0; i < count; i++) {
    const ref = new Date(startYear, startMonth + i, 1);
    stages.push({
      number: i + 1,
      date: nthSaturday(ref.getFullYear(), ref.getMonth(), nth),
    });
  }
  return stages;
}

// Gera `count` etapas mensais no segundo sábado (compatibilidade).
function buildMonthlyStages(startYear, startMonth, count) {
  return buildMonthlyStagesOn(startYear, startMonth, count, 2);
}

const CHAMPIONSHIPS = {
  // ID única do campeonato.
  "CNA-2026": {
    id: "CNA-2026",
    name: "Campeonato Nacional de Atletismo",
    participants: 0,
    countryId: "BRA",
    sportId: "SPT-ATLETISMO", // esporte disputado (ver sports.js)
    categoryId: "CAT-NACIONAL", // porte no calendário (ver competitionCategories.js)
    // Trava de inscrição: campeonato nacional → só atletas do Brasil (ver eligibility.js).
    scope: { level: "country", placeId: "BRA" },
    events: [],
    modalities: ["MOD-ATL-100M"], // provas disputadas (ver modalities.js)
    competitors: [],
    // 10 etapas, sempre no segundo sábado de cada mês, começando em janeiro/2026.
    stages: buildMonthlyStages(2026, 0, 10),
  },
};

// Esporte disputado por um campeonato (objeto de sports.js) ou undefined.
function getChampionshipSport(championship) {
  return getSport(championship.sportId);
}

// Categoria/porte de um campeonato (objeto de competitionCategories.js) ou
// undefined. Dela o campeonato herda prestígio, pontos de ranking e — futuro —
// premiação.
function getChampionshipCategory(championship) {
  return getCompetitionCategory(championship.categoryId);
}

// Abrangência geográfica (trava de inscrição) de um campeonato: { level, placeId }.
// Retorna null se o campeonato não declarar escopo (sem trava).
function getChampionshipScope(championship) {
  return championship.scope || null;
}

// Compara duas datas por ano/mês/dia.
function sameCalendarDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// Retorna as etapas (de qualquer campeonato) que ocorrem em uma data.
// Cada item: { championship, stage }.
function getStagesOnDate(date) {
  const result = [];
  for (const championship of Object.values(CHAMPIONSHIPS)) {
    for (const stage of championship.stages) {
      if (sameCalendarDay(stage.date, date)) {
        result.push({ championship, stage });
      }
    }
  }
  return result;
}

// Reduz uma data a ano/mês/dia (meia-noite), para comparar por dia.
function toDayStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// Lógica de realização de uma etapa (NÃO usa datas fixas/hardcoded):
// a etapa é considerada REALIZADA ao chegar no dia da sua data de realização
// ou em qualquer dia posterior, comparando com a data de referência
// (normalmente a data atual da simulação).
function isStageDone(stage, referenceDate) {
  return toDayStart(referenceDate) >= toDayStart(stage.date);
}

// Situação de um campeonato em relação a uma data: quantas etapas já ocorreram.
function championshipProgress(championship, referenceDate) {
  const done = championship.stages.filter((stage) =>
    isStageDone(stage, referenceDate)
  ).length;
  return { done, total: championship.stages.length };
}

// -----------------------------------------------------------------------------
// Gerador do calendário geográfico de um país
//
// A partir da GEOGRAFIA de um país (regiões e estados — ver regions.js/states.js)
// e das CIDADES que existem na database (cities.js), cria os campeonatos
// Estaduais (um por estado) e Regionais (um por região). É GENÉRICO: serve
// qualquer país; basta informar o esporte/modalidade e o país. Os campeonatos
// gerados recebem `categoryId` (Estadual/Regional) e `scope` (a trava de
// inscrição), e são registrados em CHAMPIONSHIPS.
//
// Só cria competições para lugares COM cidade na database: um estado sem cidade
// (ou uma região sem nenhuma cidade nos seus estados) NÃO gera campeonato. Assim
// o calendário reflete exatamente as cidades que temos.
// -----------------------------------------------------------------------------
function buildCountryGeographicChampionships(config) {
  const {
    countryId,
    sportId,
    modalityId,
    startYear = 2026,
    startMonth = 0,
    stageCount = 10,
    estadualNthSaturday = 1, // estaduais no 1º sábado do mês
    regionalNthSaturday = 3, // regionais no 3º sábado (nacional fica no 2º)
  } = config;

  const modalities = modalityId ? [modalityId] : [];
  const created = [];

  // Estaduais: um por estado do país que possua ao menos uma cidade na database.
  for (const state of getStatesByCountry(countryId)) {
    if (getCitiesByState(state.id).length === 0) continue; // sem cidade → não cria
    const championship = {
      id: `CAMP-EST-${state.abbreviation}-${startYear}`,
      name: `Campeonato Estadual de ${state.name}`,
      participants: 0,
      countryId,
      sportId,
      categoryId: "CAT-ESTADUAL",
      scope: { level: "state", placeId: state.id },
      events: [],
      modalities,
      competitors: [],
      stages: buildMonthlyStagesOn(startYear, startMonth, stageCount, estadualNthSaturday),
    };
    CHAMPIONSHIPS[championship.id] = championship;
    created.push(championship);
  }

  // Regionais: um por região do país que possua ao menos uma cidade (via estados).
  for (const region of getRegionsByCountry(countryId)) {
    const hasCity = getStatesByRegion(region.id).some(
      (state) => getCitiesByState(state.id).length > 0
    );
    if (!hasCity) continue; // região sem nenhuma cidade → não cria
    const regionSlug = region.id.replace("REG-", "");
    const championship = {
      id: `CAMP-REG-${regionSlug}-${startYear}`,
      name: `Campeonato Regional ${region.name}`,
      participants: 0,
      countryId,
      sportId,
      categoryId: "CAT-REGIONAL",
      scope: { level: "region", placeId: region.id },
      events: [],
      modalities,
      competitors: [],
      stages: buildMonthlyStagesOn(startYear, startMonth, stageCount, regionalNthSaturday),
    };
    CHAMPIONSHIPS[championship.id] = championship;
    created.push(championship);
  }

  return created;
}

// Popula o calendário do Brasil (único país atual) a partir da sua geografia:
// campeonatos Estaduais e Regionais de Atletismo (100 m). O Nacional (CNA-2026)
// já está na database acima. Ao adicionar outros países, chamar este gerador
// para cada um.
buildCountryGeographicChampionships({
  countryId: "BRA",
  sportId: "SPT-ATLETISMO",
  modalityId: "MOD-ATL-100M",
});
