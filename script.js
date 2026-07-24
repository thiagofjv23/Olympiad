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

// Elementos — abas.
const panelCalendar = document.getElementById("tab-calendar");
const TABS = {
  calendar: {
    btn: document.getElementById("tab-btn-calendar"),
    panel: panelCalendar,
  },
  championships: {
    btn: document.getElementById("tab-btn-championships"),
    panel: document.getElementById("tab-championships"),
  },
  athletes: {
    btn: document.getElementById("tab-btn-athletes"),
    panel: document.getElementById("tab-athletes"),
  },
  clubs: {
    btn: document.getElementById("tab-btn-clubs"),
    panel: document.getElementById("tab-clubs"),
  },
};

// Elementos — campeonatos.
const championshipSelect = document.getElementById("championship-select");
const championshipDetails = document.getElementById("championship-details");
const dayDetail = document.getElementById("day-detail");

// Elementos — atletas.
const athleteCountrySelect = document.getElementById("athlete-country-select");
const athleteList = document.getElementById("athlete-list");

// Elementos — clubes.
const clubCountrySelect = document.getElementById("club-country-select");
const clubList = document.getElementById("club-list");
const freeAgentsEl = document.getElementById("free-agents");

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
  // Etapas realizadas nesse avanço desgastam seus participantes (uma vez cada).
  applyParticipationFatigue(currentDate);
  // Status de etapas e situação de contratos dependem da data atual: atualiza
  // as visões que os exibem (contratos podem ter expirado/entrado em vigor;
  // a fadiga dos participantes pode ter mudado).
  refreshChampionshipView();
  refreshDayDetail();
  refreshClubView();
  refreshAthleteView();
}

// Re-renderiza o campeonato atualmente selecionado (mantém a data em dia).
function refreshChampionshipView() {
  if (championshipSelect.value) {
    renderChampionship(championshipSelect.value);
  }
}

// Re-renderiza a aba Clubes (elenco e agentes livres) após a passagem de tempo,
// pois a situação dos contratos é relativa à data atual.
function refreshClubView() {
  if (clubCountrySelect.value) {
    renderClubs(clubCountrySelect.value);
  }
}

