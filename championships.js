// -----------------------------------------------------------------------------
// Entidade: Campeonatos (Championships)
// Relaciona-se com os países (countries.js) através de countryId.
//
// Um campeonato/TORNEIO é MODULAR: o gerador universal (ver tournaments.js) monta
// campeonatos combinando ABRANGÊNCIA DE CONTEÚDO (coverage), FORMATO (format) e
// TRAVA GEOGRÁFICA (scope). Esta entidade guarda o resultado dessa combinação.
//
// Cada campeonato possui:
//   - id           : identificador único
//   - name         : nome do campeonato
//   - participants : número de participantes (0 inicialmente)
//   - countryId    : país organizador (para portes nacional/subnacional)
//   - categoryId   : categoria/porte no calendário (ver competitionCategories.js)
//   - scope        : abrangência geográfica { level, placeId } — TRAVA de
//                    inscrição (ver eligibility.js). level ∈ country/region/
//                    state/city (e — futuro — continental/world). Só atletas
//                    daquele recorte podem disputar.
//   - coverage     : ABRANGÊNCIA DE CONTEÚDO { type, ids } — o que o torneio
//                    disputa: type ∈ "all"/"sport"/"modality"/"event" (ver
//                    tournaments.js). Resolvida para a lista de eventos abaixo.
//   - format       : FORMATO { type, ... } — como o torneio roda (single/league/
//                    multiday/knockout — ver tournaments.js).
//   - ageRestriction : TRAVA de idade { minAge, maxAge } (opcional) — uso FUTURO.
//   - clubQuota    : TRAVA de cota — máx. de atletas por clube POR EVENTO de uma
//                    etapa (ou ausente/null = sem limite). Ex.: CNA = 1.
//   - events       : lista (resolvida) de ids de eventos que o torneio abrange
//                    (derivada de coverage — ver getChampionshipEvents).
//   - competitors  : lista de participantes
//   - stages       : etapas — cada uma { number, date, events: [ids] } (os
//                    eventos disputados naquela etapa, conforme o formato).
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

// Lista viva de campeonatos. Começa VAZIA — o gerador universal (tournaments.js)
// popula o calendário (Nacional + Estaduais + Regionais, etc.) ao carregar.
const CHAMPIONSHIPS = {};

// Eventos (ids) que um campeonato abrange — a lista resolvida da sua coverage,
// guardada no campo `events` ao ser gerado (ver tournaments.js).
function getChampionshipEvents(championship) {
  return (championship.events || []).slice();
}

// Esportes distintos abrangidos por um campeonato (derivados dos seus eventos →
// modalidades → esportes). Um torneio pode ter 1 (Atletismo), vários ou todos.
function getChampionshipSports(championship) {
  const sportIds = new Set();
  for (const eventId of getChampionshipEvents(championship)) {
    const event = getEvent(eventId);
    if (!event) continue;
    const modality = getModality(event.modalityId);
    if (modality) sportIds.add(modality.sportId);
  }
  return [...sportIds].map((id) => getSport(id)).filter(Boolean);
}

// Esporte de um campeonato de esporte ÚNICO (objeto de sports.js), ou undefined
// se ele abranger mais de um esporte (multiesportivo/Olimpíadas).
function getChampionshipSport(championship) {
  const sports = getChampionshipSports(championship);
  return sports.length === 1 ? sports[0] : undefined;
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

// Trava de idade de um campeonato: { minAge, maxAge } ou null (sem restrição).
function getChampionshipAgeRestriction(championship) {
  return championship.ageRestriction || null;
}

// Trava de cota por clube: máximo de atletas por clube por etapa, ou null (sem
// limite).
function getChampionshipClubQuota(championship) {
  return championship.clubQuota != null ? championship.clubQuota : null;
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

// O GERADOR UNIVERSAL de torneios (coverage + format + scope) e o povoamento do
// calendário (Nacional + Estaduais + Regionais) ficam em `tournaments.js`, que é
// carregado depois deste arquivo e usa os helpers de etapa acima.
