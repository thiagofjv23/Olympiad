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
| `contracts.js`      | **Entidade Contratos** — o elo Atleta ↔ Clube (assinatura/renovação).  |
| `participation.js`  | **Participação atleta ↔ etapa** (quem disputa cada etapa) + fadiga.     |
| `eligibility.js`    | **Travas de inscrição** — quem pode disputar por país/região/estado/cidade. |
| `ranking.js`        | **Ranking de Pontos** (cálculo) — pontos por atleta conforme a tier.    |
| `marksRanking.js`   | **Ranking de Marcas** (cálculo) — melhor marca por atleta/modalidade.   |
| `regions.js`        | **Entidade Regiões** — nível país → **região** → estado → cidade.       |
| `states.js`         | **Entidade Estados** — nível país → região → **estado** → cidade.       |
| `cities.js`         | **Entidade Cidades** (database inicial de cidades reais).               |
| `sports.js`         | **Entidade Esportes** (database inicial de esportes).                   |
| `modalities.js`     | **Entidade Modalidades** — agrupam eventos dentro de um esporte (Esporte → Modalidade). |
| `events.js`         | **Entidade Eventos** — as provas de uma modalidade (Modalidade → Evento); **despacha** a resolução para o ResultSystem do evento. |
| `competitionCategories.js` | **Entidade Categorias de Competição** — níveis/tiers do calendário. |
| `resultsEngine.js`  | **Engine de resolução de resultados** (genérica, sem conhecer esportes).|
| `timeResultSystem.js` | **TimeResultSystem** — resolve os eventos medidos por **tempo** (genérico; diferenças por evento via `event.time`). |
| `README.md`         | Resumo de uso.                                                          |
| `DOCUMENTACAO.md`   | Este documento de controle.                                            |
| `TODO.md`           | Pendências e decisões temporárias.                                     |
| `DECISOES.md`       | Decisões tomadas por conta própria (o "porquê").                       |
| `PRINCIPIOS_CIDADES.md` | Princípios de criação/geração de cidades.                          |
| `DIARIO_DE_TRABALHO.md` | Registro do que foi implantado, por data (atualizar só ao fim do dia). |
| `SUGESTOES_INICIO_DE_TRABALHO.md` | Pendências resumidas do dia anterior, da mais nova à mais antiga. |
| `CALENDARIO_DE_COMPETICOES.md` | Desenho do calendário de competições (categorias/tiers) e roteiro. |

### Princípio de arquitetura

Os **dados** (`countries.js`, `championships.js`) são separados da **UI**
(`script.js`). Os arquivos de dados só definem entidades e funções puras; a UI
apenas lê essas estruturas. Assim, adicionar um país ou campeonato é editar o
documento de dados — a interface (seletor, marcadores no calendário) se atualiza
sozinha.

Ordem de carregamento dos scripts (importa, pois são globais):
`countries.js` → `regions.js` → `states.js` → `cities.js` → `sports.js` →
`resultsEngine.js` → `timeResultSystem.js` → `modalities.js` → `events.js` →
`competitionCategories.js` →
`championships.js` → `athletes.js` → `clubs.js` → `contracts.js` →
`eligibility.js` → `ranking.js` → `marksRanking.js` → `participation.js` →
`script.js`. (`regions.js`/`states.js` vêm antes de `cities.js`, pois a cidade
referencia o estado e o estado referencia a região; `timeResultSystem.js` vem
depois de `resultsEngine.js` (usa a `ResultsEngine`) e antes de `events.js`, que
o registra e despacha para ele; `events.js` vem depois de
`modalities.js` e `resultsEngine.js`, pois o evento referencia a modalidade
(`getModality`) e usa a `ResultsEngine`; `championships.js` já vem depois de
`regions.js`/`states.js`/`cities.js` porque **gera** os campeonatos
geográficos a partir da geografia; `competitionCategories.js` vem antes de
`championships.js`, pois o campeonato referencia a categoria; `contracts.js` vem
depois de `athletes.js`, `clubs.js` e `championships.js` porque referencia
`getClub` e `toDayStart`; `eligibility.js`, `ranking.js` e `marksRanking.js` vêm
antes de `participation.js` (que aplica a trava e registra pontos/marcas);
`participation.js` vem por último, pois usa atletas, clubes, contratos e etapas.)

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

Países cadastrados: **Brasil** (`BRA`, população 213.421.037, força olímpica 78)
e **Argentina** (`ARG`, população 45.808.747, força olímpica 70). A Argentina
entrou apenas como **país + atributos básicos** (mesma estrutura do Brasil);
**cidades, clubes e atletas ficam para depois** (ver `TODO.md`).
Função utilitária: `getCountry(id)`.

### Campeonatos — `championships.js`

Objeto `CHAMPIONSHIPS` indexado por `id`. Cada campeonato:

| Campo         | Descrição                                              |
| ------------- | ------------------------------------------------------ |
| `id`          | Identificador único (ex.: `CNA-2026`).                 |
| `name`        | Nome do campeonato.                                    |
| `participants`| Número de participantes (inicia em `0`).               |
| `countryId`   | Referência ao país em `countries.js`.                  |
| `sportId`     | **Esporte disputado** (ver `sports.js`) — todo campeonato tem um. |
| `categoryId`  | **Categoria/porte** no calendário (ver `competitionCategories.js`). |
| `scope`       | **Trava geográfica** `{ level, placeId }` — quem pode disputar (ver `eligibility.js`). |
| `ageRestriction` | **Trava de idade** `{ minAge, maxAge }` (opcional) ou ausente — uso **futuro** (juvenil/sub). |
| `clubQuota`   | **Trava de cota**: máx. de atletas por clube **por etapa** (ou ausente = sem limite). CNA = 1. |
| `events`      | **Eventos (provas) disputados** — lista de ids de `events.js` (ex.: `["EVT-ATL-100M"]`). Uma etapa roda o primeiro evento. |
| `competitors` | Participantes (lista).                                 |
| `stages`      | Etapas — `{ number, date }`.                           |

**Calendário do Brasil (16 campeonatos):**

- **Nacional** — `CNA-2026` (Campeonato Nacional de Atletismo), categoria
  **Nacional**, `scope` país=`BRA`, **cota de 1 atleta por clube por etapa**
  (`clubQuota: 1`), 2º sábado do mês. Cadastrado à mão.
- **10 Estaduais** — um por estado com cidade na database (`CAMP-EST-<UF>-2026`),
  categoria **Estadual**, `scope` estado, 1º sábado do mês.
- **5 Regionais** — um por região com cidade (`CAMP-REG-<REGIÃO>-2026`), categoria
  **Regional**, `scope` região, 3º sábado do mês.

Estaduais e Regionais são **gerados** a partir da geografia (ver o gerador
abaixo); o Nacional está na database. Todo novo campeonato deve informar
`sportId`, `categoryId`, `scope` e a(s) modalidade(s).

Funções utilitárias:

- `getChampionshipSport(championship)` — o esporte do campeonato (objeto de
  `sports.js`).
- `getChampionshipCategory(championship)` — a categoria/porte do campeonato
  (objeto de `competitionCategories.js`).
- `getChampionshipScope(championship)` — a abrangência `{ level, placeId }` (trava
  geográfica) ou `null`.
- `getChampionshipAgeRestriction(championship)` — a trava de idade
  `{ minAge, maxAge }` ou `null`.
- `getChampionshipClubQuota(championship)` — a cota máx. de atletas por clube por
  etapa ou `null`.
- `buildCountryGeographicChampionships(config)` — **gera** os campeonatos
  **Estaduais** (por estado) e **Regionais** (por região) de um país, **só para
  lugares com cidade na database**, e os registra em `CHAMPIONSHIPS`. Genérico
  (serve qualquer país); chamado para o **Brasil** no fim de `championships.js`.
- `nthSaturday(year, month, n)` — data do N-ésimo sábado do mês.
- `secondSaturday(year, month)` — data do 2º sábado (= `nthSaturday(...,2)`).
- `buildMonthlyStagesOn(startYear, startMonth, count, nth)` — N etapas mensais no
  N-ésimo sábado (níveis usam sábados diferentes para não colidir).
- `buildMonthlyStages(startYear, startMonth, count)` — N etapas mensais no 2º
  sábado (compatibilidade).
- `getStagesOnDate(date)` — retorna as etapas (de qualquer campeonato) que caem
  em uma data. Usada para marcar o calendário e listar eventos do dia.
- `isStageDone(stage, referenceDate)` — **lógica de realização** da etapa. Lê a
  data da própria etapa (dinâmico, sem datas fixas/hardcoded) e a compara com a
  data de referência: retorna `true` ao **chegar no dia** da etapa ou depois.
- `championshipProgress(championship, referenceDate)` — `{ done, total }` com o
  número de etapas já realizadas em relação a uma data.

### Categorias de Competição — `competitionCategories.js`

Os **níveis (tiers)** do calendário de competições — a estrutura que organiza
**todas** as competições, do menor ao maior porte. É uma database **global e
independente de país** (as mesmas categorias valem para qualquer país); uma
competição aponta para uma categoria via `categoryId` e dela herda o **porte**
(prestígio), o **valor de ranking** e — no futuro — a **premiação**.

Objeto `COMPETITION_CATEGORIES` (indexado por `id`), do nível 1 (menor) ao 9
(maior):

| Nível | Categoria   | Scope         | Prestígio | Ranking |
| ----- | ----------- | ------------- | --------- | ------- |
| 1     | Regional    | subnacional   | 20        | 20      |
| 2     | Estadual    | subnacional   | 35        | 40      |
| 3     | Série C     | nacional      | 45        | 60      |
| 4     | Série B     | nacional      | 60        | 100     |
| 5     | Série A     | nacional      | 75        | 160     |
| 6     | Nacional    | nacional      | 95        | 300     |
| 7     | Continental | internacional | 98        | 450     |
| 8     | Mundial     | internacional | 99        | 700     |
| 9     | Olímpico    | internacional | 100       | 1000    |

Campos: `id`, `name`, `level` (1–9, ordena/compara portes), `scope` (alcance —
ver abaixo), `prestige` (0–100, porte, para casar clubes/atletas ao nível certo —
uso futuro) e `rankingPoints` (pontos de ranking que a categoria vale — base do
campeão; distribuição por posição é futura).

**Scope** (`COMPETITION_SCOPES`): `subnacional` (Regional/Estadual — recorte
dentro de um país; região/estado ainda não existem como entidade), `nacional`
(Série C/B/A e Nacional — de **um** país) e `internacional` (Continental/Mundial/
Olímpico — de **vários** países). É o que permite o calendário **servir todos os
países** sem duplicar as categorias.

**Premiação (dinheiro):** de propósito **não há campo no código**. A tabela de
valores (`$`… por categoria) é referência para o **sistema financeiro** futuro —
registrada em `TODO.md` e em `CALENDARIO_DE_COMPETICOES.md`.

Funções utilitárias: `getCompetitionCategory(id)`, `getAllCompetitionCategories()`
(ordenadas por `level`), `getCategoriesByScope(scope)` e `getCategoryByLevel(level)`.

O **desenho completo** do calendário (motivação, scope, ranking, premiação,
etapas/final e roteiro) está em **`CALENDARIO_DE_COMPETICOES.md`**.

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
| `ritmo`               | **Ritmo/forma** (0–100). Começa **intermediário** no início do ano, **sobe** ao competir e **cai** parado. **Modifica a resolução de resultados** (redutor de forma). Inicial/ganho/queda dependem da Preparação Física. |
| `birthCityId`         | **Cidade de nascimento** (ver `cities.js`), sorteada entre as cidades do país **ponderando pelo tamanho** (cidade maior → mais atletas). |
| `favoriteSportId`     | **Esporte favorito** (ver `sports.js`) — a ligação do atleta com um esporte. Todo regen recebe um ao ser gerado; neste início, **todos têm Atletismo** (`SPT-ATLETISMO`). |

Nome exibido = `label` + código do COI do país, ex.: **`Atleta 1 (BRA)`**
(via `getAthleteName(athlete)`). O esporte favorito é resolvido por
`getAthleteFavoriteSport(athlete)` (objeto de `sports.js`).

Regras de geração:

- **Idade**: gerador suporta **12–40** (`ATHLETE_AGE_LIMITS`); no exemplo atual
  gera **18–35** (`ATHLETE_GENERATION_CONFIG`).
- **Força**: distribuição **normal** centrada na **força olímpica do país**
  ajustada por uma curva de idade (pico em ~27 anos) **e pela infraestrutura
  esportiva da cidade de nascimento** (ver abaixo).
- **Potencial**: força inicial + margem (derivada da força olímpica e da
  infraestrutura da cidade), **escalada pela idade**: jovens têm margem grande
  (Força bem abaixo do Potencial) e os mais velhos margem pequena ou nula (já
  perto/no Potencial). **Nunca menor que a Força** e no máximo 100.
- **Influência da cidade de nascimento**: a `sportsInfrastructure` da cidade
  (0–100) desloca a média de Força e o teto de Potencial em relação a uma infra
  neutra (50). Constantes em `athletes.js`: `MAX_CITY_STRENGTH_BONUS` (±10 na
  Força) e `MAX_CITY_POTENTIAL_BONUS` (±8 no Potencial). Assim, **cidades com
  melhor infraestrutura tendem a formar atletas mais fortes e com maior
  potencial**.
