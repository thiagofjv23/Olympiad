# Documentação do Projeto — Olympiad

Registro de controle do desenvolvimento. Cada seção descreve **o que existe**,
**onde está** e **como funciona**, para facilitar a evolução do sistema.

---

## 1. Visão geral

Aplicação web estática (HTML + CSS + JavaScript puro, **sem dependências** e sem
build). Basta abrir `index.html` no navegador.

Objetivo: simular a passagem de tempo (em dias) sobre um calendário e organizar
campeonatos esportivos, cujas etapas aparecem marcadas nas datas certas.

### Arquivos

| Arquivo             | Responsabilidade                                                        |
| ------------------- | ----------------------------------------------------------------------- |
| `index.html`        | Estrutura da página: abas, calendário e painel de campeonatos.          |
| `styles.css`        | Toda a aparência (tema claro/escuro automático).                        |
| `script.js`         | Lógica da UI: calendário, passagem de tempo, abas, cliques e detalhes.  |
| `countries.js`      | **Entidade Países** (dados). Ex.: Brasil.                               |
| `championships.js`  | **Entidade Campeonatos** (dados) + cálculo das etapas.                  |
| `README.md`         | Resumo de uso.                                                          |
| `DOCUMENTACAO.md`   | Este documento de controle.                                            |

### Princípio de arquitetura

Os **dados** (`countries.js`, `championships.js`) são separados da **UI**
(`script.js`). Os arquivos de dados só definem entidades e funções puras; a UI
apenas lê essas estruturas. Assim, adicionar um país ou campeonato é editar o
documento de dados — a interface (seletor, marcadores no calendário) se atualiza
sozinha.

Ordem de carregamento dos scripts (importa, pois são globais):
`countries.js` → `championships.js` → `script.js`.

---

## 2. Entidades de dados

### Países — `countries.js`

Objeto `COUNTRIES` indexado por `id`. Cada país:

| Campo             | Descrição                          |
| ----------------- | ---------------------------------- |
| `id`              | Identificador único (ex.: `BRA`).  |
| `name`            | Nome do país.                      |
| `population`      | População.                         |
| `olympicStrength` | **Força Olímpica** — rating 0–100. |

País cadastrado: **Brasil** (`BRA`, população 213.421.037, força olímpica 78).
Função utilitária: `getCountry(id)`.

### Campeonatos — `championships.js`

Objeto `CHAMPIONSHIPS` indexado por `id`. Cada campeonato:

| Campo         | Descrição                                              |
| ------------- | ------------------------------------------------------ |
| `id`          | Identificador único (ex.: `CNA-2026`).                 |
| `name`        | Nome do campeonato.                                    |
| `participants`| Número de participantes (inicia em `0`).               |
| `countryId`   | Referência ao país em `countries.js`.                  |
| `events`      | Eventos (lista).                                       |
| `modalities`  | Modalidades (lista).                                   |
| `competitors` | Participantes (lista).                                 |
| `stages`      | Etapas — `{ number, date }`.                           |

Campeonato cadastrado: **Campeonato Nacional de Atletismo** (`CNA-2026`), Brasil,
0 participantes, **10 etapas**.

Funções utilitárias:

- `secondSaturday(year, month)` — retorna a data do 2º sábado do mês.
- `buildMonthlyStages(startYear, startMonth, count)` — gera N etapas, uma por
  mês, sempre no 2º sábado.
- `getStagesOnDate(date)` — retorna as etapas (de qualquer campeonato) que caem
  em uma data. Usada para marcar o calendário e listar eventos do dia.

---

## 3. Histórico de etapas de desenvolvimento

### Etapa 1 — Calendário mensal

- Calendário que **inicia em 01/01/2026**, exibindo o mês inteiro (Dom–Sáb).
- Navegação entre meses anteriores/posteriores por **setas** (`‹` / `›`) e pelas
  **teclas de seta** do teclado.
- Vira mês/ano automaticamente. Tema claro/escuro conforme o sistema.

### Etapa 2 — Sistema de passagem de tempo

