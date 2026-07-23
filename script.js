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

let currentDate = new Date(START_DATE); // "agora" da simulação
let viewYear = currentDate.getFullYear(); // mês exibido no calendário
let viewMonth = currentDate.getMonth();
let selectedDate = null; // dia clicado pelo usuário

// Elementos — calendário.
const monthLabel = document.getElementById("month-label");
const daysContainer = document.getElementById("days");
const currentDateLabel = document.getElementById("current-date");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const advanceDayBtn = document.getElementById("advance-day");
const advanceWeekBtn = document.getElementById("advance-week");
const goCurrentBtn = document.getElementById("go-current");

// Elementos — abas e campeonatos.
const tabBtnCalendar = document.getElementById("tab-btn-calendar");
const tabBtnChampionships = document.getElementById("tab-btn-championships");
const panelCalendar = document.getElementById("tab-calendar");
const panelChampionships = document.getElementById("tab-championships");
const championshipSelect = document.getElementById("championship-select");
const championshipDetails = document.getElementById("championship-details");
const dayDetail = document.getElementById("day-detail");

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// -----------------------------------------------------------------------------
// Calendário
// -----------------------------------------------------------------------------
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
    const cellDate = new Date(viewYear, viewMonth, day);
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "day";
    cell.addEventListener("click", () => selectDay(cellDate));

    const number = document.createElement("span");
    number.className = "day__number";
    number.textContent = String(day);
    cell.appendChild(number);

    if (sameDay(cellDate, currentDate)) {
      cell.classList.add("day--current");
      cell.setAttribute("aria-current", "date");
    }

    if (selectedDate && sameDay(cellDate, selectedDate)) {
      cell.classList.add("day--selected");
    }

    // Marca as etapas de campeonatos que ocorrem nesta data.
    const stagesHere = getStagesOnDate(cellDate);
    if (stagesHere.length > 0) {
      cell.classList.add("day--event");
      const allDone = stagesHere.every((s) => isStageDone(s.stage, currentDate));
      const marker = document.createElement("span");
      marker.className = allDone ? "day__marker day__marker--done" : "day__marker";
      cell.appendChild(marker);
      cell.title = stagesHere
        .map(
          (s) =>
            `${s.championship.name} — Etapa ${s.stage.number}` +
            (isStageDone(s.stage, currentDate) ? " (realizada)" : "")
        )
        .join("\n");
    }

    daysContainer.appendChild(cell);
  }
}

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

function advanceDays(days) {
  currentDate.setDate(currentDate.getDate() + days);
  viewYear = currentDate.getFullYear();
  viewMonth = currentDate.getMonth();
  render();
  // O status das etapas depende da data atual: atualiza as visões que o exibem.
  refreshChampionshipView();
  refreshDayDetail();
}

// Re-renderiza o campeonato atualmente selecionado (mantém a data em dia).
function refreshChampionshipView() {
  if (championshipSelect.value) {
    renderChampionship(championshipSelect.value);
  }
}

// Re-renderiza o detalhe do dia aberto, se houver um dia selecionado.
function refreshDayDetail() {
  if (selectedDate) {
    renderDayDetail(selectedDate);
  }
}

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

function goToCurrent() {
  viewYear = currentDate.getFullYear();
  viewMonth = currentDate.getMonth();
  renderCalendar();
}

// Usuário clicou em um dia do calendário: marca o dia e exibe seus eventos.
function selectDay(date) {
  selectedDate = new Date(date);
  renderCalendar();
  renderDayDetail(date);
}

// Monta o painel de detalhes do dia clicado.
function renderDayDetail(date) {
  const stages = getStagesOnDate(date);
  const heading = `<p class="day-detail__date">${formatDate(date)}</p>`;

  if (stages.length === 0) {
    dayDetail.innerHTML =
      heading + `<p class="day-detail__empty">Não há evento neste dia.</p>`;
    return;
  }

  const items = stages
    .map((s) => {
      const done = isStageDone(s.stage, currentDate);
      const status = done
        ? `<span class="event-item__status event-item__status--done">✓ Realizada</span>`
        : `<span class="event-item__status">Agendada</span>`;
      return `
        <li>
          <button type="button" class="event-item"
                  data-championship="${s.championship.id}"
                  data-stage="${s.stage.number}">
            <span class="event-item__name">${s.championship.name}</span>
            <span class="event-item__meta">
              <span class="event-item__stage">Etapa ${s.stage.number}</span>
              ${status}
            </span>
          </button>
        </li>`;
    })
    .join("");

  dayDetail.innerHTML =
    heading +
    `<p class="day-detail__label">Eventos neste dia</p><ul class="event-list">${items}</ul>`;

  dayDetail.querySelectorAll(".event-item").forEach((button) => {
    button.addEventListener("click", () =>
      goToEvent(button.dataset.championship, Number(button.dataset.stage))
    );
  });
}