- **Preparação Física**: normal em torno de 60 (0–100).
- **Cansaço** (`fatigue`): é a **energia/frescor** do atleta — **100 = descansado**,
  0 = exausto. Dois efeitos opostos o movem:
  - **Competir desgasta** (reduz): `fatigueReductionForStage(athlete)` define
    quanto cai por **etapa** — **mais idade → cai mais**, **mais Preparação Física
    → cai menos**. Aplicado por `applyStageFatigue(athlete)` (individual) e
    `applyStageFatigueToParticipants(participants)` (uma lista).
  - **Descansar recupera** (aumenta, até 100): `fatigueRecoveryForRestDay(athlete)`
    define quanto sobe por **dia sem competir** — **mais Preparação Física →
    recupera mais**, **mais idade → recupera menos** (espelho do desgaste, sinais
    trocados). Aplicado por `applyRestDay(athlete)`.
  - O desgaste é por **evento** (esforço pontual); a recuperação é por **dia**
    (contínua). `fatigue` é guardado como número **real** (a UI arredonda) para o
    acúmulo diário não perder precisão. O cansaço é sempre **individual**.
  - A orquestração (quem compete × quem descansa a cada dia) fica em
    `participation.js` (`processDay`).
- **Ritmo/forma** (`ritmo`, 0–100): forma de **médio prazo** (temporada), separada
  da Força (teto de habilidade) e do Cansaço (energia de curto prazo). Começa
  **intermediário** no início do ano e sobe competindo. Os **três** parâmetros
  dependem da **Preparação Física** (constantes em `athletes.js`):
  - **Inicial** (`initialRitmo`): base intermediária (45) + até +25 pelo preparo (→ 45–70).
  - **Ganho por prova** (`applyRaceRitmo`): fecha uma **fração do que falta para
    100** (`ritmoGainPctForRace`, 15–35% conforme o preparo — mais preparo entra
    em forma mais rápido).
  - **Queda por dia parado** (`applyRestDayRitmo`): perde uma **fração do ritmo
    atual** (`ritmoDropPctForRestDay`, 2%–0,5% conforme o preparo — mais preparo
    mantém a forma por mais tempo).
  - **Reset de temporada** (`resetSeasonRitmo`): na virada de ano (1º/jan) o ritmo
    de todos volta ao piso inicial. Orquestrado em `participation.js`
    (`processDay`): quem compete ganha ritmo; quem descansa perde.
  - **Efeito na resolução**: ver a modalidade (redutor de forma somado ao da
    fadiga) — abaixo, e sem remover Força/fadiga.

Função principal: `generateAthletes(count?, countryId?)` — gera os atletas e
substitui `ATHLETES`. Chamada ao **iniciar a simulação**.

> Números de teste (100 atletas, idade 18–35) e a lógica de evolução de
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
| `cityId`              | Cidade-sede do clube (ver `cities.js`).                        |
| `president`           | Presidente — **ainda não utilizado** (ver `TODO.md`).          |
| `foundationYear`      | Ano de fundação.                                               |
| `infrastructureLevel` | Nível de infraestrutura (0–100), definido considerando a força olímpica do país. |
| `prestige`            | Prestígio (0–100). **Ainda não utilizado**; será a base de Finanças, contratações e ordenamento de clubes (ver `TODO.md`). |
| `finances`            | Finanças — **ainda não utilizado** (ver `TODO.md`).           |
| `rivals`              | Clubes rivais (ids) — a evoluir (ver `TODO.md`).              |

Funções utilitárias: `getClub(id)` e `getClubsByCountry(countryId)`.

Conjunto inicial de 10 clubes: Pinheiros, Sogipa, Grêmio Náutico União, Minas
Tênis Clube, Flamengo, Vasco da Gama, Botafogo, Fluminense, Corinthians e Clube
Atlético Paulistano. Depois, **cada cidade que ainda não tinha clube recebeu 2**
(mesmos parâmetros): Brasília (Gama, Brasiliense), Salvador (Bahia, Vitória),
Fortaleza (Fortaleza EC, Ceará), Manaus (Nacional-AM, Fast), Curitiba (Coritiba,
Athletico-PR) e Recife (Sport, Náutico) — **22 clubes** no total, **todos do
Brasil**. Assim, **toda cidade da database tem clube**, e a afinidade de cidade
na contratação (ver `contracts.js`) passa a valer para todas. É um conjunto de
**teste**, a ser revisado e ampliado (inclusive com clubes de outros países).

### Contratos — `contracts.js`

O **elo entre Atletas e Clubes**. Um atleta se vincula a um clube por um
**contrato** com duração estipulada no início, sempre **anual**: **1, 2 ou 3
anos**. Ao término, o clube pode **renovar** (novo termo) ou o contrato **expira**
e o atleta volta ao **pool de agentes livres**. Diferente de clubes/cidades, os
contratos são **criados durante a simulação** (lista viva `CONTRACTS`, começa
vazia — nenhum vínculo é inventado). Ver `PRINCIPIOS_CONTRATOS.md`.

| Campo           | Descrição                                                        |
| --------------- | ---------------------------------------------------------------- |
| `id`            | Identificador único (`CTR-1`, `CTR-2`, ...).                     |
| `athleteId`     | Atleta vinculado (ver `athletes.js`).                            |
| `clubId`        | Clube contratante (ver `clubs.js`).                              |
| `startDate`     | Data de início do vínculo.                                       |
| `durationYears` | Duração em anos (**1, 2 ou 3**) — estipulada no início.          |
| `endDate`       | Data de término (`startDate` + `durationYears`), **derivada**.   |
| `renewalOf`     | Id do contrato anterior quando é uma renovação (senão `null`).   |

**Status derivado das datas** (como `isStageDone`): não há campo de status. Um
contrato está **ativo** no intervalo `[startDate, endDate)` — vale do dia de
início (inclusive) até a **véspera** do término; no dia do término já está
encerrado. O vínculo atual de um atleta é simplesmente o seu contrato ativo
naquela data. O clube do atleta é **derivado** do contrato (não é guardado no
atleta), evitando duplicar o elo em dois lugares.

Funções:

- `signContract(athleteId, clubId, startDate, durationYears)` — assina um novo
  contrato. Só assina **agente livre** (erro se já houver contrato ativo) e
  valida a duração (1/2/3). Retorna o contrato.
- `renewContract(contract, durationYears)` — **renovação pelo clube**: cria um
  novo termo do mesmo atleta e clube, começando **quando o atual termina** (sem
  lacuna nem sobreposição); grava `renewalOf`. O contrato anterior fica no
  histórico.
- `isContractActive(contract, ref)` / `isContractEnded(contract, ref)` — situação
  na data de referência (comparação por dia, dinâmica).
- `getActiveContractForAthlete(athleteId, ref)` — o vínculo atual do atleta (ou
  `null`).
- `getAthleteClub(athleteId, ref)` — o clube atual do atleta (derivado) ou `null`.
- `getContractsByClub(clubId, ref?)` — sem `ref`: histórico do clube; com `ref`:
  elenco **ativo** naquela data.
- `isFreeAgent(athleteId, ref)` e `getFreeAgents(athletes, ref)` — pool de
  **agentes livres** (sem contrato ativo).
- `isValidContractDuration(years)`, `contractEndDate(startDate, years)`,
  `getContract(id)`, `getAllContracts()`, `resetContracts()`.
- `seedTestContracts(athletes, referenceDate)` — **povoamento de TESTE**
  (temporário): assina cada atleta a um clube do seu país **sorteado ponderando
  por (1) nível de infraestrutura** (mais infraestrutura → mais atletas; menos →
  menos) **e (2) afinidade com a cidade de nascimento** (chance bem maior de ir a
  um clube da própria cidade), via `pickClubForAthlete`, com duração anual
  sorteada. A **agência livre** (uma fração `TEST_FREE_AGENT_RATE`) é decidida
  **antes** e independe do clube — a afinidade de cidade **não** impede o atleta
  de ficar sem clube. Só para dar dados às telas; será substituído pelo fluxo real
  de contratação (ver `TODO.md`). Chamado no início da simulação (`script.js`).
- `pickClubForAthlete(clubs, athlete)` — sorteia um clube de uma lista
  **ponderando por infraestrutura × afinidade de cidade** (via `clubSeedWeight`);
  mesmo estilo do sorteio ponderado da cidade de nascimento em `athletes.js`; cai
  para sorteio uniforme se a soma dos pesos for 0. Usado pelo `seedTestContracts`.
- `clubSeedWeight(club, athlete)` — peso do clube no sorteio: base = seu
  `infrastructureLevel`, multiplicado por `TEST_SAME_CITY_AFFINITY` quando o clube
  é da **mesma cidade** de nascimento do atleta. Sem atleta/cidade, usa só a
  infraestrutura.

**UI:** a aba **Clubes** tem o link **"Atletas do clube"** (dentro do `<details>`
do clube) que revela os atletas contratados — cada item com o **nome** (clicável,
leva ao **perfil do atleta**) e os dados do contrato: **duração**, **término** e
marca **"renovado"** quando for renovação. Abaixo dos clubes, a lista de
**Agentes livres** do país (nomes clicáveis). A aba **Atletas** mostra o **Clube
atual** de cada atleta (ou "Agente livre"). Tudo é **reativo à passagem de tempo**
(um contrato que expira/entra em vigor atualiza elenco, agentes livres e clube do
atleta). Ver a seção 4 e as Etapas 23–24.

### Participação atleta ↔ etapa — `participation.js`

A ponte entre **atletas (via clube/contrato)** e as **etapas** de um campeonato:
define **quais atletas disputam cada etapa** e aplica a **fadiga** de participação.

**Regra de TESTE (temporária):** cada clube inscreve **todos** os seus atletas em
**todas** as etapas. Assim, os participantes de uma etapa são todos os atletas
com **contrato ativo na data da etapa** em algum clube do país do campeonato;
**agentes livres não disputam** (nenhum clube os inscreve). Falta a mecânica
**real** de cadastro (ver `TODO.md`, prioridade média).

**Travas de inscrição:** o participante precisa ser **elegível** às travas de
atleta (abrangência `scope` + faixa etária `ageRestriction` — ver `eligibility.js`)
**e** respeitar a **cota por clube** (`clubQuota`): cada clube inscreve no máximo
N atletas **por etapa** (ex.: **CNA = 1**). Assim, participantes = **contratados
via clube ∩ elegíveis (geografia+idade)**, depois **limitados pela cota**. Quando
a cota corta, um **placeholder** manda os atletas **mais fortes** do clube
(`limitAthletesPerClub`, por `strength`, desempate por id) — a seleção **real**
(qual atleta o clube inscreve) é a mecânica pendente (ver `TODO.md`).

Funções:

- `getStageParticipants(championship, stage)` — atletas participantes da etapa
  (contratados via clube, elegíveis pelas travas de atleta e dentro da cota por
  clube); `getStageParticipantCount(...)` retorna a quantidade.
- `limitAthletesPerClub(athletes, athleteClubId, quota)` — aplica a cota por clube
  (placeholder: os mais fortes).
- `getStageEvent(championship, stage)` — a prova (evento) disputada (por ora, o
  primeiro evento do campeonato; senão, o primeiro evento do esporte).
- `processStage(championship, stage)` — processa uma etapa **uma única vez**:
  (1) **resolve o resultado** com a fadiga atual dos participantes (via
  `resolveEvent`) e o **trava**; (2) **soma os pontos** ao ranking
  (`recordStageForRanking`, conforme a tier) e **registra as marcas**
  (`recordStageMarks`, melhor por atleta); (3) aplica a fadiga da etapa aos
  participantes.
- `processDay(date)` — processa **um dia**: (0) na virada de ano **encerra a
  temporada** — arquiva os rankings de pontos e marcas (`archiveSeason` /
  `archiveMarksSeason`) e os zera — e reinicia o **ritmo** de todos
  (`resetSeasonRitmo`); (1) resolve as etapas do dia — seus
  participantes se **cansam** e **ganham ritmo**; (2) os demais **descansam**
  (recuperam Cansaço com `applyRestDay` e **perdem ritmo** com `applyRestDayRitmo`).
  Quem competiu no dia não descansa nesse dia. Chamado **dia a dia** por
  `advanceDays`.
- `getStageResult(championship, stage)` — o resultado travado da etapa
  (`[{ id, result, position }]`) ou `null` se ainda não realizada.
  `resetParticipation()` zera os resultados processados.

### Travas de inscrição — `eligibility.js`

Define **quem pode disputar** um campeonato pelas **travas de atleta**:

- **Abrangência geográfica** (`championship.scope`): só participa quem é "daquele"
  recorte — **país, região, estado ou cidade**. A **origem** do atleta é derivada
  da sua **cidade de nascimento** (`birthCityId`), que dá todos os níveis pela
  hierarquia país → região → estado → cidade. Independe de contrato/clube (vale
  até para agentes livres). O `scope` é `{ level, placeId }`, com `level` ∈
  `country`/`region`/`state`/`city`. Sem `scope`, não há trava.
