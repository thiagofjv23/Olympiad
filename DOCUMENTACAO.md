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
| `athletes.js`       | **Entidade Atletas** (dados) + gerador de "regens".                     |
| `clubs.js`          | **Entidade Clubes** (database inicial de clubes reais).                 |
| `README.md`         | Resumo de uso.                                                          |
| `DOCUMENTACAO.md`   | Este documento de controle.                                            |
| `TODO.md`           | Pendências e decisões temporárias.                                     |

### Princípio de arquitetura

Os **dados** (`countries.js`, `championships.js`) são separados da **UI**
(`script.js`). Os arquivos de dados só definem entidades e funções puras; a UI
apenas lê essas estruturas. Assim, adicionar um país ou campeonato é editar o
documento de dados — a interface (seletor, marcadores no calendário) se atualiza
sozinha.

Ordem de carregamento dos scripts (importa, pois são globais):
`countries.js` → `championships.js` → `athletes.js` → `clubs.js` → `script.js`.

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
- `isStageDone(stage, referenceDate)` — **lógica de realização** da etapa. Lê a
  data da própria etapa (dinâmico, sem datas fixas/hardcoded) e a compara com a
  data de referência: retorna `true` ao **chegar no dia** da etapa ou depois.
- `championshipProgress(championship, referenceDate)` — `{ done, total }` com o
  número de etapas já realizadas em relação a uma data.

### Atletas — `athletes.js`

Gerador de "regens" (atletas gerados). Lista viva em `ATHLETES`. Cada atleta:

| Campo                 | Descrição                                                        |
| --------------------- | ---------------------------------------------------------------- |
| `id`                  | Número sequencial (1, 2, 3, ...).                                |
| `label`               | Nome base (`Atleta 1`, `Atleta 2`, ...).                         |
| `countryId`           | País de origem (ver `countries.js`).                             |
| `age`                 | Idade.                                                           |
| `strength`            | **Força** (0–100).                                               |
| `potential`           | **Potencial** (0–100), teto de crescimento; nunca menor que Força.|
| `physicalPreparation` | **Preparação Física** (0–100).                                   |
| `fatigue`             | **Cansaço** (%), inicia em 100.                                  |

Nome exibido = `label` + código do COI do país, ex.: **`Atleta 1 (BRA)`**
(via `getAthleteName(athlete)`).

Regras de geração:

- **Idade**: gerador suporta **12–40** (`ATHLETE_AGE_LIMITS`); no exemplo atual
  gera **18–35** (`ATHLETE_GENERATION_CONFIG`).
- **Força**: distribuição **normal** centrada na **força olímpica do país**
  ajustada por uma curva de idade (pico em ~27 anos).
- **Potencial**: força inicial + margem (também derivada da força olímpica);
  **nunca menor que a Força** e no máximo 100.
- **Preparação Física**: normal em torno de 60 (0–100).
- **Cansaço**: começa em 100. `fatigueReductionForStage(athlete)` define quanto
  cai por etapa — **mais idade → cai mais**, **mais Preparação Física → cai menos**
  (a aplicação por etapa depende da participação; ver `TODO.md`).

Função principal: `generateAthletes(count?, countryId?)` — gera os atletas e
substitui `ATHLETES`. Chamada ao **iniciar a simulação**.

> Números de teste (10 atletas, idade 18–35) e a lógica de evolução de
> Força/Potencial estão registrados em `TODO.md`.

### Clubes — `clubs.js`

Os clubes **inscrevem atletas nas competições** — um atleta só entra em uma
competição por meio de um clube (mecânica ainda **não** implementada; ver
`TODO.md`). Diferente dos atletas, os clubes **não são gerados**: são uma
**database inicial** (objeto `CLUBS`) com clubes reais de tradição no atletismo.

| Campo                 | Descrição                                                       |
| --------------------- | --------------------------------------------------------------- |
| `id`                  | Identificador único (ex.: `CLB-PINHEIROS`).                     |
| `name`                | Nome do clube.                                                  |
| `countryId`           | País do clube (ver `countries.js`).                            |
| `president`           | Presidente — **ainda não utilizado** (ver `TODO.md`).          |
| `foundationYear`      | Ano de fundação.                                               |
| `infrastructureLevel` | Nível de infraestrutura (0–100), definido considerando a força olímpica do país. |
| `finances`            | Finanças — **ainda não utilizado** (ver `TODO.md`).           |
| `rivals`              | Clubes rivais (ids) — a evoluir (ver `TODO.md`).              |

Funções utilitárias: `getClub(id)` e `getClubsByCountry(countryId)`.