// Vai para a tela do evento na aba Campeonatos, destacando a etapa clicada.
function goToEvent(championshipId, stageNumber) {
  activateTab("championships");
  championshipSelect.value = championshipId;
  renderChampionship(championshipId, stageNumber);
}

// -----------------------------------------------------------------------------
// Abas
// -----------------------------------------------------------------------------
function activateTab(tab) {
  const isCalendar = tab === "calendar";

  tabBtnCalendar.classList.toggle("tab--active", isCalendar);
  tabBtnCalendar.setAttribute("aria-selected", String(isCalendar));
  tabBtnChampionships.classList.toggle("tab--active", !isCalendar);
  tabBtnChampionships.setAttribute("aria-selected", String(!isCalendar));

  panelCalendar.classList.toggle("tab-panel--hidden", !isCalendar);
  panelChampionships.classList.toggle("tab-panel--hidden", isCalendar);
}

// -----------------------------------------------------------------------------
// Campeonatos
// -----------------------------------------------------------------------------
function formatDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

function populateChampionshipSelect() {
  championshipSelect.innerHTML = "";
  for (const championship of Object.values(CHAMPIONSHIPS)) {
    const option = document.createElement("option");
    option.value = championship.id;
    option.textContent = championship.name;
    championshipSelect.appendChild(option);
  }
}

function renderChampionship(id, highlightStage) {
  const championship = CHAMPIONSHIPS[id];
  if (!championship) return;

  const country = getCountry(championship.countryId);
  const progress = championshipProgress(championship, currentDate);

  const stagesRows = championship.stages
    .map((stage) => {
      const done = isStageDone(stage, currentDate);
      const status = done
        ? `<span class="stage-status stage-status--done">✓ Realizada</span>`
        : `<span class="stage-status">Agendada</span>`;
      const rowAttrs =
        stage.number === highlightStage
          ? ' class="stage-row--highlight" id="stage-row"'
          : "";
      return `
        <tr${rowAttrs}>
          <td>${stage.number}</td>
          <td>${formatDate(stage.date)}</td>
          <td>${status}</td>
        </tr>`;
    })
    .join("");

  const countryBlock = country
    ? `
      <div class="detail-card">
        <h3>País</h3>
        <p class="detail-card__title">${country.name} <span class="detail-card__id">(${country.id})</span></p>
        <ul class="detail-list">
          <li><span>População</span><strong>${country.population.toLocaleString("pt-BR")}</strong></li>
          <li>
            <span>Força Olímpica</span>
            <strong>${country.olympicStrength}/100</strong>
          </li>
        </ul>
        <div class="strength-bar" role="img" aria-label="Força olímpica ${country.olympicStrength} de 100">
          <div class="strength-bar__fill" style="width: ${country.olympicStrength}%"></div>
        </div>
      </div>`
    : `<div class="detail-card"><h3>País</h3><p>País não encontrado.</p></div>`;

  championshipDetails.innerHTML = `
    <div class="detail-card">
      <h3>Campeonato</h3>
      <p class="detail-card__title">${championship.name}</p>
      <p class="detail-card__id">ID: ${championship.id}</p>
      <ul class="detail-list">
        <li><span>Participantes</span><strong>${championship.participants}</strong></li>
        <li><span>Eventos</span><strong>${championship.events.length}</strong></li>
        <li><span>Modalidades</span><strong>${championship.modalities.length}</strong></li>
        <li><span>Etapas realizadas</span><strong>${progress.done} / ${progress.total}</strong></li>
      </ul>
    </div>

    ${countryBlock}

    <div class="detail-card">
      <h3>Etapas</h3>
      <table class="stages-table">
        <thead>
          <tr><th>Etapa</th><th>Data</th><th>Status</th></tr>
        </thead>
        <tbody>${stagesRows}</tbody>
      </table>
    </div>
  `;

  if (highlightStage) {
    const row = document.getElementById("stage-row");
    if (row) row.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

// -----------------------------------------------------------------------------
// Eventos
// -----------------------------------------------------------------------------
prevBtn.addEventListener("click", () => changeMonth(-1));
nextBtn.addEventListener("click", () => changeMonth(1));
advanceDayBtn.addEventListener("click", () => advanceDays(1));
advanceWeekBtn.addEventListener("click", () => advanceDays(7));
goCurrentBtn.addEventListener("click", goToCurrent);

tabBtnCalendar.addEventListener("click", () => activateTab("calendar"));
tabBtnChampionships.addEventListener("click", () => activateTab("championships"));
championshipSelect.addEventListener("change", (e) => renderChampionship(e.target.value));

document.addEventListener("keydown", (event) => {
  if (panelCalendar.classList.contains("tab-panel--hidden")) return;
  if (event.key === "ArrowLeft") changeMonth(-1);
  if (event.key === "ArrowRight") changeMonth(1);
});

// Inicialização.
populateChampionshipSelect();
renderChampionship(championshipSelect.value);
render();