- **Faixa etária** (`championship.ageRestriction` = `{ minAge, maxAge }`, ambos
  opcionais): só participa quem está na idade exigida. **Uso futuro** (campeonatos
  juvenis/sub) — o mecanismo existe, mas nenhum campeonato usa ainda. Sem
  restrição → todos.

(A trava de **cota por clube** é de grupo/etapa e fica em `participation.js`.)

Funções:

- `getAthleteOriginIds(athlete)` — `{ cityId, stateId, regionId, countryId }` da
  origem do atleta (via cidade de nascimento).
- `isAthleteEligibleForScope(athlete, scope)` — elegível ao escopo geográfico?
- `isAthleteAgeEligible(athlete, ageRestriction)` — está na faixa etária?
- `getEligibleAthletes(athletes, scope)` — filtra uma lista pelo escopo.
- `isAthleteEligibleForChampionship(athlete, championship)` — passa em **todas** as
  travas de atleta (geográfica + idade)?
- `getChampionshipEligibleAthletes(championship)` — todos os elegíveis (geografia +
  idade); usado na UI para "Atletas elegíveis".

### Sistema de Ranking — `ranking.js`

Acumula **pontos por atleta** ao longo da **temporada** (ano-calendário), a partir
dos resultados das etapas. A pontuação de cada etapa depende da **categoria/tier**
do campeonato: **maiores valem mais** (a categoria dá a base do campeão via
`rankingPoints`), menores valem menos. É **só cálculo** — a UI (aba Rankings) só
**lê** e exibe.

- **Distribuição por posição** (`pointsForPosition(base, position)`): modelo
  **placeholder** de decaimento **harmônico** — campeão leva a base cheia e as
  posições seguintes levam frações (`base / posição`, arredondado). Ex.: Nacional
  (base 300) → 1º 300, 2º 150, 3º 100…; Estadual (40) → 1º 40…; Regional (20) →
  1º 20… Fácil de recalibrar (ver `TODO.md`/`DECISOES.md`).
- **Acúmulo**: `recordStageForRanking(championship, results)` soma os pontos e conta
  **+1 etapa** para cada atleta com resultado. Chamado **uma vez por etapa** por
  `processStage` (participation.js).
- **Ranking corrente**: `getSeasonRanking()` → `[{ position, athleteId, points,
  stages }]`, ordenado por pontos (desempate: mais etapas, depois id); empates em
  pontos **compartilham** posição.
- **Temporada / histórico**: na virada de ano, `processDay` chama
  `archiveSeason(anoQueTerminou)` (snapshot em `RANKING_HISTORY`) e
  `resetRankingSeason()` (zera o acúmulo). O histórico é **salvo para uso
  posterior** (ainda não consumido — ver `TODO.md`). Consulta:
  `getRankingHistory(year)`, `getRankingHistoryYears()`. `resetRanking()` limpa
  tudo.

### Ranking de Marcas — `marksRanking.js`

Para cada **evento** (prova), guarda a **melhor marca** de cada atleta na
**temporada** e monta o ranking da melhor para a pior marca. "Melhor" depende do
evento (a `resolution.order` da ResultsEngine): nos 100 m (tempo) a **menor** marca
é a melhor. É um **template genérico**: funciona para **qualquer** evento
(indexado por `eventId`, usando a ordem e o formatador do próprio evento).
Também é **só cálculo** — a UI só lê e exibe.

De cada melhor marca guarda-se **onde/quando** foi alcançada (`date`,
`championshipId`, `stageNumber`), para a UI detalhar ao clicar na data.

- `recordStageMarks(championship, stage, event, results)` — registra as marcas
  de uma etapa, mantendo só a **melhor** por atleta (via `isBetterResult`). Chamado
  por `processStage`.
- `getSeasonMarksRanking(eventId)` → `[{ position, athleteId, value, date,
  championshipId, stageNumber }]`, ordenado por marca (empate na marca compartilha
  posição). `getEventsWithMarks()` lista os eventos com marcas.
- **Temporada / histórico**: na virada de ano, `processDay` chama
  `archiveMarksSeason(anoQueTerminou)` (snapshot por evento em `MARKS_HISTORY`)
  e `resetMarksSeason()`. Histórico **salvo para uso posterior** (ver `TODO.md`).
  Consulta: `getMarksHistory(year)`. `resetMarks()` limpa tudo.

Por que travar o resultado: a fadiga muda ao longo do tempo; o resultado de uma
etapa é **histórico** e é fixado no momento da realização (com a fadiga de então,
antes do desgaste daquela etapa). Efeito: etapas seguintes tendem a ficar mais
lentas conforme os atletas acumulam cansaço. A **UI** exibe a classificação na
aba Campeonatos (ver seção 4 e Etapa 26).

### Hierarquia geográfica — `regions.js` e `states.js`

O território de um país é dividido em **regiões** e **estados**, formando a
hierarquia **país → região → estado → cidade**. É a base dos portes
**Regional** e **Estadual** do calendário (ver `competitionCategories.js` e
`CALENDARIO_DE_COMPETICOES.md`).

#### Regiões — `regions.js`

Objeto `REGIONS` (indexado por `id`). Cada região agrupa estados de um mesmo país.

| Campo       | Descrição                                     |
| ----------- | --------------------------------------------- |
| `id`        | Identificador único (ex.: `REG-SUDESTE`).     |
| `name`      | Nome da região (ex.: `Sudeste`).              |
| `countryId` | País da região (ver `countries.js`).          |

Conjunto inicial: as **5 regiões do Brasil** (Norte, Nordeste, Centro-Oeste,
Sudeste, Sul). Funções: `getRegion(id)`, `getRegionsByCountry(countryId)`,
`getAllRegions()`.

#### Estados — `states.js`

Objeto `STATES` (indexado por `id`). Cada estado pertence a uma **região** e a um
**país**.

| Campo          | Descrição                                                       |
| -------------- | --------------------------------------------------------------- |
| `id`           | Identificador único (ex.: `EST-RJ`).                           |
| `name`         | Nome do estado (ex.: `Rio de Janeiro`).                        |
| `abbreviation` | Sigla (ex.: `RJ`).                                             |
| `countryId`    | País do estado (derivável via região; guardado para filtragem direta). |
| `regionId`     | Região do estado (ver `regions.js`).                          |

Conjunto inicial: **10 estados** — os das cidades já cadastradas (`cities.js`),
cobrindo as 5 regiões. **Não** é o conjunto completo das 27 unidades federativas;
ampliar depois (mesmo espírito das "10 cidades de teste" — ver `TODO.md`).
Funções: `getState(id)`, `getStatesByCountry(countryId)`,
`getStatesByRegion(regionId)`, `getStateRegion(state)`, `getAllStates()`.

### Cidades — `cities.js`

Database inicial (objeto `CITIES`) de cidades reais. **Relaciona-se com países,
estados, clubes e atletas**: é o país e o **estado** da cidade, a sede dos clubes
e a cidade de nascimento dos atletas.

| Campo                  | Descrição                                                       |
| ---------------------- | --------------------------------------------------------------- |
| `id`                   | Identificador único (ex.: `CID-SAO-PAULO`).                    |
| `name`                 | Nome da cidade.                                                 |
| `countryId`            | País da cidade (ver `countries.js`).                           |
| `stateId`              | **Estado** da cidade (ver `states.js`); região e país deriváveis dele. |
| `populationEstimate`   | População estimada (base para o tamanho).                      |
| `size`                 | Tamanho **derivado** da população: pequena / média / grande / metrópole. |
| `sportsInfrastructure` | Infraestrutura esportiva (0–100), influenciada pela força olímpica do país. |

Helpers de hierarquia: `getCityState(city)` (estado da cidade) e
`getCityRegion(city)` (região, derivada via estado).

Funções utilitárias: `getCity(id)`, `getCitiesByCountry(countryId)` e
`citySizeFromPopulation(pop)`.

As **regras de criação** (10 cidades por país no início, faixas de tamanho,
influência da força olímpica) estão em **`PRINCIPIOS_CIDADES.md`**, junto da lista
das 10 cidades do Brasil.

### Esportes — `sports.js`

Database inicial (objeto `SPORTS`). O esporte **definirá, no futuro, como os
atributos dos atletas serão usados na simulação de resultados** (cada esporte
valoriza atributos de forma diferente) — essa lógica ainda **não existe** (ver
`TODO.md`).

| Campo               | Descrição                                                        |
| ------------------- | ---------------------------------------------------------------- |
| `id`                | Identificador único (ex.: `SPT-ATLETISMO`).                     |
| `name`              | Nome do esporte.                                                 |
| `description`       | Descrição.                                                       |
| `generalPopularity` | Popularidade geral (0–100).                                      |
| `practiceStartYear` | Ano de início da prática (número; negativo = a.C., ex.: −776).  |
| `originCountry`     | País originário (texto — ver `DECISOES.md`).                    |
| `resultSystems`     | Lista dos **ResultSystem** do esporte (ex.: `TimeResultSystem`, `MatchResultSystem`, …). **Só indicador/rótulo por enquanto** — sem mecânica (a mecânica é **prioridade alta** no `TODO.md`). |

Funções utilitárias: `getSport(id)` e `getAllSports()`.

Conjunto atual: **36 esportes olímpicos** (Atletismo — o do nosso campeonato —,
Badminton, Basquete, Beisebol/Softbol, Boxe, Canoagem, Ciclismo, Críquete,
Escalada Esportiva, Esgrima, Flag Football, Futebol, Ginástica, Golfe, Handebol,
Hipismo, Hóquei sobre Grama, Judô, Lacrosse, Levantamento de Peso, Lutas,
Natação, Pentatlo Moderno, Remo, Rugby, Skate, Surfe, Squash, Taekwondo, Tênis,
Tênis de Mesa, Tiro Esportivo, Tiro com Arco, Triatlo, Vela e Voleibol). Cada um
declara seus **`resultSystems`** (só indicador). Popularidade, anos e origens são
**aproximações**, a revisar.

Os **ResultSystem** por esporte (conforme a tabela pedida): `TimeResultSystem`,
`DistanceResultSystem`, `HeightResultSystem`, `PointsResultSystem`,
`MatchResultSystem`, `JudgeResultSystem`, `ScoreResultSystem`,
`WeightResultSystem` e `CombinedResultSystem`. **Nenhum tem mecânica ainda** — a
criação da mecânica de ResultSystem é **prioridade alta** (ver `TODO.md`).

### Engine de resultados — `resultsEngine.js`

Módulo **genérico e independente** (`ResultsEngine`): **não conhece esportes**
nem outras entidades. Contém só os **parâmetros de simulação** e funções puras
para, dados resultados numéricos, decidir a ordem/posições. Cada esporte/prova
(no futuro) monta um objeto de parâmetros com estas constantes e entrega números
à engine.

Parâmetros expostos:

| Grupo          | Valores                                                            |
| -------------- | ----------------------------------------------------------------- |
| `METRICS`      | `TIME`, `DISTANCE`, `HEIGHT`, `POINTS` (o que é medido).           |
| `ORDERS`       | `ASCENDING` (menor vence, ex.: tempo), `DESCENDING` (maior vence). |
| `AGGREGATIONS` | `SINGLE`, `BEST`, `SUM`, `AVERAGE` (como combinar tentativas).     |
| `UNITS`        | Unidade padrão por métrica (informativo).                         |

Funções principais: `resolveResults(competitors, params)` (ranking com posições,
empates compartilham posição, resultados `null`/DNF por último), `aggregateValues`,
`isBetterResult`, `compareResults`, `roundToPrecision` e validadores
(`isValidOrder`, `isValidAggregation`, `isValidMetric`).

Objeto `params`: `{ order, aggregation?, metric?, precision? }`.
Competidores: `{ id, values: number[] }` ou `{ id, value }`.

### Modalidades — `modalities.js`

**Nível intermediário** da hierarquia **Esporte → Modalidade → Evento**. Uma
modalidade **agrupa os eventos** (provas) de um esporte. Ex.: no Atletismo, a
modalidade **Velocidade** reúne provas como os **100 m** (que são um **evento**).

| Campo     | Descrição                                    |
| --------- | -------------------------------------------- |
| `id`      | Identificador único (ex.: `MOD-ATL-VELOCIDADE`). |
| `name`    | Nome da modalidade (ex.: `Velocidade`).      |
| `sportId` | Esporte a que pertence (ver `sports.js`).    |

Funções utilitárias: `getModality(id)`, `getModalitiesBySport(sportId)` e
`getModalitySport(modality)` (o esporte da modalidade).

**Database: 72 modalidades** — a lista olímpica por esporte (Atletismo →
Velocidade, Meio-fundo, Fundo, Barreiras, Obstáculos, Revezamentos, Saltos,
Arremessos/Lançamentos, Marcha Atlética, Provas Combinadas; Vela → Dinghy, Skiff,
Multicasco, Prancha à Vela, Kite; etc.). É só a estrutura (id/nome/esporte) — o
**modelo de resultado** fica nos **eventos** (abaixo). Ainda **sem UI** (ver
`TODO.md`).

