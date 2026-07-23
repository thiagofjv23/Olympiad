// Nomes dos meses em português.
const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

// O calendário inicia em 01/01/2026.
const START_YEAR = 2026;
const START_MONTH = 0; // 0 = Janeiro

// Estado: mês atualmente exibido.
let currentYear = START_YEAR;
let currentMonth = START_MONTH;

const monthLabel = document.getElementById("month-label");
const daysContainer = document.getElementById("days");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const todayBtn = document.getElementById("today");

function isToday(year, month, day) {
  const now = new Date();
  return (
    year === now.getFullYear() &&
    month === now.getMonth() &&
    day === now.getDate()
  );
}

function render() {
  monthLabel.textContent = `${MONTH_NAMES[currentMonth]} de ${currentYear}`;
  daysContainer.innerHTML = "";

  // Dia da semana em que o mês começa (0 = domingo).
  const firstWeekday = new Date(currentYear, currentMonth, 1).getDay();
  // Quantidade de dias no mês.
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Células vazias antes do primeiro dia.
  for (let i = 0; i < firstWeekday; i++) {
    const empty = document.createElement("div");
    empty.className = "day day--empty";
    daysContainer.appendChild(empty);
  }

  // Dias do mês.
  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement("div");
    cell.className = "day";
    cell.textContent = String(day);
    if (isToday(currentYear, currentMonth, day)) {
      cell.classList.add("day--today");
      cell.setAttribute("aria-current", "date");
    }
    daysContainer.appendChild(cell);
  }
}

function changeMonth(delta) {
  currentMonth += delta;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  } else if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  render();
}

function goToToday() {
  const now = new Date();
  currentYear = now.getFullYear();
  currentMonth = now.getMonth();
  render();
}

prevBtn.addEventListener("click", () => changeMonth(-1));
nextBtn.addEventListener("click", () => changeMonth(1));
todayBtn.addEventListener("click", goToToday);

// Navegação pelo teclado (setas esquerda/direita).
document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") changeMonth(-1);
  if (event.key === "ArrowRight") changeMonth(1);
});

render();
