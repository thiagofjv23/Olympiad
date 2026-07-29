// -----------------------------------------------------------------------------
// Controle de clube (Club Control) — qual clube o JOGADOR controla
//
// Escopo de TESTE: como num "MMO de uma pessoa só", o jogador controla TODOS os
// clubes, mas UM de cada vez. Este módulo guarda qual clube está sob controle e
// permite trocar para outro. O clube controlado é o que aparece na aba
// "Inscrições" (é dele que o jogador inscreve os atletas — ver registrations.js).
//
// Regra pedida: começar pelo clube de MAIOR PRESTÍGIO; um botão troca para outro
// clube. A "ordem de controle" é por prestígio decrescente (desempate por nome),
// então "próximo clube" percorre do mais para o menos prestigiado, dando a volta.
//
// É só a ESTRUTURA de controle (estado + operações); a UI fica em script.js.
// -----------------------------------------------------------------------------

// Id do clube atualmente controlado pelo jogador (null antes de inicializar).
let _controlledClubId = null;

// Ordem de controle dos clubes: prestígio DECRESCENTE, desempate por nome (pt-BR)
// e por id — determinística. É a ordem em que "próximo clube" percorre.
function getClubsByControlOrder() {
  return getAllClubs()
    .slice()
    .sort(
      (a, b) =>
        (b.prestige || 0) - (a.prestige || 0) ||
        a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" }) ||
        (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
    );
}

// Inicializa o controle no clube de MAIOR PRESTÍGIO. Retorna o id escolhido (ou
// null se não houver clubes).
function initClubControl() {
  const order = getClubsByControlOrder();
  _controlledClubId = order.length ? order[0].id : null;
  return _controlledClubId;
}

// Id do clube controlado (inicializa sob demanda se ainda não houver).
function getControlledClubId() {
  if (_controlledClubId == null) initClubControl();
  return _controlledClubId;
}

// Objeto do clube controlado (ou null).
function getControlledClub() {
  const id = getControlledClubId();
  return id ? getClub(id) : null;
}

// Passa o controle para um clube específico (por id). Retorna o novo id, ou o
// atual se o id não existir.
function setControlledClub(clubId) {
  if (getClub(clubId)) _controlledClubId = clubId;
  return _controlledClubId;
}

// Passa o controle para o PRÓXIMO clube na ordem de controle (dá a volta ao
// chegar no fim). Retorna o novo id controlado.
function switchToNextControlledClub() {
  const order = getClubsByControlOrder();
  if (order.length === 0) return (_controlledClubId = null);
  const currentId = getControlledClubId();
  const idx = order.findIndex((club) => club.id === currentId);
  const next = order[(idx + 1) % order.length];
  _controlledClubId = next.id;
  return _controlledClubId;
}