### Eventos — `events.js`

**Nível resolvível** da hierarquia (Modalidade → **Evento**). O evento é a prova
que a simulação resolve. **Como** ele é resolvido depende do seu **sistema de
resultado** (`resultSystem`); o evento traz os **parâmetros** da sua prova.
Pertence a uma **modalidade** (`modalityId`).

| Campo               | Descrição                                                        |
| ------------------- | ---------------------------------------------------------------- |
| `id`                | Identificador único (ex.: `EVT-ATL-100M`).                       |
| `name`              | Nome do evento (ex.: `100 metros rasos`).                        |
| `modalityId`        | Modalidade a que pertence (ver `modalities.js`).                 |
| `resultSystem`      | *(opcional)* Id do **sistema de resultado** que resolve a prova (ex.: `"TimeResultSystem"`). Presente onde o evento já é **disputável**. |
| `resolution`        | *(opcional)* **Forma de resolução** — parâmetros da `ResultsEngine` (`{ metric, order, aggregation, precision }`). Presente onde há `resultSystem`. |
| `time`              | *(opcional)* Parâmetros **desta prova** para o `TimeResultSystem` (ex.: `{ recordTime }`). Cada sistema tem o seu bloco. |
| `generalPopularity` | *(opcional)* Popularidade geral do evento (0–100).               |
| `countryPopularity` | *(opcional)* Popularidade por país — **relação a fazer depois** (ver `TODO.md`). |

Funções utilitárias: `getEvent(id)`, `getEventsByModality(modalityId)`,
`getEventsBySport(sportId)` (via a modalidade) e `getEventModality(event)`.

**Despacho de resolução** (events.js só encaminha, não calcula): um registro
`EVENT_RESULT_SYSTEMS` mapeia `resultSystem` → módulo do sistema.
`getEventResultSystem(event)` acha o sistema; `isEventPlayable(event)` diz se a
prova já é **disputável**; `resolveEvent(athletes, event)`, `computeEventResult`
e `formatEventResult` **delegam** ao sistema do evento (retornam `[]`/`null`/`—`
se o evento ainda não tiver sistema). Plugar um sistema novo = criar o módulo e
registrá-lo em `EVENT_RESULT_SYSTEMS`.

**Database: ~190 eventos** seguindo o **calendário olímpico** — cada modalidade
recebe as suas provas (ex.: Velocidade → 100 m, 200 m, 400 m; Natação → 50 m
livre … revezamentos; Judô/Boxe/Lutas → categorias de peso; coletivos →
"Torneio …"). Um evento vira **disputável** quando ganha `resultSystem` +
`resolution` + os seus parâmetros. Já são disputáveis **todas as provas de tempo
do Atletismo** (17: os 100 m + 200/400 m, 800/1500 m, 5000/10000 m, Maratona, as
3 de barreiras, obstáculos, os 3 revezamentos e as 2 de marcha) — via
`TimeResultSystem`, cada uma com o seu recorde. Os demais eventos ganham o seu à
medida que forem parametrizados (as diferenças entram **evento a evento** — ver
`TODO.md`). Eventos ainda sem sistema **não são resolvidos** (nenhum campeonato os
disputa ainda) — só compõem a estrutura Esporte → Modalidade → Evento (e aparecem
na aba Esportes).

Provas de tempo são criadas com a **fábrica `makeTimeEvent(id, name, modalityId,
recordTime, secondsPerStrengthPoint)`** — cada uma numa linha só, com o **recorde**
(piso) e a **escala** próprios; o resto herda os defaults do `TimeResultSystem`.
Convenção de escala: `secondsPerStrengthPoint ≈ recordTime × 0,005` (mesma
dispersão relativa dos 100 m ~10% para 20 pontos de Força), o que dá tempos
coerentes com a vida real em todas as distâncias.

### TimeResultSystem — `timeResultSystem.js`

**Sistema de resultado por TEMPO**: um único sistema **genérico** que resolve
**qualquer** prova medida em tempo (corridas do atletismo, natação, remo,
contrarrelógio, …). O que **muda** de uma prova para outra vem dos **parâmetros do
próprio evento** (`event.time`); o que é **comum** tem defaults no sistema. Assim,
tornar uma prova de tempo disputável é só **cadastrar os seus parâmetros** — sem
tocar em código —, e novos esportes de tempo entram do mesmo jeito.

Modelo (o mesmo dos 100 m, agora generalizado):

- **Força efetiva** = `Força − redutor de fadiga − redutor de forma`.
  - **Redutor de fadiga** = `(100 − fatigue) × fatiguePenaltyPerPoint`
    (default `0.3`).
  - **Redutor de forma** = `(100 − ritmo) × formPenaltyPerPoint` (default `0.15`).
    Os dois **somam**; sem `ritmo`, o déficit é 0.
- **Tempo** = `recordTime + (100 − Força efetiva) × secondsPerStrengthPoint`
  (default `secondsPerStrengthPoint = 0.05`). Força efetiva 100 → `recordTime` (o
  **piso**/recorde da prova); quanto menor, mais lento.

Parâmetros por evento (`event.time`): **`recordTime`** (obrigatório — o piso da
prova) e, se a prova precisar, sobrescritas de `secondsPerStrengthPoint`,
`fatiguePenaltyPerPoint`, `formPenaltyPerPoint` (ex.: uma corrida longa usa um
`secondsPerStrengthPoint` maior). O **`EVT-ATL-100M`** define só
`time: { recordTime: 9.58 }` e herda os demais defaults — resultado **idêntico**
ao modelo anterior.

Interface (`TimeResultSystem`, objeto único como a `ResultsEngine`): `id`,
`DEFAULTS`, `params(event)`, `resolves(event)`, `effectiveStrength(athlete,
event)`, `computeResult(athlete, event)` (o tempo), `format(value, event)` (ex.:
`10.18 s`) e `resolve(athletes, event)` (ranqueia pela `ResultsEngine`, menor
tempo vence).

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

### Etapa 9 — Aba Clubes (UI)

- Adicionada a **quarta aba: Clubes**, no mesmo padrão da aba Atletas.
- **Seletor por país**: ao escolher o país, lista **todos os clubes daquele país**
  (`getClubsByCountry`).
- Cada clube aparece inicialmente com **nome, país e Prestígio**; é **clicável e
  expande** (via `<details>`) para as demais informações (ID, ano de fundação,
  infraestrutura, presidente, finanças e rivais).
- **Prestígio** é exibido como **"N/D"**: o atributo `prestige` ainda **não existe**
  na entidade Clube — apenas na UI, conforme combinado (registrado em `TODO.md`).

### Etapa 10 — Prestígio dos clubes e registro de decisões

- Criado o atributo **`prestige`** (0–100) em **todos os clubes** de `clubs.js`,
  com valores iniciais aproximados. A aba Clubes passou a exibir o valor real
  (antes era "N/D").
- **Ainda não é utilizado** em nenhuma mecânica. Ficará como base das futuras
  features: **Finanças**, **contratações** e **ordenamento de clubes** — marcado
  como **prioridade alta** no `TODO.md`.
- Criado o documento **`DECISOES.md`**, que registra as decisões tomadas por conta
  própria durante o projeto (ex.: unificar o CSS de Atletas/Clubes, usar
  `<details>`, manter todos os clubes no Brasil, etc.).

### Etapa 11 — Entidade Cidades (database inicial)

- Criado `cities.js` com a entidade Cidade e uma **database inicial de 10 cidades
  reais do Brasil** (sem gerador), com `size` derivado da população e
  `sportsInfrastructure` (0–100) influenciada pela força olímpica do país.
- **Vínculos criados**:
  - **Clube → cidade**: adicionado `cityId` a cada clube (cidade-sede).
  - **Atleta → cidade**: adicionado `birthCityId` (cidade de nascimento),
    sorteado entre as cidades do país na geração.
- Criado **`PRINCIPIOS_CIDADES.md`** com as regras (10 cidades por país no início,
  faixas de tamanho, influência da força olímpica) e a lista das cidades.
- **Sem UI** — apenas a entidade/database e os vínculos. A UI é o próximo passo.

### Etapa 12 — Cidades na UI de Atletas e Clubes

- **Atletas**: o **local de nascimento** passou a aparecer **apenas ao expandir**
  o atleta (nova linha "Local de nascimento").
- **Clubes**: a **cidade-sede** passou a aparecer **ao lado do país** no resumo
  (ex.: `Esporte Clube Pinheiros — São Paulo, BRA`) e também como linha "Cidade"
  no expandir.
- Registrado no `TODO.md` (apenas documentação, sem lógica): expandir o uso de
  cidades para as **etapas de campeonatos** (cada etapa em uma cidade-sede).

### Etapa 13 — Local de nascimento ponderado pelo tamanho da cidade

- O gerador de atletas passou a sortear a cidade de nascimento **proporcional ao
  tamanho da cidade**: cada tamanho tem um peso (`CITY_SIZE_WEIGHTS` em
  `cities.js` — pequena 1, média 2, grande 4, metrópole 8), então cidades maiores
  concentram mais atletas.
- Verificado com amostra grande: metrópoles (~11,8% cada) recebem o dobro das
  cidades grandes (~5,9% cada).
- Registrado no `TODO.md` (apenas documentação, sem lógica): **organizador/ordenador**
  nas telas de Clubes e Atletas (por prestígio, local, etc.).

### Etapa 14 — Infraestrutura da cidade influencia Força e Potencial

- O gerador de atletas passou a usar a **infraestrutura esportiva da cidade de
  nascimento** para deslocar a **Força** e o **Potencial**.
- **Lógica** (em `athletes.js`):
  - `cityInfraFactor(infra) = (infra − 50) / 50` → varia de **−1** (infra 0) a
    **+1** (infra 100), sendo **0** na infra neutra (50).
  - **Força**: `média = forçaOlímpica × fatorIdade + fator × MAX_CITY_STRENGTH_BONUS`
    (bônus/penalidade de até ±10), depois a amostragem normal e o clamp 1–100.
  - **Potencial**: `margem = |normal(...)| + fator × MAX_CITY_POTENTIAL_BONUS`
    (até ±8 no teto), mantendo `potencial ≥ força` e ≤ 100.
  - Sem cidade cadastrada, usa-se a infra neutra (50) → sem efeito.
- **Verificado** com amostra grande: a Força e o Potencial médios crescem de forma
  monotônica com a infraestrutura da cidade (Rio, infra 92 → ~83,1 / ~96,7;
  Manaus, infra 68 → ~78,3 / ~91,4).

### Etapa 15 — Distância Força↔Potencial depende da idade

- O Potencial passou a considerar a **idade**: a margem de crescimento (distância
  entre Força e Potencial) é **escalada por um fator de idade** (`growthFactor`).
- **Lógica** (em `athletes.js`):
  - `growthFactor(age)` = **1** até `GROWTH_FULL_AGE` (18 anos, margem plena),
    caindo **linearmente** até **0** em `GROWTH_END_AGE` (32 anos).
  - `margem = max(0, margemBase(forçaOlímpica, cidade)) × growthFactor(idade)`, e
    `potencial = clamp(força + margem, força, 100)`.
  - Assim: **jovens** têm Força bem abaixo do Potencial; conforme envelhecem, ficam
    **mais próximos** do Potencial; e a partir de 32 anos **já o atingiram**
    (Potencial = Força).
- **Verificado** com amostra grande: gap médio Potencial−Força cai de ~15,5 (18
  anos) para ~1,15 (31 anos) e chega a 0 a partir dos 32 (100% já no potencial).

### Etapa 16 — Entidade Esportes (database inicial)

- Criado `sports.js` com a entidade Esporte e uma **database inicial de 6
  esportes** (sem gerador): Atletismo, Natação, Futebol, Basquete, Vôlei e
  Ginástica Artística.
- Campos: `id`, `name`, `description`, `generalPopularity` (0–100),
  `practiceStartYear` (negativo = a.C.) e `originCountry` (texto).
- **Sem UI e sem novas mecânicas** — apenas a entidade/database, carregada no
  ecossistema. A lógica de **como o esporte afeta o uso dos atributos na simulação
  de resultados** fica registrada no `TODO.md`.

### Etapa 17 — Engine de resolução de resultados

- Criado `resultsEngine.js` (`ResultsEngine`), módulo **genérico** que **não
  conhece os esportes** — só parâmetros de simulação e funções puras de resolução.
- **Parâmetros**: métricas (tempo, distância, altura, pontos), direção de vitória
  (menor vence / maior vence), agregação (único, melhor, soma, média), unidades e
  precisão. Pensado a partir das provas de atletismo (nosso foco).
- **Funções**: `resolveResults` gera o ranking com posições (empates dividem a
  posição; `null`/DNF por último), além de agregação, comparação e validação.
- **Verificado**: corrida por tempo (menor vence), salto por melhor tentativa
  (maior vence), soma de pontos, empates e DNF — todos corretos.
- **Sem exemplos embutidos** e sem tocar em outros módulos, conforme a diretriz
  registrada no `DECISOES.md`.

### Etapa 18 — Entidade Modalidades (só a estrutura)

