// -----------------------------------------------------------------------------
// Gerador UNIVERSAL de torneios (campeonatos)
//
// Um torneio é montado combinando três eixos independentes e MODULARES:
//
//   1) COVERAGE (abrangência de conteúdo) — O QUE o torneio disputa:
//        { type: "event",    ids: [...] }  → provas específicas
//        { type: "modality", ids: [...] }  → todas as provas de modalidade(s)
//        { type: "sport",    ids: [...] }  → todas as provas de esporte(s)
//                                            (1 esporte, vários, ou..)
//        { type: "all" }                   → TODAS as provas (ex.: Olimpíadas)
//
//   2) FORMAT (formato) — COMO o torneio roda (ver TOURNAMENT_FORMATS):
//        "single"   — etapa única (todas as provas num dia)
//        "league"   — liga: N rodadas periódicas (pontos somam na temporada)
//        "multiday" — várias provas espalhadas por dias consecutivos
//        "knockout" — mata-mata (rodadas eliminatórias)
//
//   3) SCOPE (trava geográfica) — QUEM pode disputar (ver eligibility.js):
//        { level, placeId }, level ∈ region/state/country/city (e — futuro —
//        continent/world). Escolhível: regional, estadual, nacional, etc.
//
// `buildTournament(config)` resolve a coverage em uma lista de eventos, agenda as
// etapas conforme o formato (cada etapa sabe QUAIS eventos roda) e registra o
// torneio em CHAMPIONSHIPS. Assim, criar um torneio novo (de um evento, uma
// modalidade, um esporte, vários ou todos; em qualquer formato e qualquer trava)
// é só uma chamada de configuração — daí ser fácil manter e estender.
//
// Depende de: events.js (EVENTS, getEventsBySport/ByModality), modalities.js,
// championships.js (CHAMPIONSHIPS, nthSaturday), states/regions/cities.js.
//
// FORMATOS INSPIRADOS EM TORNEIOS REAIS (fontes possíveis — ver DOCUMENTACAO.md/
// DECISOES.md): liga ~ Wanda Diamond League (temporada de etapas, cada etapa com
// várias provas, pontos somam); multiday ~ programa do Atletismo nos Jogos
// Olímpicos / Campeonato Mundial de Atletismo (provas distribuídas em dias);
// mata-mata ~ chaves do tênis (Grand Slam) e das lutas/boxe/judô olímpicos.
// -----------------------------------------------------------------------------

// --- Coverage (abrangência de conteúdo) --------------------------------------

const TOURNAMENT_COVERAGE_TYPES = {
  ALL: "all",
  SPORT: "sport",
  MODALITY: "modality",
  EVENT: "event",
};

// Resolve uma coverage para a lista de ids de eventos que ela abrange.
function resolveCoverageEventIds(coverage) {
  if (!coverage) return [];
  switch (coverage.type) {
    case "all":
      return Object.values(EVENTS).map((e) => e.id);
    case "sport":
      return (coverage.ids || []).flatMap((id) =>
        getEventsBySport(id).map((e) => e.id)
      );
    case "modality":
      return (coverage.ids || []).flatMap((id) =>
        getEventsByModality(id).map((e) => e.id)
      );
    case "event":
      return (coverage.ids || []).slice();
    default:
      return [];
  }
}

// --- Scope (trava geográfica) ------------------------------------------------

// Níveis de trava disponíveis. region/state/country/city são aplicados hoje
// (ver eligibility.js); continent/world ficam prontos para quando houver
// geografia internacional (mais de um país) — ver TODO.md.
const TOURNAMENT_SCOPE_LEVELS = {
  REGIONAL: "region",
  ESTADUAL: "state",
  NACIONAL: "country",
  CIDADE: "city",
  CONTINENTAL: "continent",
  MUNDIAL: "world",
};

// Monta um objeto de escopo { level, placeId }.
function buildScope(level, placeId) {
  return { level, placeId: placeId != null ? placeId : null };
}

// --- Formatos (agendamento das etapas) ---------------------------------------
// Cada formato é uma função (eventIds, config) → [{ number, date, events }].
// `events` de cada etapa são os eventos disputados NAQUELA etapa.

