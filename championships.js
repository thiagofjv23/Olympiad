// -----------------------------------------------------------------------------
// Entidade: Campeonatos (Championships)
// Relaciona-se com os países (countries.js) através de countryId.
//
// Cada campeonato possui:
//   - id           : identificador único
//   - name         : nome do campeonato
//   - participants : número de participantes (0 inicialmente)
//   - countryId    : referência ao país (ver countries.js)
//   - events       : eventos
//   - modalities   : modalidades
//   - competitors  : lista de participantes
//   - stages       : etapas (datas calculadas)
// -----------------------------------------------------------------------------

// Retorna a data do segundo sábado de um determinado mês/ano.
function secondSaturday(year, month) {
  const firstWeekday = new Date(year, month, 1).getDay(); // 0=Dom ... 6=Sáb
  const offsetToFirstSaturday = (6 - firstWeekday + 7) % 7;
  const firstSaturday = 1 + offsetToFirstSaturday;
  return new Date(year, month, firstSaturday + 7);
}

// Gera `count` etapas, uma por mês, sempre no segundo sábado,
// a partir de (startYear, startMonth).
function buildMonthlyStages(startYear, startMonth, count) {
  const stages = [];
  for (let i = 0; i < count; i++) {
    const ref = new Date(startYear, startMonth + i, 1);
    stages.push({
      number: i + 1,
      date: secondSaturday(ref.getFullYear(), ref.getMonth()),
    });
  }
  return stages;
}

const CHAMPIONSHIPS = {
  // ID única do campeonato.
  "CNA-2026": {
    id: "CNA-2026",
    name: "Campeonato Nacional de Atletismo",
    participants: 0,
    countryId: "BRA",
    events: [],
    modalities: [],
    competitors: [],
    // 10 etapas, sempre no segundo sábado de cada mês, começando em janeiro/2026.
    stages: buildMonthlyStages(2026, 0, 10),
  },
};

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