- Criado `modalities.js` com a entidade Modalidade, **ligada a um esporte**
  (`sportId`) e com a **forma de resolução** apontando para os parâmetros da
  `ResultsEngine`.
- Campos: `id`, `name`, `sportId`, `resolution`, `generalPopularity` e
  `countryPopularity` (este último com a relação a fazer depois).
- **Database vazia** e **sem UI** — apenas a entidade e os helpers
  (`getModality`, `getModalitiesBySport`), conforme a diretriz de não criar
  dados de exemplo não solicitados.

### Etapa 19 — Modalidade 100 m e modelo de resultado

- Criada a modalidade **100 m rasos** (`MOD-ATL-100M`) do Atletismo (a pedido).
- **Modelo de desempenho** (documentado na seção da entidade): Força efetiva =
  Força − redutor de fadiga; **Tempo** = recorde (9,58 s) + (100 − Força efetiva)
  × 0,05. O recorde é o **piso** de tempo.
- **Resolução via `ResultsEngine`**: `resolveModality` gera o tempo de cada atleta
  e ranqueia por **menor tempo**; o resultado exibido é o **tempo alcançado**
  (ex.: `10.18 s`).
- **Verificado**: força efetiva 100 → 9,58 s; atleta cansado corre mais lento
  (For 80 descansado 10,58 s → fatigue 60 = 11,18 s); empates dividem a posição.
- Ainda **sem UI de resultados** e sem participação atleta↔etapa (ver `TODO.md`).

### Etapa 49 — Parametrização das provas de tempo do Atletismo

- Todas as **16 provas de tempo do Atletismo** (além dos 100 m, que ficaram
  **intactos**) foram parametrizadas para o `TimeResultSystem` e agora são
  **disputáveis**: 200/400 m, 800/1500 m, 5000/10000 m, Maratona, 100/110/400 m
  com barreiras, 3000 m com obstáculos, revezamentos 4x100/4x400/4x400 misto e
  marcha 20/35 km. **17 eventos jogáveis** no total.
- **Recordes reais como piso**: cada prova usa o **recorde mundial** como
  `recordTime` (ex.: 200 m 19,19 s; 800 m 1:40,91; Maratona 2:00:35; 4x100 m
  36,84 s), então Força efetiva 100 → o recorde e os tempos batem com a vida real.
- **Escala coerente por distância**: `secondsPerStrengthPoint ≈ recordTime ×
  0,005` (a mesma dispersão relativa dos 100 m), dando spreads realistas (ex.: uma
  Força 85 corre 200 m em ~20,7 s, 800 m em ~1:48, Maratona em ~2:09:35).
- **Fábrica `makeTimeEvent(...)`** (nova, em `events.js`): cria cada prova de tempo
  em **uma linha**, com o recorde e a escala próprios; garante a mesma forma de
  resolução (métrica tempo, menor vence). Facilita manutenção e novas provas.
- **Escopo**: só `events.js` (dados/fábrica) e a documentação. **Os 100 m não
  foram tocados** (seguem com `recordTime 9.58` e o default de escala 0,05).
  Nenhuma outra mecânica alterada.
- **Processo/verificação**: feito **de 2 em 2**, verificando cada par (Força 100 →
  recorde; monotonicidade Força↑→tempo↓; ranking correto; tempos plausíveis). O
  100 m segue idêntico (Força 80 → 10,58 s); provas não-tempo (salto, lançamento)
  seguem **não** disputáveis; o CNA resolve normalmente; sem erros de JS.

### Etapa 48 — TimeResultSystem (resolução genérica por tempo)

- Criado o **`TimeResultSystem`** (`timeResultSystem.js`): um sistema **genérico**
  que resolve **qualquer** prova medida por **tempo**. O modelo de resultado que
  antes estava embutido nos 100 m (em `events.js`) foi **extraído e generalizado**
  para cá.
- **Diferenças por evento, lógica no sistema**: o que varia de prova para prova
  vem dos **parâmetros do evento** (`event.time`, ex.: `recordTime`); o que é comum
  tem **defaults** no sistema (`secondsPerStrengthPoint 0.05`, penalidades de
  fadiga `0.3` e forma `0.15`). Tornar uma prova de tempo disputável é só declarar
  `resultSystem: "TimeResultSystem"` + `time: { recordTime }` no evento — **sem
  tocar em código** —, o que também facilita inserir **novos esportes** de tempo.
- **Despacho por registro** (`events.js`): `EVENT_RESULT_SYSTEMS` mapeia o
  `resultSystem` do evento para o módulo; `resolveEvent`/`computeEventResult`/
  `formatEventResult` viraram **despachantes** (delegam ao sistema do evento).
  Plugar um sistema novo (Distância, Altura, Pontos, Match, Judge, Score, Weight,
  Combined) = criar o módulo e registrá-lo. `isEventPlayable(event)` diz se a prova
  já é disputável.
- **Comportamento preservado**: o `EVT-ATL-100M` passou a usar o sistema com
  `time: { recordTime: 9.58 }` (o resto por default) → os tempos são **idênticos**
  aos de antes. **Nenhuma outra mecânica foi tocada** (participação, fadiga, ritmo,
  rankings, UI seguem iguais; `participation`/`script` chamam as mesmas funções).
- **Verificado** (Node + navegador headless): 100 m dá os mesmos tempos (Força 80
  descansado 10,58 s; Força 100 9,58 s; Força 80/fatigue 60 11,18 s); um evento de
  tempo **sintético** com parâmetros próprios (recorde 100 s, escala 0,4) resolve e
  ranqueia certo (Força 90 → 104,00 s), provando a genericidade; `isEventPlayable`
  = true para os 100 m e false para uma prova sem parâmetros; o CNA segue
  resolvendo (ex.: 9,85 s) com rankings; sem erros de JS.

### Etapa 47 — Atributos dos esportes na aba Esportes