// Re-renderiza a aba Atletas após a passagem de tempo (o "Clube atual" de cada
// atleta é derivado do contrato ativo na data atual).
function refreshAthleteView() {
  if (athleteCountrySelect.value) {
    renderAthletes(athleteCountrySelect.value);
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
  for (const [name, { btn, panel }] of Object.entries(TABS)) {
    const active = name === tab;
    btn.classList.toggle("tab--active", active);
    btn.setAttribute("aria-selected", String(active));
    panel.classList.toggle("tab-panel--hidden", !active);
  }
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
// Atletas
// -----------------------------------------------------------------------------
function populateAthleteCountrySelect() {
  athleteCountrySelect.innerHTML = "";
  for (const country of Object.values(COUNTRIES)) {
    const option = document.createElement("option");
    option.value = country.id;
    option.textContent = country.name;
    athleteCountrySelect.appendChild(option);
  }
}

// Lista os atletas de um país. Cada atleta mostra nome, idade e força;
// ao clicar, expande para os demais atributos (inclui o clube atual).
// Se `highlightAthleteId` for informado, o atleta correspondente já vem aberto
// e a visualização rola até ele (usado ao vir da tela de Clubes).
function renderAthletes(countryId, highlightAthleteId) {
  const list = ATHLETES.filter((athlete) => athlete.countryId === countryId);

  if (list.length === 0) {
    athleteList.innerHTML =
      `<p class="athletes__empty">Nenhum atleta para este país.</p>`;
    return;
  }

  athleteList.innerHTML = list
    .map((athlete) => {
      const birthCity = getCity(athlete.birthCityId);
      const birthPlace = birthCity ? birthCity.name : "—";
      const favoriteSport = getAthleteFavoriteSport(athlete);
      const favoriteSportName = favoriteSport ? favoriteSport.name : "—";
      // Clube atual: derivado do contrato ativo (ver contracts.js). Sem contrato
      // ativo, o atleta é um agente livre.
      const club = getAthleteClub(athlete.id, currentDate);
      const clubName = club ? club.name : "Agente livre";
      const highlight = athlete.id === highlightAthleteId;
      return `
        <details class="athlete${highlight ? " athlete--highlight" : ""}"${highlight ? " open id=\"athlete-card\"" : ""}>
          <summary class="athlete__summary">
            <span class="athlete__name">${getAthleteName(athlete)}</span>
            <span class="athlete__brief">${athlete.age} anos · Força ${athlete.strength}</span>
          </summary>
          <ul class="athlete__stats">
            <li><span>Força</span><strong>${athlete.strength}</strong></li>
            <li><span>Potencial</span><strong>${athlete.potential}</strong></li>
            <li><span>Preparação Física</span><strong>${athlete.physicalPreparation}</strong></li>
            <li><span>Cansaço</span><strong>${athlete.fatigue}%</strong></li>
            <li><span>Local de nascimento</span><strong>${birthPlace}</strong></li>
            <li><span>Esporte favorito</span><strong>${favoriteSportName}</strong></li>
            <li><span>Clube atual</span><strong>${clubName}</strong></li>
          </ul>
        </details>`;
    })
    .join("");

  if (highlightAthleteId != null) {
    const card = document.getElementById("athlete-card");
    if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

// Vai para o perfil do atleta na aba Atletas: seleciona o país do atleta e
// abre/destaca o seu cartão. Usado pelos links "Atletas do clube".
function goToAthlete(athleteId) {
  const athlete = ATHLETES.find((a) => a.id === athleteId);
  if (!athlete) return;
  activateTab("athletes");
  athleteCountrySelect.value = athlete.countryId;
  renderAthletes(athlete.countryId, athleteId);
}

// -----------------------------------------------------------------------------
// Clubes
// -----------------------------------------------------------------------------
function populateClubCountrySelect() {
  clubCountrySelect.innerHTML = "";
  for (const country of Object.values(COUNTRIES)) {
    const option = document.createElement("option");
    option.value = country.id;
    option.textContent = country.name;
    clubCountrySelect.appendChild(option);
  }
}

// Lista os clubes de um país. Cada clube mostra nome, país e prestígio;
// ao clicar, expande para as demais informações.
function renderClubs(countryId) {
  const list = getClubsByCountry(countryId);

  // Os agentes livres do país são exibidos junto (mesma aba), sempre em sincronia.
  renderFreeAgents(countryId);

  if (list.length === 0) {
    clubList.innerHTML = `<p class="clubs__empty">Nenhum clube para este país.</p>`;
    return;
  }

  clubList.innerHTML = list
    .map((club) => {
      const country = getCountry(club.countryId);
      const countryName = country ? country.name : club.countryId;
      const ioc = country ? country.iocCode : club.countryId;
      const city = getCity(club.cityId);
      const cityName = city ? city.name : "—";
      const president = club.president || "—";
      const finances = club.finances != null ? club.finances : "—";
      const rivals = club.rivals.length > 0 ? club.rivals.join(", ") : "—";
      return `
        <details class="club">
          <summary class="club__summary">
            <span class="club__name">${club.name}</span>
            <span class="club__brief">${cityName}, ${ioc} · Prestígio ${club.prestige}</span>
          </summary>
          <ul class="club__stats">
            <li><span>ID</span><strong>${club.id}</strong></li>
            <li><span>País</span><strong>${countryName}</strong></li>
            <li><span>Cidade</span><strong>${cityName}</strong></li>
            <li><span>Prestígio</span><strong>${club.prestige}/100</strong></li>
            <li><span>Ano de fundação</span><strong>${club.foundationYear}</strong></li>
            <li><span>Infraestrutura</span><strong>${club.infrastructureLevel}/100</strong></li>
            <li><span>Presidente</span><strong>${president}</strong></li>
            <li><span>Finanças</span><strong>${finances}</strong></li>
            <li><span>Rivais</span><strong>${rivals}</strong></li>
          </ul>
          <div class="club__roster">
            <button type="button" class="club__athletes-toggle link-button" data-club="${club.id}" aria-expanded="false">
              Atletas do clube
            </button>
            <ul class="club__athletes" data-club-list="${club.id}" hidden></ul>
          </div>
        </details>`;
    })
    .join("");

  clubList.querySelectorAll(".club__athletes-toggle").forEach((button) => {
    button.addEventListener("click", () => toggleClubAthletes(button));
  });
}

// Mostra/esconde a lista de atletas contratados de um clube (link "Atletas do
// clube"). A lista é montada sob demanda ao abrir.
function toggleClubAthletes(button) {
  const clubId = button.dataset.club;
  const container = clubList.querySelector(`[data-club-list="${clubId}"]`);
  if (!container) return;
  const show = container.hidden;
  container.hidden = !show;
  button.setAttribute("aria-expanded", String(show));
  if (show) renderClubAthletes(clubId, container);
}

// Texto da duração de um contrato ("1 ano" / "2 anos").
function contractDurationText(contract) {
  return `${contract.durationYears} ${contract.durationYears === 1 ? "ano" : "anos"}`;
}

// Preenche a lista com os atletas contratados do clube (contratos ativos na data
// atual). Cada item mostra o nome do atleta (clicável, leva ao perfil) e os
// dados do contrato: duração, término e, se for renovação, uma marca "renovado".
function renderClubAthletes(clubId, container) {
  const contracts = getContractsByClub(clubId, currentDate);
  if (contracts.length === 0) {
    container.innerHTML =
      `<li class="club__athletes-empty">Nenhum atleta contratado.</li>`;
    return;
  }

  container.innerHTML = contracts
    .map((contract) => {
      const athlete = ATHLETES.find((a) => a.id === contract.athleteId);
      const name = athlete ? getAthleteName(athlete) : `Atleta ${contract.athleteId}`;
      const renewal = contract.renewalOf ? " · renovado" : "";
      const contractInfo = `${contractDurationText(contract)} · até ${formatDate(contract.endDate)}${renewal}`;
      return `
        <li class="club-athlete">
          <button type="button" class="club-athlete-link link-button" data-athlete="${contract.athleteId}">${name}</button>
          <span class="club-athlete__contract">${contractInfo}</span>
        </li>`;
    })
    .join("");

  container.querySelectorAll(".club-athlete-link").forEach((button) => {
    button.addEventListener("click", () =>
      goToAthlete(Number(button.dataset.athlete))
    );
  });
}

// Lista os AGENTES LIVRES do país (atletas sem contrato ativo na data atual).
// Cada nome é clicável e leva ao perfil do atleta.
function renderFreeAgents(countryId) {
  const athletes = ATHLETES.filter((athlete) => athlete.countryId === countryId);
  const free = getFreeAgents(athletes, currentDate);
  const heading = `<h3 class="free-agents__title">Agentes livres</h3>`;

  if (free.length === 0) {
    freeAgentsEl.innerHTML =
      heading + `<p class="free-agents__empty">Nenhum agente livre.</p>`;
    return;
  }

  const items = free
    .map(
      (athlete) =>
        `<li><button type="button" class="free-agent-link link-button" data-athlete="${athlete.id}">${getAthleteName(athlete)}</button></li>`
    )
    .join("");
  freeAgentsEl.innerHTML =
    heading + `<ul class="free-agents__list">${items}</ul>`;

  freeAgentsEl.querySelectorAll(".free-agent-link").forEach((button) => {
    button.addEventListener("click", () =>
      goToAthlete(Number(button.dataset.athlete))
    );
  });
}

// -----------------------------------------------------------------------------
// Eventos
// -----------------------------------------------------------------------------
prevBtn.addEventListener("click", () => changeMonth(-1));
nextBtn.addEventListener("click", () => changeMonth(1));
advanceDayBtn.addEventListener("click", () => advanceDays(1));
advanceWeekBtn.addEventListener("click", () => advanceDays(7));
goCurrentBtn.addEventListener("click", goToCurrent);

TABS.calendar.btn.addEventListener("click", () => activateTab("calendar"));
TABS.championships.btn.addEventListener("click", () => activateTab("championships"));
TABS.athletes.btn.addEventListener("click", () => activateTab("athletes"));
TABS.clubs.btn.addEventListener("click", () => activateTab("clubs"));
championshipSelect.addEventListener("change", (e) => renderChampionship(e.target.value));
athleteCountrySelect.addEventListener("change", (e) => renderAthletes(e.target.value));
clubCountrySelect.addEventListener("change", (e) => renderClubs(e.target.value));

document.addEventListener("keydown", (event) => {
  if (panelCalendar.classList.contains("tab-panel--hidden")) return;
  if (event.key === "ArrowLeft") changeMonth(-1);
  if (event.key === "ArrowRight") changeMonth(1);
});

// Inicialização da simulação.
// Gera os atletas da simulação (10 no momento — apenas para testes; ver TODO.md).
generateAthletes();

// Contratos de TESTE: assina cada atleta a um clube (ver contracts.js). Vínculo
// temporário só para as telas terem dados — substituir pelo fluxo real depois.
seedTestContracts(ATHLETES, currentDate);

// Aplica a fadiga de etapas já realizadas na data inicial (nenhuma em 01/01/2026;
// robustez caso a data de início mude). Ver participation.js.
applyParticipationFatigue(currentDate);

populateChampionshipSelect();
renderChampionship(championshipSelect.value);

populateAthleteCountrySelect();
renderAthletes(athleteCountrySelect.value);

populateClubCountrySelect();
renderClubs(clubCountrySelect.value);

render();
