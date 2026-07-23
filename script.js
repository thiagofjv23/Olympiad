// Nomes dos meses e dias em português.
const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const WEEKDAY_NAMES = [
  "domingo", "segunda-feira", "terça-feira", "quarta-feira",
  "quinta-feira", "sexta-feira", "sábado",
];

// -----------------------------------------------------------------------------
// Sistema de passagem de tempo.
// A unidade de tempo é o DIA. A simulação começa em 01/01/2026 e avança
// somente quando os botões de passagem de tempo são acionados.
// -----------------------------------------------------------------------------
const START_DATE = new Date(2026, 0, 1); // 01/01/2026

// "Agora" da simulação. Avança em dias.
let currentDate = new Date(START_DATE);

// Mês exibido no calendário (pode ser navegado sem alterar a data atual).
let viewYear = currentDate.getFullYear();
let viewMonth = currentDate.getMonth();

// Elementos.
const monthLabel = document.getElementById("month-label");
const daysContainer = document.getElementById("days");
const currentDateLabel = document.getElementById("current-date");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const advanceDayBtn = document.getElementById("advance-day");
const advanceWeekBtn = document.getElementById("advance-week");
const goCurrentBtn = document.getElementById("go-current");

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// Desenha a grade do mês em exibição, destacando a data atual da simulação.
function renderCalendar() {
  monthLabel.textContent = `${MONTH_NAMES[viewMonth]} de ${viewYear}`;
  daysContainer.innerHTML = "";

  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  for (let i = 0; i < firstWeekday; i++) {
    const empty = document.createElement("div");
    empty.className = "day day--empty";
    daysContainer.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement("div");
    cell.className = "day";
    cell.textContent = String(day);
    if (sameDay(new Date(viewYear, viewMonth, day), currentDate)) {
      cell.classList.add("day--current");
      cell.setAttribute("aria-current", "date");
    }
    daysContainer.appendChild(cell);
  }
}

// Atualiza o texto da data atual da simulação.
function renderCurrentDate() {
  const weekday = WEEKDAY_NAMES[currentDate.getDay()];
  const day = String(currentDate.getDate()).padStart(2, "0");
  const month = MONTH_NAMES[currentDate.getMonth()];
  const year = currentDate.getFullYear();
  currentDateLabel.textContent = `${weekday}, ${day} de ${month} de ${year}`;
}

function render() {
  renderCalendar();
  renderCurrentDate();
}

// Avança a passagem de tempo em N dias (unidade: dia).
function advanceDays(days) {
  currentDate.setDate(currentDate.getDate() + days);
  // O calendário acompanha a data atual da simulação.
  viewYear = currentDate.getFullYear();
  viewMonth = currentDate.getMonth();
  render();
}

// Navegação de meses (não altera a passagem de tempo).
function changeMonth(delta) {
  viewMonth += delta;
  if (viewMonth < 0) {
    viewMonth = 11;
    viewYear--;
  } else if (viewMonth > 11) {
    viewMonth = 0;
    viewYear++;
  }
  renderCalendar();
}

// Volta a visualização para o mês da data atual da simulação.
function goToCurrent() {
  viewYear = currentDate.getFullYear();
  viewMonth = currentDate.getMonth();
  renderCalendar();
}

// Eventos.
prevBtn.addEventListener("click", () => changeMonth(-1));
nextBtn.addEventListener("click", () => changeMonth(1));
advanceDayBtn.addEventListener("click", () => advanceDays(1));
advanceWeekBtn.addEventListener("click", () => advanceDays(7));
goCurrentBtn.addEventListener("click", goToCurrent);

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") changeMonth(-1);
  if (event.key === "ArrowRight") changeMonth(1);
});

render();