- Completando a Etapa 46, o **esporte** passou a mostrar seus **atributos** ao
  abrir (antes só o nome), no mesmo padrão de modalidades/eventos: **ID**,
  **Descrição**, **Popularidade** (0–100), **Início da prática** (negativo → "N
  a.C."), **País de origem**, **ResultSystems** (lista) e **nº de Modalidades**
  (derivado). As modalidades continuam listadas logo abaixo.
- **Derivado das databases**: os atributos vêm do próprio esporte + a contagem de
  modalidades (`getModalitiesBySport`), então segue reativo. Helper novo:
  `formatPracticeStartYear`.
- **Só UI**: apenas `script.js` (o `renderSports` monta o bloco `.sport-attrs` do
  esporte, reusando o estilo já existente — sem CSS novo). Nenhuma
  entidade/mecânica foi tocada.
- **Verificado** (navegador headless): Atletismo mostra os 7 atributos corretos
  (popularidade 85/100, "776 a.C.", os 4 ResultSystems, 10 modalidades) e as
  modalidades seguem listadas abaixo; sem erros de JS. Screenshot enviado.

### Etapa 46 — Atributos de modalidades e eventos na aba Esportes

- A aba **Esportes** passou a mostrar os **atributos** das modalidades e dos
  eventos (antes eram só nomes):
  - **Modalidade** (ao abrir): **ID**, **Esporte** e **nº de Eventos**.
  - **Evento** (agora também um `<details>`): **ID**, **Modalidade**, **Esporte**,
    **Modelo de resultado** (ex.: "Tempo · menor vence"; "— (pendente)" onde ainda
    não há modelo) e **Popularidade** (ou "—").
- **Derivado das databases** (segue reativo): os atributos vêm dos próprios
  objetos + relações (`getEventsByModality`, o esporte da modalidade), então novos
  dados aparecem com os atributos certos sem lista fixa. Helpers novos em
  `script.js`: `renderModalityDetails`, `renderEventDetails`, `attrList`,
  `metricLabelPtBr`, `orderLabelPtBr`, `formatEventResolution`.
- **Só UI**: `script.js` (render + helpers) e `styles.css` (o evento virou um
  `<details>` reutilizando o padrão dos demais; nova lista `.sport-attrs`).
  Nenhuma entidade/mecânica foi tocada. O esporte segue **só com o nome** (a
  pedido — os atributos pedidos eram de modalidades e eventos).
- **Verificado** (navegador headless): a modalidade Velocidade mostra ID/Esporte/
  Eventos (3); o evento 100 m mostra "Tempo · menor vence" e "95/100"; o 200 m
  (sem modelo) mostra "— (pendente)" e "—"; sem erros de JS. Screenshot enviado.

### Etapa 45 — Database de eventos (calendário olímpico)

- `events.js` deixou de ter só os 100 m e passou a cobrir o **calendário olímpico**:
  **~190 eventos**, um conjunto por **cada uma das 72 modalidades** (usando a
  database de modalidades já existente). Ex.: Velocidade → 100/200/400 m; Saltos →
  distância/triplo/altura/vara; Natação → provas de piscina + revezamentos;
  Judô/Boxe/Lutas/Levantamento/Taekwondo → categorias de peso; coletivos →
  "Torneio …".
- **Só estrutura por ora**: os novos eventos guardam `id/name/modalityId`. O
  **modelo de resultado** (`resolution`/`performance`) continua **só nos 100 m**
  (`EVT-ATL-100M`, intacto) — os demais recebem o modelo quando a **mecânica de
  ResultSystem** existir (`TODO.md`, prioridade alta). Como nenhum campeonato
  disputa esses eventos, eles **não são resolvidos** — só compõem a hierarquia.
- **Escopo**: só `events.js` (dados) e a documentação. Nenhuma função/mecânica foi
  tocada; o CNA segue disputando os 100 m normalmente.
- **Verificado** (Node + navegador headless): 190 eventos; **todo** `modalityId`
  existe; **toda** modalidade tem ≥1 evento; ids únicos e campos presentes; os
  100 m mantêm o modelo e o campeonato resolve (ex.: 10,1 s), com rankings de
  pontos/marcas populando; a aba Esportes mostra os eventos sob cada modalidade
  (Velocidade → 100/200/400 m); sem erros de JS.

### Etapa 44 — Aba Esportes (UI da hierarquia Esporte → Modalidade → Evento)

- Nova aba **Esportes** (6ª aba), que mostra **organizadamente** a hierarquia
  **Esporte → Modalidade → Evento**, só por nome:
  - os **esportes** aparecem em **ordem alfabética**, cada um como um `<details>`;
  - ao abrir um esporte, suas **modalidades** (também em `<details>`, alfabéticas);
  - ao abrir uma modalidade, seus **eventos** (lista, alfabética).
- **Reativa a novos dados**: `renderSports` lê **sempre** das databases vivas
  (`getAllSports` / `getModalitiesBySport` / `getEventsByModality`) — não há lista
  fixa na tela, então **qualquer esporte/modalidade/evento novo** adicionado às
  databases **aparece sozinho** (verificado injetando um esporte de teste e
  re-renderizando: entra na posição alfabética certa, com sua modalidade e evento).
- **Só UI** (a pedido): `index.html` (botão da aba + painel), `script.js`
  (`renderSports` + `byNamePtBr` + registro da aba na estrutura `TABS`) e
  `styles.css` (estilos, **reutilizando** o padrão de `<details>` de Atletas/Clubes
  para os cards + estilos do aninhamento modalidade/evento). **Nenhuma estrutura de
  dados/mecânica foi tocada.**
- **Verificado** (navegador headless): a aba abre; 36 esportes em ordem alfabética
  (Atletismo … Vôlei); Atletismo com as 10 modalidades (alfabéticas) e Velocidade
  com o evento "100 metros rasos"; reconhecimento automático de dados novos; sem
  erros de JS.

### Etapa 43 — Hierarquia Esporte → Modalidade → Evento

- Estabelecida a hierarquia **Esporte → Modalidade → Evento**. Antes o que
  `modalities.js` chamava de "modalidade" (os 100 m, com resolução/modelo) era, na
  verdade, uma **prova resolvível** — agora corretamente classificada como
  **evento**. Entre o esporte e o evento entra a **modalidade** (agrupamento).
- **`modalities.js` reconstruído** como o **agrupamento**: **72 modalidades**
  (a lista olímpica por esporte, a partir da tabela pedida), cada uma com
  `{ id, name, sportId }`. Ex.: Atletismo → Velocidade, Meio-fundo, Fundo,
  Barreiras, Obstáculos, Revezamentos, Saltos, Arremessos/Lançamentos, Marcha
  Atlética, Provas Combinadas. Helpers `getModality`, `getModalitiesBySport`,
  `getModalitySport`.
- **Novo `events.js`** (nível resolvível): o **modelo de resultado** (resolution +
  performance + funções) migrou para cá. O antigo `MOD-ATL-100M` virou
  **`EVT-ATL-100M`** (evento "100 metros rasos", `modalityId`
  `MOD-ATL-VELOCIDADE`). Helpers `getEvent`, `getEventsByModality`,
  `getEventsBySport`, `getEventModality`, e o modelo `effectiveStrengthForEvent`/
  `computeEventResult`/`formatEventResult`/`resolveEvent`.
- **Plumbing atualizado, comportamento preservado**: o campeonato passou a usar o
  campo **`events`** (o `CNA-2026` = `["EVT-ATL-100M"]`; removido o antigo
  `modalities`); o gerador recebe `eventId`; `participation.getStageEvent` +
  `resolveEvent`; o **ranking de marcas** passou a ser **por evento** (`eventId`);
  a UI (`renderStageResults`, `renderMarksRanking`) e o card do campeonato
  (linha **Provas**) apontam para eventos. **Nenhuma mecânica não relacionada foi
  tocada** (fadiga, ritmo, pontos, contratos, elegibilidade, calendário intactos).
- **Sem UI de modalidades/eventos** ainda (a pedido) — registrada no `TODO.md`.
- **Verificado** (navegador headless, tempo avançado por várias etapas): 72
  modalidades; Atletismo com as 10 corretas; 100 m resolve para o evento
  `EVT-ATL-100M` → modalidade Velocidade → esporte Atletismo; a etapa resolve o
  resultado (ex.: 9,94 s), os rankings de **marcas** (melhor 9,85) e de **pontos**
  seguem populando; **sem erros de JS**. Screenshot do Atletismo gerado como
  exemplo (Esporte → Modalidade → Evento).

### Etapa 42 — Esportes olímpicos + campo `resultSystems` (indicador)

- `sports.js` passou de **6 para 36 esportes** — a lista olímpica pedida —, cada um
  com um novo campo **`resultSystems`**: a lista dos "ResultSystem" do esporte
  (ex.: Atletismo → `TimeResultSystem`, `DistanceResultSystem`,
  `HeightResultSystem`, `CombinedResultSystem`; a maioria dos coletivos →
  `MatchResultSystem`), exatamente conforme a **tabela** fornecida.
- **`resultSystems` é só um INDICADOR (rótulo)** — **não** há nenhuma mecânica
  ligada a ele ainda. A **criação da mecânica de ResultSystem** foi registrada no
  `TODO.md` como **prioridade alta**.
- **Baseados na estrutura existente**: cada esporte usa os mesmos campos dos 6
  anteriores (`id`, `name`, `description`, `generalPopularity`,
  `practiceStartYear`, `originCountry`) + `resultSystems`. Os 6 que já existiam
  (Atletismo, Natação, Futebol, Basquete, Vôlei, Ginástica) só **ganharam o
  campo**; os 30 novos foram criados. Dados (popularidade, ano, origem) são
  **aproximações**.
- **Escopo**: só a **criação/dados de esportes** em `sports.js` (mais a nota no
  cabeçalho) e a documentação. **Nenhuma função foi alterada** (`getSport`/
  `getAllSports` intactos); nenhuma outra entidade foi tocada.
- **Processo**: criados **em lotes de 5**, verificando cada lote (`node --check` +
  conferência dos `resultSystems` contra a tabela) antes do próximo.
- **Verificado**: 36 esportes, `resultSystems` de **todos** batendo com a tabela,
  campos obrigatórios presentes, popularidade 0–100, ids únicos; carga real em
  navegador headless com os 36 esportes e sem erros de JS (esporte favorito dos
  atletas segue Atletismo).

### Etapa 41 — País Argentina (só o país + atributos básicos)

- Criado o **2º país**: **Argentina** (`ARG`) em `countries.js`, com os **mesmos
  atributos** do Brasil (`id`, `name`, `iocCode`, `population`, `olympicStrength`)
  — reutilizando a estrutura existente, **sem** alterá-la.
- Valores: população 45.808.747; **força olímpica 70** (um pouco abaixo do Brasil,
  aproximação de balanceamento — ver `DECISOES.md`); COI `ARG`.
- **Só o país por ora**: **sem cidades, clubes ou atletas** ainda (ficam para
  depois — ver `TODO.md`). A geração de atletas continua só no Brasil; nada mais
  foi tocado.
- **Verificado** (navegador headless): 2 países carregados; a Argentina aparece
  nos seletores de país das abas Atletas e Clubes; selecioná-la renderiza listas
  **vazias sem erro** (`getClubsByCountry("ARG")` = 0, `getCitiesByCountry("ARG")`
  = 0); os 100 atletas seguem do Brasil; sem erros de JS.

### Etapa 40 — Clubes para todas as cidades (2 por cidade sem clube)

- Cada uma das **6 cidades que ainda não tinha clube** (Brasília, Salvador,
  Fortaleza, Manaus, Curitiba, Recife) recebeu **2 clubes reais**, com os
  **mesmos parâmetros** dos clubes anteriores (campos idênticos; `president`/
  `finances` nulos, `rivals` vazio; infraestrutura próxima à da cidade-sede,
  considerando a força olímpica do país; prestígio na mesma faixa). **12 clubes
  novos** → `CLUBS` passou de 10 para **22**, todos do Brasil.
- **Consequência**: **toda cidade da database passa a ter clube**, então a
  **afinidade de cidade** na contratação de teste (Etapa 39) passa a valer para
  **todas** as cidades — antes, atletas nascidos nessas 6 cidades caíam no sorteio
  só por infraestrutura (0% mesma cidade).
- **Escopo**: só `clubs.js` (novas entradas + nota no cabeçalho) e a documentação.
  Nenhuma estrutura foi alterada — só novas entidades dentro da estrutura vigente.
- **Verificado**: 22 clubes com **estrutura/parâmetros corretos** (campos, faixas
  de infra 68–90 e prestígio 60–92, `cityId` válido); cada cidade antes vazia com
  **exatamente 2**; contratação de teste passa a assinar **~43–46%** na mesma
  cidade para essas cidades (era 0%), com **agentes livres ~25%** preservados;
  carga real (100 atletas) em navegador headless sem erros de JS.

### Etapa 39 — Afinidade de cidade na distribuição inicial de regens

- A distribuição inicial dos atletas entre os clubes (seed de teste) passou a
  considerar, além da infraestrutura, a **afinidade com a cidade-sede**: um atleta
  tem chance **bem maior** de assinar com um clube da **sua cidade de nascimento**.
- **Lógica** (em `contracts.js`): o peso de cada clube no sorteio virou
  `clubSeedWeight(club, athlete)` = `infrastructureLevel` **×**
  `TEST_SAME_CITY_AFFINITY` (8) quando `club.cityId === athlete.birthCityId`
  (senão só a infraestrutura). O sorteio ponderado passou a receber o atleta
  (`pickClubForAthlete(clubs, athlete)`, antes `pickClubByInfrastructure`).
- **Não impede a agência livre**: a fração de agentes livres
  (`TEST_FREE_AGENT_RATE`) é decidida **antes** e **independe** do clube — a
  afinidade só muda **qual** clube, nunca **se** o atleta assina. É um **peso**
  (não uma regra fixa): clubes de outras cidades continuam possíveis, e atletas de
  cidades **sem clube** caem no sorteio por infraestrutura.
- **Escopo**: só `contracts.js` (peso/ helper + a chamada) e a documentação.
  Entidades Atleta/Clube intactas; continua sendo dado de **teste**.
- **Verificado**: nascido em SP (3 clubes locais) assina ~77% das vezes com um
  clube de SP; RJ (4 clubes) ~83%; BH (1 clube) ~50%; nascido em cidade **sem
  clube** (Salvador) → 0% mesma cidade, distribuído por infraestrutura; a fração
  de agentes livres fica ~25% em **todos** os casos (afinidade não a altera);
  carga real (100 atletas) em navegador headless sem erros de JS (~32% mesma
  cidade no geral, pois 6 das 10 cidades não têm clube).

### Etapa 38 — Distribuição inicial de regens ponderada pela infraestrutura

- **Distribuição inicial** dos atletas entre os clubes (no seed de teste de
  contratos) passou a **ponderar pelo nível de infraestrutura** do clube: quanto
  **maior** o `infrastructureLevel`, **mais** atletas o clube recebe; quanto
  **menor**, **menos**. Antes o clube era sorteado de forma **uniforme**.
- **Lógica** (em `contracts.js`): novo helper `pickClubByInfrastructure(clubs)`
  faz um **sorteio ponderado** pelo `infrastructureLevel` (mesmo estilo de
  `randomBirthCityId` em `athletes.js`: soma dos pesos + varredura). A chance de
  um clube receber o atleta é **proporcional à sua infraestrutura** — infra 90
  vs. 68 dá ~1,3× mais atletas. Cai para sorteio **uniforme** se a soma dos pesos
  for 0 (todas as infra zeradas). `seedTestContracts` usa o helper no lugar do
  sorteio uniforme; a fração de agentes livres (`TEST_FREE_AGENT_RATE`, 25%) e a
  duração anual sorteada seguem iguais.
- **Escopo**: só `contracts.js` (helper novo + a chamada) e a documentação. As
  entidades Atleta/Clube **não** foram tocadas; continua sendo dado de **teste**.
- **Verificado**: amostra grande (100 mil atletas) confere as fatias observadas
  com as esperadas (`infra ÷ Σinfra`) e a distribuição é **monotônica** (infra
  maior → mais atletas: Pinheiros 90 → ~11,4% > Paulistano 68 → ~8,6%); a fração
  de agentes livres fica ~25%; carga real (100 atletas) em navegador headless sem
  erros de JS, com o clube de maior infraestrutura à frente.

### Etapa 37 — Ranking de Marcas (melhor marca da temporada)

- **Motor** (`marksRanking.js`, novo, separado da UI): por **modalidade**, guarda
  a **melhor marca** de cada atleta na temporada (via `isBetterResult`, respeitando
  a ordem da modalidade) e monta o ranking. **Template genérico** — serve qualquer
  modalidade; implementado/exibido para os **100 m**.
- **Registro por etapa**: `processStage` chama `recordStageMarks` (guarda também
  data, campeonato e etapa de cada melhor marca).
- **UI** (mesma aba Rankings): ao abrir, o jogador vê **só o seletor** para
  escolher **Pontos** ou **Marcas**. O ranking de marcas mostra **posição, atleta,
  clube, data (clicável) e marca**; clicar na data revela **data + campeonato +
  etapa** em que a marca foi alcançada. `renderRanking` virou um **dispatcher**
  (`renderPointsRanking` / `renderMarksRanking(modalityId)`).
- **Temporada/histórico**: na virada de ano, as marcas são arquivadas
  (`MARKS_HISTORY`) e zeradas — salvas para uso posterior (ver `TODO.md`).
- **Verificado** (navegador headless): melhor marca por atleta (1 entrada cada),
  ordenado do melhor para o pior (menor tempo primeiro), empate na marca
  compartilha posição; ao abrir a aba só aparece o seletor; a tabela de marcas tem
  as colunas certas e o clique na data mostra "…em dd/mm/aaaa — Campeonato X,
  Etapa N"; virada de ano arquiva as marcas e zera; sem erros de JS.

### Etapa 36 — Sistema de Ranking + aba Rankings

- **Motor de cálculo** (`ranking.js`, novo), **separado da UI**: acumula **pontos
  por atleta** na temporada conforme a **tier** do campeonato (maiores valem mais).
  Distribuição por posição é um **placeholder harmônico** (`base / posição`).
- **Atualização por etapa**: `processStage` chama `recordStageForRanking` ao
  resolver cada etapa — o ranking reflete cada etapa assim que ela ocorre.
- **Temporada e histórico**: na virada de ano (`processDay`), o ranking é
  **arquivado** (`RANKING_HISTORY`) e zerado. O histórico é **salvo para uso
  posterior** (decisão registrada no `TODO.md`; ainda não consumido).
- **Nova aba Rankings** (UI, `renderRanking` em `script.js`): tabela com
  **posição, atleta, clube, etapas disputadas na temporada e pontos**. A UI só
  **lê** `getSeasonRanking()` — nenhum cálculo na tela.
- **Verificado** (navegador headless): pontos escalam por tier (Nacional 300 >
  Estadual 40 > Regional 20 no 1º lugar), o ranking acumula e é monotônico
  (posição pior → menos pontos), a aba mostra as 5 colunas; ao cruzar a virada de
  ano, a temporada é arquivada (campeão de 2026 salvo no histórico) e a nova
  temporada zera; sem erros de JS.

### Etapa 35 — Mais travas de inscrição (idade e cota por clube) + UI de Regras

- **Trava de idade** (`ageRestriction { minAge, maxAge }`): mecanismo criado em
  `eligibility.js` (`isAthleteAgeEligible`) e ligado a
  `isAthleteEligibleForChampionship`. **Nenhum campeonato usa ainda** — é para os
  futuros **juvenis/sub** (registrado no `TODO.md`).
- **Trava de cota por clube** (`clubQuota`): cada clube inscreve no máximo N
  atletas **por etapa**. Aplicada ao **CNA = 1**; os demais campeonatos ficam sem
  cota. Implementada em `participation.js` (`limitAthletesPerClub`), com
  **placeholder** de seleção pelos mais fortes (seleção real é pendente).
- **Genérico**: ambas são campos do campeonato + helpers
  (`getChampionshipAgeRestriction`, `getChampionshipClubQuota`) — **qualquer
  campeonato futuro** pode declará-las.
- **UI**: novo card **"Regras de Inscrição"** na aba Campeonatos, com
  **Abrangência**, **Faixa etária** e **Limite por clube** (helpers
  `formatAgeRestriction`, `formatClubQuota`). A "Abrangência" saiu do card
  Campeonato para este.
- **Verificado** (navegador headless): CNA com **1 atleta por clube por etapa**
  (10 participantes = 10 clubes × 1); estadual segue sem cota (até 3/clube);
  trava de idade correta (Sub-20 barra 25 anos, aceita 15); o card "Regras de
  Inscrição" aparece com os textos certos por campeonato; sem erros de JS.

### Etapa 34 — Calendário do Brasil populado + travas de inscrição

- **Calendário populado** a partir da geografia: além do Nacional (`CNA-2026`),
  passaram a existir **10 Estaduais** (um por estado com cidade na database) e
  **5 Regionais** (um por região com cidade) — **16 campeonatos** no total.
- **Gerador genérico** `buildCountryGeographicChampionships(config)` em
  `championships.js`: cria Estaduais/Regionais de um país **só para lugares com
  cidade na database** (não cria para estado/região ausente). Serve qualquer
  país; chamado para o **Brasil**. Etapas em sábados distintos por nível
  (estadual 1º, nacional 2º, regional 3º) para não colidir no calendário.
- **Campo `scope`** `{ level, placeId }` no campeonato + helper
  `getChampionshipScope`. É a **abrangência**: país/região/estado/cidade.
- **Travas de inscrição** (`eligibility.js`, novo): só disputa quem é **elegível**
  ao `scope`, pela **cidade de nascimento** (país → região → estado → cidade).
  Ligado à participação: participantes = **contratados via clube ∩ elegíveis**.
- **UI** (aba Campeonatos): o detalhe do campeonato ganhou **Categoria**,
  **Abrangência** (o lugar da trava) e **Atletas elegíveis**; o seletor lista os
  16 campeonatos.
- **Verificado** (navegador headless): 16 campeonatos (1 Nacional, 10 Estaduais,
  5 Regionais); elegíveis do CNA = todos os 100, do Estadual de SP = só nascidos
  em SP, do Regional Sudeste = só da região; participantes de uma etapa estadual
  = elegíveis ∩ contratados; seletor com 16 opções e detalhe correto; sem erros
  de JS.

### Etapa 33 — 100 atletas por simulação

- Aumentado o número de atletas gerados no início de **10 → 100**
  (`ATHLETE_GENERATION_CONFIG.count` em `athletes.js`), para sustentar um
  **calendário maior** de competições.
- **Distribuição** entre clubes e agentes livres continua pelo seed de teste
  (`seedTestContracts`): cada atleta assina um clube aleatório do seu país e
  ~25% ficam **agentes livres** — sem mudanças na lógica, só mais atletas.
- **Verificado** (navegador headless): 100 atletas gerados, ~71 contratados
  espalhados por **todos os 10 clubes** e ~29 agentes livres; sem erros de JS.
- Continua sendo **número de teste** (ver `TODO.md`).

### Etapa 32 — UI de regiões e estados

- A hierarquia geográfica passou a **aparecer para o jogador**, junto da cidade:
  - **Atletas** (expandir): a linha **"Local de nascimento"** agora mostra
    `Cidade — SIGLA · Região` (ex.: `São Paulo — SP · Sudeste`).
  - **Clubes**: o **resumo** ganhou a sigla do estado (`São Paulo (SP), BRA`) e o
    **detalhe** ganhou as linhas **"Estado"** (nome + sigla) e **"Região"**.
- Novo helper `formatCityLocation(city)` em `script.js` (usa `getCityState` /
  `getCityRegion`); tolerante a dados faltando (cai para o nome da cidade / `—`).
- **Escopo**: só `script.js` (nenhuma mudança de dados; sem CSS novo, reusa o
  padrão de `<li><span>…</span><strong>…</strong></li>`).
- **Verificado** (navegador headless): aba Atletas mostra
  `São Paulo — SP · Sudeste`; aba Clubes mostra o resumo com sigla e as linhas
  Estado/Região corretas; sem erros de JS.

### Etapa 31 — Estrutura de regiões e estados (hierarquia geográfica)

- Criadas as entidades **Regiões** (`regions.js`) e **Estados** (`states.js`),
  formando a hierarquia **país → região → estado → cidade**. Base dos portes
  **Regional** e **Estadual** do calendário (ver `CALENDARIO_DE_COMPETICOES.md`).
- **Regiões**: as 5 do Brasil (Norte, Nordeste, Centro-Oeste, Sudeste, Sul),
  cada uma ligada ao país (`countryId`).
- **Estados**: os 10 das cidades já cadastradas (SP, RJ, MG, BA, CE, PE, DF, AM,
  PR, RS), cada um com `abbreviation`, `countryId` e `regionId`. Não é o conjunto
  completo (27 UFs) — ampliar depois (`TODO.md`).
- **Cidades ↔ estado**: novo campo **`stateId`** em cada cidade (`cities.js`);
  país e região passam a ser **deriváveis** via estado. Helpers `getCityState` e
  `getCityRegion`. `countryId` foi **mantido** na cidade (compatibilidade com
  `getCitiesByCountry`, usado na geração de atletas).
- **Escopo**: só entidades/dados e carga (`regions.js`, `states.js` novos;
  `cities.js` com `stateId`; `index.html`) e documentação. **Sem UI ainda** — a
  tela vem na etapa seguinte.
- **Verificado** (navegador headless): 5 regiões, 10 estados, mapeamento
  estado→região correto e a hierarquia cidade→estado→região→país resolvendo
  (ex.: São Paulo → SP → Sudeste → BRA); sem erros de JS.

### Etapa 30 — Calendário de competições (categorias/tiers)

- Criada a entidade **Categorias de Competição** (`competitionCategories.js`):
  **9 níveis** (Regional → Olímpico), cada um com `level`, `scope`, `prestige` e
  `rankingPoints`. É a estrutura que organizará o **calendário** e permitirá ao
  clube **escolher** em qual competição inscrever cada tipo de atleta (ritmo,
  ranking, índices) — a **inscrição real** ainda é futura (ver `TODO.md`).
- **Genérico para todos os países**: as categorias são uma database **global**;
  o `scope` (subnacional/nacional/internacional) diz a quem cada competição
  pertence. Adicionar países **não** recria o calendário.
- **Campeonato ↔ categoria**: novo campo **`categoryId`** em `championships.js`;
  o `CNA-2026` foi classificado como **Nacional** (`CAT-NACIONAL`). Helper
  `getChampionshipCategory`.
- **Premiação (dinheiro)** ficou **fora do código** de propósito — só referência
  (`$`… por categoria) para o **sistema financeiro** futuro (`TODO.md`).
- **Pesos de etapa e final** (etapas valendo pontos rumo a uma final na última
  etapa) registrados no `TODO.md`.
- Novo documento **`CALENDARIO_DE_COMPETICOES.md`** com o desenho detalhado
  (motivação, categorias, scope, ranking, premiação, etapas/final e roteiro).
- **Escopo**: só `competitionCategories.js` (novo), `championships.js`
  (categoryId + helper), `index.html` (script) e a documentação. Nenhuma outra
  entidade foi tocada.
- **Verificado** (navegador headless): as 9 categorias carregam com
  prestígio/ranking corretos, `getChampionshipCategory(CNA-2026)` = Nacional,
  filtros por scope e por level corretos; sem erros de JS.

### Etapa 29 — Ritmo na UI de Atletas

- O atributo **`ritmo`** passou a aparecer ao expandir o atleta (aba Atletas),
  como a linha **"Ritmo N/100"** (arredondado), junto de Força, Cansaço, etc.
- Única mudança foi em `script.js` (`renderAthletes`); a mecânica do ritmo já
  existia. **Verificado** em navegador headless (linha presente, sem erros).

### Etapa 28 — Atributo Ritmo (forma) e seu efeito nos resultados

- Novo atributo **`ritmo`** (0–100) no atleta: **forma/afiação de temporada**.
  Começa **baixo** no início do ano, **sobe** ao competir e **cai** parado.
- **Três parâmetros dependem da Preparação Física** (constantes em `athletes.js`):
  inicial (`initialRitmo`, 5–20), ganho por prova (`ritmoGainPctForRace`, 15–35%
  do gap até 100) e queda por dia parado (`ritmoDropPctForRestDay`, 2%–0,5% do
  ritmo). Mais preparo → entra em forma mais fácil e a perde mais devagar.
- **Efeito na resolução** (`modalities.js`): a Força efetiva passou a descontar
  também um **redutor de forma** = `(100 − ritmo) × formPenaltyPerPoint` (0,15),
  **somado** ao redutor de fadiga. **Nenhuma variável anterior foi removida** —
  Força e fadiga continuam; o ritmo apenas se soma.
- **Ciclo** (`participation.js`, `processDay`): quem compete ganha ritmo; quem
  descansa perde; na virada de ano o ritmo reinicia (nova temporada).
- **UI**: o Ritmo é exibido na aba **Atletas**, ao expandir o atleta (linha
  **"Ritmo N/100"**, arredondado), ao lado dos demais atributos (Etapa 29).
- **Verificado** (navegador headless): ritmo inicial baixo e proporcional ao
  preparo (5–20); fora de forma corre mais lento (11,74 s vs 11,13 s em forma
  plena); sobe ao competir (18→44) e cai parado (44→41); reinicia na virada de ano
  (80→18); Força e fadiga seguem na conta; a UI exibe o valor; sem erros de JS.

### Etapa 27 — Cansaço com recuperação em dias de descanso

- **Reformulação do Cansaço**: além de cair ao competir, o `fatigue` agora
  **recupera** nos dias em que o atleta **não** compete, subindo rumo a 100.
- **Fórmula** (`fatigueRecoveryForRestDay`, em `athletes.js`): recuperação **por
  dia** = `base(2) + preparo(até +2) − idade(até −1,5)`, clamp `[0.5, 10]`.
  Espelha o desgaste com sinais trocados (preparo acelera, idade desacelera);
  o porquê está detalhado no comentário do arquivo e no `DECISOES.md`.
- **Por dia × por evento**: o desgaste é por etapa (esforço pontual); a
  recuperação é por dia (contínua). Por isso a passagem de tempo passou a ser
  **dia a dia** (`advanceDays` → `processDay`): cada dia resolve as etapas do dia
  (desgaste dos participantes) e faz os demais **descansarem**.
- **Precisão**: `fatigue` virou número **real** (sem arredondar internamente),
  para o acúmulo diário não derivar; a UI exibe arredondado.
- **Consequência de balanceamento**: como as etapas são **mensais**, os atletas
  tendem a **recuperar totalmente** entre elas (realista); o cansaço só se
  **acumula** com agenda congestionada. Constantes fáceis de recalibrar.
- **Verificado** (navegador headless): no dia da etapa o participante fica
  desgastado (<100) e recupera nos dias seguintes; nunca passa de 100; agente
  livre (nunca compete) permanece em 100; resultados continuam resolvendo; UI
  mostra o Cansaço arredondado. Sem erros de JS.

### Etapa 26 — Resultados das etapas (resolução + UI)

- **Modalidade do campeonato**: o `CNA-2026` passou a listar a prova disputada em
  `modalities` (`MOD-ATL-100M`). `getStageModality` escolhe a prova da etapa.
- **Resolução do resultado** (`participation.js`): ao realizar uma etapa,
  `processStage` resolve o ranking dos participantes (`resolveModality`) com a
  **fadiga de então** e **trava** o resultado (`_stageResults`), antes de aplicar
  a fadiga daquela etapa. Um resultado é **histórico** — não muda depois.
- **Ordem correta**: `processRealizedStages` processa as etapas **em ordem**, então
  cada etapa usa a fadiga acumulada das anteriores; as seguintes tendem a ficar
  mais lentas.
- **UI** (aba Campeonatos): a tabela de etapas ganhou a coluna **Resultados** com
  o link **"Ver"** nas etapas realizadas; ao clicar, `renderStageResults` mostra a
  **classificação** (posição, atleta, resultado — ex.: `9.73 s`), com empates
  compartilhando posição.
- **Verificado** (navegador headless): etapa realizada tem "Ver"; a classificação
  sai ordenada por tempo, empates dividem a posição (10.03 s → 3º e 3º), nº de
  resultados = nº de participantes; etapa futura não tem "Ver"; sem erros de JS.

### Etapa 25 — Campeonato ↔ esporte e Participação atleta ↔ etapa

- **Campeonato ↔ esporte**: novo campo **`sportId`** na entidade Campeonato
  (`championships.js`); o `CNA-2026` foi vinculado ao **Atletismo**
  (`SPT-ATLETISMO`). Helper `getChampionshipSport`. Todo novo campeonato informa
  o seu esporte.
- **Participação atleta ↔ etapa** (`participation.js`): define quais atletas
  disputam cada etapa. **Regra de TESTE**: cada clube inscreve todos os seus
  atletas em todas as etapas → participantes = atletas com contrato ativo (na
  data da etapa) em clubes do país; **agentes livres não disputam**.
- **Fadiga aplicada de fato**: `applyParticipationFatigue` desgasta os
  participantes de cada etapa **realizada**, **uma vez** por etapa (controle
  `_fatiguedStages`), ligado à passagem de tempo em `advanceDays`. Fecha o ciclo
  Cansaço → tempo: participantes ficam mais lentos nos 100 m.
- **Escopo**: mexi só no que é dos itens — `championships.js` (sportId),
  `participation.js` (novo), `index.html` (script) e `script.js` (chamada em
  advanceDays/init) e a documentação.
- **Prioridade média** registrada no `TODO.md`: criar a mecânica **real** de
  cadastro de atletas em campeonatos (hoje é só a regra de teste "todos").
- **Verificado** (navegador headless): esporte do campeonato = Atletismo;
  participantes da etapa 1 batem com os contratados (agentes livres de fora);
  fadiga cai ao realizar a etapa e **não reaplica** nos dias seguintes; o
  participante fica mais lento nos 100 m; sem erros de JS.

### Etapa 24 — UI dos contratos (parte 2): duração, agentes livres e reatividade

- **Duração do contrato no elenco**: em "Atletas do clube", cada atleta passou a
  mostrar, ao lado do nome, os dados do contrato — **duração** ("1 ano"/"N anos"),
  **término** ("até dd/mm/aaaa") e a marca **"renovado"** quando `renewalOf` está
  preenchido (`renderClubAthletes` + `contractDurationText`).
- **Agentes livres**: nova seção na aba Clubes (abaixo dos clubes) listando os
  atletas do país **sem contrato ativo** (`renderFreeAgents` + `getFreeAgents`),
  com nomes clicáveis que levam ao perfil.
- **Reatividade à passagem de tempo**: `advanceDays` passou a reavaliar as abas
  Clubes e Atletas (`refreshClubView`/`refreshAthleteView`), pois a situação dos
  contratos é relativa à data atual — ao expirar/entrar em vigor, elenco, agentes
  livres e "Clube atual" se atualizam sozinhos.
- **Seed de teste ajustado**: `seedTestContracts` passou a deixar uma fração dos
  atletas como agente livre (`TEST_FREE_AGENT_RATE = 0.25`) para as telas terem
  tanto contratados quanto agentes livres. Continua sendo dado de TESTE.
- **Verificado** (navegador headless): elenco mostra nome + duração/término;
  agentes livres conferem com os dados e o clique abre o perfil ("Agente livre");
  ao avançar além do término de um contrato, ele expira e as listas se atualizam
  (3 → 5 agentes livres); sem erros de JS.

### Etapa 23 — UI dos contratos: atletas do clube e clube do atleta

- **Aba Clubes**: dentro do `<details>` de cada clube, um link **"Atletas do
  clube"** (`toggleClubAthletes`) revela os **atletas contratados** (contratos
  ativos na data atual). Cada nome é **clicável** (`renderClubAthletes`) e leva
  ao **perfil do atleta**.