Conjunto inicial (10 clubes, todos do Brasil — único país existente): Pinheiros,
Sogipa, Grêmio Náutico União, Minas Tênis Clube, Flamengo, Vasco da Gama,
Botafogo, Fluminense, Corinthians e Clube Atlético Paulistano. É um conjunto de
**teste**, a ser revisado e ampliado.

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

### Etapa 5 — Lógica de realização das etapas (evento ocorrido)

- Cada etapa é realizada **no dia destacado** correspondente. As datas **não são
  hardcoded**: a lógica (`isStageDone`) lê a data da própria etapa, então
  campeonatos futuros podem ter etapas em datas iguais ou diferentes, conforme o
  evento, sem alterar código.
- **Ao chegar** na data de realização (ou passar dela), a etapa passa a
  **Realizada** — com um **tick positivo (✓)**. Antes disso fica **Agendada**.
- Onde aparece o status (tudo relativo à data atual da simulação, `currentDate`):
  - **Aba Campeonatos**: nova coluna **Status** na tabela de etapas (✓ Realizada /
    Agendada) e resumo **Etapas realizadas: N / total**.
  - **Detalhe do dia** (aba Calendário): cada evento mostra ✓ Realizada / Agendada.
  - **Marcador no calendário**: fica **verde** quando a etapa daquele dia já
    ocorreu (laranja enquanto agendada).
- A passagem de tempo (**+ 1 dia** / **+ 1 semana**) reavalia e **atualiza** essas
  visões automaticamente (`refreshChampionshipView`, `refreshDayDetail`).

### Etapa 6 — Entidade Atletas e gerador de regens

- Criado `athletes.js` com o **gerador de regens** e a entidade Atleta (atributos
  descritos na seção 2).
- **Integrado ao ecossistema**: ao **iniciar a simulação**, `generateAthletes()`
  cria **10 atletas** (número de teste — ver `TODO.md`), todos do Brasil (único
  país existente), com nome no formato `Atleta N (BRA)`.
- **Sem telas ainda** — apenas a entidade e o gerador. A UI dos atletas é o
  próximo passo.
- Pendências registradas em `TODO.md`: quantidade de teste (10), faixa de idade
  do exemplo (18–35), lógica de evolução de Força/Potencial e aplicação do
  Cansaço por etapa (depende do vínculo atleta ↔ etapa).

### Etapa 7 — Aba Atletas (UI)

- Adicionada a **terceira aba: Atletas** (ao lado de Calendário e Campeonatos).
- **Seletor por país**: ao escolher o país, lista **todos os atletas daquele
  país** (`ATHLETES` filtrado por `countryId`).
- Cada atleta aparece inicialmente só com **nome, idade e Força**; é **clicável e
  expande** (via `<details>`) para mostrar os demais atributos (Força, Potencial,
  Preparação Física e Cansaço).
- Sem novos dados: a tela apenas exibe os atletas já gerados no início da
  simulação.

### Etapa 8 — Entidade Clubes (database inicial)

- Criado `clubs.js` com a entidade Clube e uma **database inicial de 10 clubes
  reais** de tradição no atletismo (sem gerador), todos do Brasil.
- Campos: `id`, `name`, `countryId`, `president` (não usado), `foundationYear`,
  `infrastructureLevel` (0–100, considerando a força olímpica do país),
  `finances` (não usado) e `rivals` (a evoluir).
- **Sem UI e sem novas mecânicas** — apenas a entidade/database, carregada no
  ecossistema (`index.html`). A inscrição de atletas via clube e os demais
  pontos ficam registrados em `TODO.md`.

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
| `renderChampionship(id, highlight?)`| Mostra os dados do campeonato (com status das etapas); destaca opcionalmente. |
| `refreshChampionshipView()`         | Reavalia o campeonato exibido após a passagem de tempo.        |
| `refreshDayDetail()`                | Reavalia o detalhe do dia aberto após a passagem de tempo.     |
| `populateAthleteCountrySelect()`    | Preenche o seletor de países da aba Atletas.                    |
| `renderAthletes(countryId)`         | Lista os atletas do país (expansíveis para ver todos os dados). |

---

## 5. Como estender (guia rápido)

- **Novo país**: adicione uma entrada em `COUNTRIES` (`countries.js`).
- **Novo campeonato**: adicione uma entrada em `CHAMPIONSHIPS` (`championships.js`).
  Ele aparece automaticamente no seletor da aba Campeonatos, e suas etapas são
  marcadas no calendário.
- **Outro padrão de etapas**: reutilize `buildMonthlyStages(...)` ou crie a lista
  `stages` manualmente (`{ number, date }`).