- Unidade de tempo: **dia**. Simulação começa em **01/01/2026**.
- Botões **+ 1 dia** e **+ 1 semana** (7 dias — mesma unidade).
- A data atual da simulação (`currentDate`) fica **destacada** no calendário, que
  **acompanha** a passagem do tempo (vira mês/ano sozinho).
- Botão **Ir para a data atual** volta a visualização ao mês da data simulada.
- Separação importante: `currentDate` (o "agora", só muda pelos botões de tempo)
  vs. `viewYear`/`viewMonth` (o mês exibido, muda pelas setas). Folhear o
  calendário nunca avança o relógio.

### Etapa 3 — Campeonatos, Países e abas

- Criadas as entidades **Países** (`countries.js`) e **Campeonatos**
  (`championships.js`).
- Campeonato Nacional de Atletismo com **10 etapas no 2º sábado de cada mês**,
  a partir de janeiro/2026:

  | Etapa | Data       | Etapa | Data       |
  | ----- | ---------- | ----- | ---------- |
  | 1     | 10/01/2026 | 6     | 13/06/2026 |
  | 2     | 14/02/2026 | 7     | 11/07/2026 |
  | 3     | 14/03/2026 | 8     | 08/08/2026 |
  | 4     | 11/04/2026 | 9     | 12/09/2026 |
  | 5     | 09/05/2026 | 10    | 10/10/2026 |

- Interface com **duas abas**:
  - **Calendário**: calendário + passagem de tempo; datas de etapas marcadas com
    ponto laranja no dia correspondente.
  - **Campeonatos**: seletor de campeonato (pronto para futuros) + painel com os
    dados do campeonato e do país (incluindo barra de Força Olímpica) e a tabela
    das 10 etapas.

### Etapa 4 — Dias clicáveis e navegação para o evento

- Cada dia do calendário virou um **botão clicável**.
- Ao clicar num dia:
  - **Sem evento** → mensagem *"Não há evento neste dia."*
  - **Com evento** → lista dos eventos daquele dia (nome do campeonato + etapa),
    cada item **clicável**.
- Clicar num evento **leva à aba Campeonatos**, seleciona o campeonato
  correspondente e **destaca/rola até a etapa** clicada na tabela de etapas.
- O dia clicado recebe um contorno de seleção (`day--selected`), sem interferir
  no destaque da data atual da simulação.

---

## 4. Referência de funções (`script.js`)

| Função                              | Papel                                                          |
| ----------------------------------- | -------------------------------------------------------------- |
| `renderCalendar()`                  | Desenha a grade do mês, o destaque da data atual e marcadores. |
| `renderCurrentDate()`               | Escreve a data simulada por extenso.                           |
| `advanceDays(days)`                 | Avança a passagem de tempo (1 dia / 1 semana).                 |
| `changeMonth(delta)`                | Navega entre meses (setas), sem mexer no tempo.                |
| `goToCurrent()`                     | Volta a visualização ao mês da data atual.                     |
| `activateTab(tab)`                  | Alterna entre as abas Calendário/Campeonatos.                  |
| `selectDay(date)`                   | Seleciona um dia e abre seus detalhes.                         |
| `renderDayDetail(date)`             | Monta a lista de eventos (ou a mensagem de vazio) do dia.      |
| `goToEvent(champId, stageNumber)`   | Vai para o evento na aba Campeonatos e destaca a etapa.        |
| `populateChampionshipSelect()`      | Preenche o seletor de campeonatos.                             |
| `renderChampionship(id, highlight?)`| Mostra os dados do campeonato; opcionalmente destaca a etapa.  |

---

## 5. Como estender (guia rápido)

- **Novo país**: adicione uma entrada em `COUNTRIES` (`countries.js`).
- **Novo campeonato**: adicione uma entrada em `CHAMPIONSHIPS` (`championships.js`).
  Ele aparece automaticamente no seletor da aba Campeonatos, e suas etapas são
  marcadas no calendário.
- **Outro padrão de etapas**: reutilize `buildMonthlyStages(...)` ou crie a lista
  `stages` manualmente (`{ number, date }`).