- **Perfil do atleta**: não há tela separada — reaproveitei a aba Atletas.
  `goToAthlete` troca para a aba, seleciona o país do atleta e **abre/rola** até
  o cartão dele (destaque `athlete--highlight`), no mesmo espírito de `goToEvent`.
- **Aba Atletas**: nova linha **"Clube atual"** no cartão, derivada do contrato
  ativo (`getAthleteClub`); sem contrato, mostra **"Agente livre"**.
- **Dados**: como `CONTRACTS` nasce vazia, adicionei `seedTestContracts` (em
  `contracts.js`), chamado no início (`script.js`), que assina cada atleta a um
  clube aleatório do país — **vínculo de TESTE**, a ser trocado pelo fluxo real.
- **Escopo respeitado**: mexi só no que é do item — `script.js` (UI), `styles.css`
  (estilos dos novos elementos), `contracts.js` (seeding de teste) e a
  documentação. Entidades Atleta/Clube **não** foram alteradas.
- **Verificado** (navegador headless): abrir clube → "Atletas do clube" lista os
  nomes → clicar cai no perfil com o "Clube atual" correto (bate com o clube de
  origem); clube sem elenco mostra "Nenhum atleta contratado."; o link recolhe;
  sem erros de JS.

### Etapa 22 — Contratos: o elo Atleta ↔ Clube (estrutura)