const TOURNAMENT_FORMATS = {
  // Etapa única: todas as provas num único dia.
  single(eventIds, cfg) {
    const { year = 2026, month = 0, nth = 2 } = cfg;
    return [{ number: 1, date: nthSaturday(year, month, nth), events: eventIds.slice() }];
  },

  // Liga: N rodadas periódicas (uma por mês). Cada rodada roda TODAS as provas
  // (uma "etapa" da temporada); os pontos somam ao longo do ano (ranking.js).
  league(eventIds, cfg) {
    const { startYear = 2026, startMonth = 0, rounds = 10, nth = 2 } = cfg;
    const stages = [];
    for (let i = 0; i < rounds; i++) {
      const ref = new Date(startYear, startMonth + i, 1);
      stages.push({
        number: i + 1,
        date: nthSaturday(ref.getFullYear(), ref.getMonth(), nth),
        events: eventIds.slice(),
      });
    }
    return stages;
  },

  // Vários dias: `days` dias consecutivos, com as provas DISTRIBUÍDAS entre os
  // dias (round-robin). Ex.: torneio de dois dias com modalidades diferentes.
  multiday(eventIds, cfg) {
    const { startYear = 2026, startMonth = 0, nth = 2, days = 2 } = cfg;
    const start = nthSaturday(startYear, startMonth, nth);
    const perDay = Array.from({ length: days }, () => []);
    eventIds.forEach((id, i) => perDay[i % days].push(id));
    const stages = [];
    for (let d = 0; d < days; d++) {
      const date = new Date(start);
      date.setDate(start.getDate() + d);
      stages.push({ number: d + 1, date, events: perDay[d] });
    }
    return stages;
  },

  // Mata-mata: `rounds` rodadas eliminatórias (uma por semana). Por ora a
  // resolução de cada rodada usa o ranking padrão (ver participation.js); a
  // lógica de CHAVE (quem avança contra quem) é futura (ver TODO.md).
  knockout(eventIds, cfg) {
    const { startYear = 2026, startMonth = 0, nth = 2, rounds = 3, daysBetween = 7 } = cfg;
    const start = nthSaturday(startYear, startMonth, nth);
    const stages = [];
    for (let r = 0; r < rounds; r++) {
      const date = new Date(start);
      date.setDate(start.getDate() + r * daysBetween);
      stages.push({ number: r + 1, date, events: eventIds.slice() });
    }
    return stages;
  },
};

// Agenda as etapas de um torneio conforme o formato (default: liga).
function scheduleTournamentStages(format, eventIds) {
  const type = (format && format.type) || "league";
  const builder = TOURNAMENT_FORMATS[type] || TOURNAMENT_FORMATS.league;
  return builder(eventIds, format || {});
}

// --- Gerador ------------------------------------------------------------------

// Cria um torneio a partir de coverage + format + scope e o registra em
// CHAMPIONSHIPS. Retorna o torneio criado.
function buildTournament(config) {
  const {
    id,
    name,
    countryId = null,
    categoryId = null,
    scope = null,
    coverage = null,
    format = { type: "league" },
    clubQuota = null,
    ageRestriction = null,
  } = config;

  const events = resolveCoverageEventIds(coverage);
  const stages = scheduleTournamentStages(format, events);

  const championship = {
    id,
    name,
    participants: 0,
    countryId,
    categoryId,
    scope,
    coverage,
    format,
    clubQuota,
    ageRestriction: ageRestriction || undefined,
    events, // lista resolvida (ver getChampionshipEvents)
    competitors: [],
    stages,
  };
  CHAMPIONSHIPS[id] = championship;
  return championship;
}

// Gera o calendário geográfico de um país (Estaduais por estado com cidade e
// Regionais por região com cidade), todos com a MESMA coverage/format. Genérico:
// serve qualquer país. Só cria para lugares COM cidade na database.
function buildCountryGeographicChampionships(config) {
  const {
    countryId,
    coverage,
    startYear = 2026,
    startMonth = 0,
    rounds = 10,
    estadualNth = 1, // estaduais no 1º sábado
    regionalNth = 3, // regionais no 3º sábado (nacional fica no 2º)
    clubQuota = null,
  } = config;
  const created = [];

  for (const state of getStatesByCountry(countryId)) {
    if (getCitiesByState(state.id).length === 0) continue;
    created.push(
      buildTournament({
        id: `CAMP-EST-${state.abbreviation}-${startYear}`,
        name: `Campeonato Estadual de ${state.name}`,
        countryId,
        categoryId: "CAT-ESTADUAL",
        scope: buildScope("state", state.id),
        coverage,
        format: { type: "league", startYear, startMonth, rounds, nth: estadualNth },
        clubQuota,
      })
    );
  }

  for (const region of getRegionsByCountry(countryId)) {
    const hasCity = getStatesByRegion(region.id).some(
      (state) => getCitiesByState(state.id).length > 0
    );
    if (!hasCity) continue;
    const regionSlug = region.id.replace("REG-", "");
    created.push(
      buildTournament({
        id: `CAMP-REG-${regionSlug}-${startYear}`,
        name: `Campeonato Regional ${region.name}`,
        countryId,
        categoryId: "CAT-REGIONAL",
        scope: buildScope("region", region.id),
        coverage,
        format: { type: "league", startYear, startMonth, rounds, nth: regionalNth },
        clubQuota,
      })
    );
  }

  return created;
}

// -----------------------------------------------------------------------------
// Calendário do Brasil (único país atual). Para simplificar, TODOS os torneios
// existentes são de Atletismo e abrangem TODAS as modalidades/eventos
// (coverage por esporte). Formato liga (10 etapas mensais), como antes.
// -----------------------------------------------------------------------------
const BRA_ATLETISMO_COVERAGE = { type: "sport", ids: ["SPT-ATLETISMO"] };

// Nacional (CNA) — Atletismo (tudo), país=Brasil, cota 1 por clube por evento.
buildTournament({
  id: "CNA-2026",
  name: "Campeonato Nacional de Atletismo",
  countryId: "BRA",
  categoryId: "CAT-NACIONAL",
  scope: buildScope("country", "BRA"),
  coverage: BRA_ATLETISMO_COVERAGE,
  format: { type: "league", startYear: 2026, startMonth: 0, rounds: 10, nth: 2 },
  clubQuota: 1,
});

// Estaduais e Regionais — mesma coverage (Atletismo, tudo).
buildCountryGeographicChampionships({
  countryId: "BRA",
  coverage: BRA_ATLETISMO_COVERAGE,
});