- Criado `contracts.js` com a entidade **Contrato**, que **liga atletas a clubes**.
  Um atleta se vincula a um clube por um contrato de duração **anual** (1, 2 ou 3
  anos), estipulada no início.
- **Ciclo de vida**: `signContract` assina (só **agente livre**, valida a
  duração); ao término o clube pode **renovar** (`renewContract`, novo termo
  começando quando o atual acaba) ou o contrato **expira** e o atleta volta ao
  **pool de agentes livres** (`getFreeAgents`/`isFreeAgent`).
- **Status derivado das datas** (padrão do projeto, como `isStageDone`):
  `isContractActive`/`isContractEnded` comparam por dia; não há campo de status.
- **Desacoplado**: o clube de um atleta é derivado do contrato ativo
  (`getAthleteClub`) — **não** foi adicionado campo ao atleta nem ao clube; só o
  módulo novo e o `<script>` no `index.html`. Nenhuma estrutura não relacionada
  foi tocada, e a lista `CONTRACTS` **começa vazia** (sem vínculos inventados).
- **Sem UI** — apenas a estrutura/mecânica; a tela é o próximo passo (`TODO.md`).
- **Verificado** (Node + navegador headless): assinar → ativo (clube derivado) →
  no dia do término encerra e o atleta fica livre; duração inválida e assinatura
  dupla barradas; renovação cria novo termo (`renewalOf`) sem lacuna; histórico
  vs. elenco ativo do clube; pool de agentes livres correto; página sem erros.

### Etapa 21 — Aplicação individual do Cansaço por etapa

- A fadiga já era **fator no tempo** dos 100 m (Força efetiva = Força − fadiga
  acumulada, em `modalities.js`), mas na prática nunca variava: todos os atletas
  ficavam com `fatigue = 100`. Criado o **ponto de aplicação** do cansaço.
- **`applyStageFatigue(athlete)`** (em `athletes.js`) reduz o Cansaço de **um**
  atleta pelo valor de `fatigueReductionForStage`, limitado a `[0, 100]`. O
  desgaste é **individual** — cada atleta se cansa conforme seus próprios
  atributos (idade e Preparação Física). `applyStageFatigueToParticipants(list)`
  aplica o mesmo, individualmente, a uma lista de participantes.
- **Desacoplado de clube**: o mecanismo não depende da inscrição via clube (que
  ainda não existe). Quando ela existir, basta passar os atletas inscritos numa
  etapa; **não** há aplicação em massa aos atletas de um país.
- **Verificado**: dois atletas de mesma Força e descansados correm o mesmo tempo;
  após participarem de etapas, cada um acumula fadiga diferente (idade/preparo) e
  os tempos divergem; a versão por lista só afeta os participantes passados.

### Etapa 20 — Esporte favorito do atleta (ligação atleta ↔ esporte)

- Primeiro passo da ligação **atletas ↔ esportes/modalidades**: criado o campo
  **`favoriteSportId`** na entidade Atleta (referência a `sports.js`).
- **Todo regen recebe um esporte favorito ao ser gerado.** Neste início, todos
  nascem com **Atletismo** (`SPT-ATLETISMO`), via a constante
  `INITIAL_FAVORITE_SPORT_ID` em `athletes.js`.
- Helper de resolução `getAthleteFavoriteSport(athlete)` (retorna o objeto do
  esporte), no mesmo estilo de `getAthleteName`.
- **UI**: o **esporte favorito** aparece como nova linha ao expandir o atleta
  (`<details>`), abaixo de "Local de nascimento", via `getAthleteFavoriteSport`.
- Variar o esporte favorito entre os regens fica registrado no `TODO.md`.
- **Verificado**: `generateAthletes` produz atletas com
  `favoriteSportId === "SPT-ATLETISMO"` e o helper resolve para "Atletismo";
  em navegador headless a linha "Esporte favorito: Atletismo" surge no expandir.

---

## 4. Referência de funções (`script.js`)

| Função                              | Papel                                                          |
| ----------------------------------- | -------------------------------------------------------------- |
| `renderCalendar()`                  | Desenha a grade do mês, o destaque da data atual e marcadores. |
| `renderCurrentDate()`               | Escreve a data simulada por extenso.                           |
| `advanceDays(days)`                 | Avança a passagem de tempo **dia a dia** (cada dia: `processDay`). |
| `changeMonth(delta)`                | Navega entre meses (setas), sem mexer no tempo.                |
| `goToCurrent()`                     | Volta a visualização ao mês da data atual.                     |
| `activateTab(tab)`                  | Alterna entre as abas Calendário/Campeonatos.                  |
| `selectDay(date)`                   | Seleciona um dia e abre seus detalhes.                         |
| `renderDayDetail(date)`             | Monta a lista de eventos (ou a mensagem de vazio) do dia.      |
| `goToEvent(champId, stageNumber)`   | Vai para o evento na aba Campeonatos e destaca a etapa.        |
| `populateChampionshipSelect()`      | Preenche o seletor de campeonatos.                             |
| `renderChampionship(id, highlight?)`| Mostra os dados do campeonato (categoria, atletas elegíveis, card **Regras de Inscrição** com abrangência/idade/cota, etapas com status e link "Ver"); destaca opcionalmente. |
| `renderStageResults(championship, stage)` | Mostra a classificação de uma etapa (posição, atleta, resultado). |
| `refreshChampionshipView()`         | Reavalia o campeonato exibido após a passagem de tempo.        |
| `refreshDayDetail()`                | Reavalia o detalhe do dia aberto após a passagem de tempo.     |
| `formatCityLocation(city)`          | Texto da cidade com a hierarquia: `Cidade — SIGLA · Região`.    |
| `formatChampionshipScopeText(champ)`| Texto da abrangência (trava) do campeonato: o lugar do escopo.  |
| `formatAgeRestriction(ageRestriction)` | Texto da trava de idade (ou "Sem restrição").              |
| `formatClubQuota(quota)`            | Texto da cota por clube (ou "Sem limite").                     |
| `populateAthleteCountrySelect()`    | Preenche o seletor de países da aba Atletas.                    |
| `renderAthletes(countryId, highlightAthleteId?)` | Lista os atletas do país (inclui **Clube atual**); com destaque, abre/rola até um atleta. |
| `goToAthlete(athleteId)`            | Vai ao perfil do atleta (aba Atletas), abrindo/destacando o cartão. |
| `populateClubCountrySelect()`       | Preenche o seletor de países da aba Clubes.                     |
| `renderClubs(countryId)`            | Lista os clubes do país (link "Atletas do clube") e chama os agentes livres. |
| `toggleClubAthletes(button)`        | Mostra/esconde a lista de atletas contratados do clube.         |
| `renderClubAthletes(clubId, container)` | Lista os atletas contratados (nome clicável + duração/término/renovado). |
| `renderFreeAgents(countryId)`       | Lista os agentes livres do país (nomes clicáveis).              |
| `refreshClubView()` / `refreshAthleteView()` | Reavaliam as abas Clubes/Atletas após a passagem de tempo. |
| `renderRanking()`                   | Dispatcher da aba Rankings: mostra o seletor e desenha o ranking escolhido (pontos/marcas). |
| `renderPointsRanking()`             | Ranking de pontos (posição/atleta/clube/etapas/pontos).        |
| `renderMarksRanking(eventId)`       | Ranking de marcas de um evento (posição/atleta/clube/data clicável/marca). |
| `renderSports()`                    | Aba **Esportes**: lista os esportes em ordem alfabética (`<details>`), cada um mostrando seus **atributos** e abrindo suas modalidades (`<details>`, com **atributos**) e cada modalidade seus eventos (`<details>`, com **atributos**). Lê das databases vivas — novos esportes/modalidades/eventos aparecem sozinhos. |
| `renderModalityDetails(modality, sport)` | Uma modalidade na aba Esportes: atributos (ID, esporte, nº de eventos) + os eventos. |
| `renderEventDetails(event, modality, sport)` | Um evento na aba Esportes: atributos (ID, modalidade, esporte, modelo de resultado, popularidade). |
| `byNamePtBr(a, b)`                  | Comparador de ordenação alfabética por `name` (pt-BR, acentos-ciente).       |
| `metricLabelPtBr` / `orderLabelPtBr` / `formatEventResolution(event)` | Rótulos em pt-BR da métrica/direção e o texto do modelo de resolução de um evento (ou "— (pendente)"). |
| `formatPracticeStartYear(year)`     | Texto do ano de início da prática de um esporte (negativo → "N a.C.").       |
| `attrList(pairs)`                   | Monta uma lista de atributos `<li><span>rótulo</span><strong>valor</strong></li>`. |

---

## 5. Como estender (guia rápido)

- **Novo país**: adicione uma entrada em `COUNTRIES` (`countries.js`).
- **Novo campeonato**: adicione uma entrada em `CHAMPIONSHIPS` (`championships.js`).
  Ele aparece automaticamente no seletor da aba Campeonatos, e suas etapas são
  marcadas no calendário.
- **Outro padrão de etapas**: reutilize `buildMonthlyStages(...)` ou crie a lista
  `stages` manualmente (`{ number, date }`).
