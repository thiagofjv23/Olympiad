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
| `cities.js`         | **Entidade Cidades** (database inicial de cidades reais).               |
| `sports.js`         | **Entidade Esportes** (database inicial de esportes).                   |
| `modalities.js`     | **Entidade Modalidades** (ligada a esportes; database vazia).           |
| `resultsEngine.js`  | **Engine de resolução de resultados** (genérica, sem conhecer esportes).|
| `README.md`         | Resumo de uso.                                                          |
| `DOCUMENTACAO.md`   | Este documento de controle.                                            |
| `TODO.md`           | Pendências e decisões temporárias.                                     |
| `DECISOES.md`       | Decisões tomadas por conta própria (o "porquê").                       |
| `PRINCIPIOS_CIDADES.md` | Princípios de criação/geração de cidades.                          |
| `DIARIO_DE_TRABALHO.md` | Registro do que foi implantado, por data (atualizar só ao fim do dia). |
| `SUGESTOES_INICIO_DE_TRABALHO.md` | Pendências resumidas do dia anterior, da mais nova à mais antiga. |

### Princípio de arquitetura

Os **dados** (`countries.js`, `championships.js`) são separados da **UI**
(`script.js`). Os arquivos de dados só definem entidades e funções puras; a UI
apenas lê essas estruturas. Assim, adicionar um país ou campeonato é editar o
documento de dados — a interface (seletor, marcadores no calendário) se atualiza
sozinha.

Ordem de carregamento dos scripts (importa, pois são globais):
`countries.js` → `cities.js` → `sports.js` → `resultsEngine.js` →
`modalities.js` → `championships.js` → `athletes.js` → `clubs.js` →
`contracts.js` → `participation.js` → `script.js`. (`contracts.js` vem depois de
`athletes.js`, `clubs.js` e `championships.js` porque referencia `getClub` e
`toDayStart`; `participation.js` vem por último, pois usa atletas, clubes,
contratos e etapas.)

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
| `sportId`     | **Esporte disputado** (ver `sports.js`) — todo campeonato tem um. |
| `events`      | Eventos (lista).                                       |
| `modalities`  | Modalidades (lista).                                   |
| `competitors` | Participantes (lista).                                 |
| `stages`      | Etapas — `{ number, date }`.                           |

Campeonato cadastrado: **Campeonato Nacional de Atletismo** (`CNA-2026`), Brasil,
esporte **Atletismo** (`SPT-ATLETISMO`), modalidade **100 m rasos**
(`MOD-ATL-100M`), 0 participantes, **10 etapas**. Todo novo campeonato deve
informar o seu `sportId` (e a(s) modalidade(s) disputada(s)).

Funções utilitárias:

- `getChampionshipSport(championship)` — o esporte do campeonato (objeto de
  `sports.js`).
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
| `ritmo`               | **Ritmo/forma** (0–100). Começa **baixo** no início do ano, **sobe** ao competir e **cai** parado. **Modifica a resolução de resultados** (redutor de forma). Inicial/ganho/queda dependem da Preparação Física. |
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
  **baixo** no início do ano e sobe competindo. Os **três** parâmetros dependem da
  **Preparação Física** (constantes em `athletes.js`):
  - **Inicial** (`initialRitmo`): base baixa (5) + até +15 pelo preparo (→ 5–20).
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
| `cityId`              | Cidade-sede do clube (ver `cities.js`).                        |
| `president`           | Presidente — **ainda não utilizado** (ver `TODO.md`).          |
| `foundationYear`      | Ano de fundação.                                               |
| `infrastructureLevel` | Nível de infraestrutura (0–100), definido considerando a força olímpica do país. |
| `prestige`            | Prestígio (0–100). **Ainda não utilizado**; será a base de Finanças, contratações e ordenamento de clubes (ver `TODO.md`). |
| `finances`            | Finanças — **ainda não utilizado** (ver `TODO.md`).           |
| `rivals`              | Clubes rivais (ids) — a evoluir (ver `TODO.md`).              |

Funções utilitárias: `getClub(id)` e `getClubsByCountry(countryId)`.

Conjunto inicial (10 clubes, todos do Brasil — único país existente): Pinheiros,
Sogipa, Grêmio Náutico União, Minas Tênis Clube, Flamengo, Vasco da Gama,
Botafogo, Fluminense, Corinthians e Clube Atlético Paulistano. É um conjunto de
**teste**, a ser revisado e ampliado.

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
  (temporário): assina cada atleta a um clube aleatório do seu país, com duração
  anual sorteada. Só para dar dados às telas; será substituído pelo fluxo real de
  contratação (ver `TODO.md`). Chamado no início da simulação (`script.js`).

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

Funções:

- `getStageParticipants(championship, stage)` — atletas participantes da etapa
  (regra de teste acima); `getStageParticipantCount(...)` retorna a quantidade.
- `getStageModality(championship, stage)` — a prova disputada (por ora, a
  primeira modalidade do campeonato; senão, a primeira do esporte).
- `processStage(championship, stage)` — processa uma etapa **uma única vez**:
  (1) **resolve o resultado** com a fadiga atual dos participantes (via
  `resolveModality`) e o **trava**; (2) aplica a fadiga da etapa aos participantes.
- `processDay(date)` — processa **um dia**: (0) na virada de ano reinicia o
  **ritmo** de todos (`resetSeasonRitmo`); (1) resolve as etapas do dia — seus
  participantes se **cansam** e **ganham ritmo**; (2) os demais **descansam**
  (recuperam Cansaço com `applyRestDay` e **perdem ritmo** com `applyRestDayRitmo`).
  Quem competiu no dia não descansa nesse dia. Chamado **dia a dia** por
  `advanceDays`.
- `getStageResult(championship, stage)` — o resultado travado da etapa
  (`[{ id, result, position }]`) ou `null` se ainda não realizada.
  `resetParticipation()` zera os resultados processados.

Por que travar o resultado: a fadiga muda ao longo do tempo; o resultado de uma
etapa é **histórico** e é fixado no momento da realização (com a fadiga de então,
antes do desgaste daquela etapa). Efeito: etapas seguintes tendem a ficar mais
lentas conforme os atletas acumulam cansaço. A **UI** exibe a classificação na
aba Campeonatos (ver seção 4 e Etapa 26).

### Cidades — `cities.js`

Database inicial (objeto `CITIES`) de cidades reais. **Relaciona-se com países,
clubes e atletas**: é o país da cidade, a sede dos clubes e a cidade de
nascimento dos atletas.

| Campo                  | Descrição                                                       |
| ---------------------- | --------------------------------------------------------------- |
| `id`                   | Identificador único (ex.: `CID-SAO-PAULO`).                    |
| `name`                 | Nome da cidade.                                                 |
| `countryId`            | País da cidade (ver `countries.js`).                           |
| `populationEstimate`   | População estimada (base para o tamanho).                      |
| `size`                 | Tamanho **derivado** da população: pequena / média / grande / metrópole. |
| `sportsInfrastructure` | Infraestrutura esportiva (0–100), influenciada pela força olímpica do país. |

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

Funções utilitárias: `getSport(id)` e `getAllSports()`.

Conjunto inicial (6 esportes): Atletismo (o do nosso campeonato), Natação,
Futebol, Basquete, Vôlei e Ginástica Artística. Popularidade é aproximada; lista
a ser ampliada.

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

Entidade **ligada a um esporte** (`sportId`), usada em esportes com mais de uma
variação de prática (ex.: Atletismo → 100 m, salto em distância, etc.).

| Campo               | Descrição                                                        |
| ------------------- | ---------------------------------------------------------------- |
| `id`                | Identificador único.                                             |
| `name`              | Nome da modalidade.                                              |
| `sportId`           | Esporte primário (ver `sports.js`).                             |
| `resolution`        | **Forma de resolução** — objeto de parâmetros da `ResultsEngine` (`{ metric, order, aggregation, precision }`). |
| `performance`       | Parâmetros do modelo que transforma os atributos do atleta no número do resultado. |
| `generalPopularity` | Popularidade geral da modalidade **dentro do esporte** (0–100).  |
| `countryPopularity` | Popularidade por país — **relação a fazer depois** (ver `TODO.md`). |

Funções utilitárias: `getModality(id)` e `getModalitiesBySport(sportId)`.

**Modalidade cadastrada: 100 m rasos** (`MOD-ATL-100M`, do Atletismo). Resolução:
métrica tempo, **menor vence**, resultado único, 2 casas. Modelo de desempenho:

- **Força efetiva** = `Força − redutor de fadiga − redutor de forma`.
  - **Redutor de fadiga** = `(100 − fatigue) × fatiguePenaltyPerPoint`. O stat
    `fatigue` começa em 100 (descansado); `100 − fatigue` é a **fadiga acumulada**.
    Descansado não perde nada; cansado perde Força. (`fatiguePenaltyPerPoint = 0.3`.)
  - **Redutor de forma** = `(100 − ritmo) × formPenaltyPerPoint`. `ritmo` 100 =
    forma plena (sem penalidade); `100 − ritmo` é o **déficit de forma**. Fora de
    forma perde Força efetiva. (`formPenaltyPerPoint = 0.15`.) **Os dois redutores
    somam** e são independentes (fadiga = curto prazo; ritmo = forma de temporada).
    Sem `ritmo`, o déficit é 0 (retrocompatível). **Força e fadiga permanecem** —
    o ritmo apenas se soma.
- **Tempo** = `recordTime + (100 − Força efetiva) × secondsPerStrengthPoint`, com
  `recordTime = 9.58` (recorde mundial, o **piso** — ninguém corre abaixo) e
  `secondsPerStrengthPoint = 0.05`. Força efetiva 100 → 9,58 s; quanto menor,
  mais lento.

Funções do modelo: `effectiveStrengthForModality`, `computeModalityResult` (o
número do resultado — aqui o tempo), `formatModalityResult` (ex.: `10.18 s`) e
`resolveModality(athletes, modality)` (gera os tempos e resolve o ranking pela
`ResultsEngine`, retornando `{ id, result, position }` com `result` = tempo).

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
| `renderChampionship(id, highlight?)`| Mostra os dados do campeonato (etapas com status e link "Ver" de resultados); destaca opcionalmente. |
| `renderStageResults(championship, stage)` | Mostra a classificação de uma etapa (posição, atleta, resultado). |
| `refreshChampionshipView()`         | Reavalia o campeonato exibido após a passagem de tempo.        |
| `refreshDayDetail()`                | Reavalia o detalhe do dia aberto após a passagem de tempo.     |
| `populateAthleteCountrySelect()`    | Preenche o seletor de países da aba Atletas.                    |
| `renderAthletes(countryId, highlightAthleteId?)` | Lista os atletas do país (inclui **Clube atual**); com destaque, abre/rola até um atleta. |
| `goToAthlete(athleteId)`            | Vai ao perfil do atleta (aba Atletas), abrindo/destacando o cartão. |
| `populateClubCountrySelect()`       | Preenche o seletor de países da aba Clubes.                     |
| `renderClubs(countryId)`            | Lista os clubes do país (link "Atletas do clube") e chama os agentes livres. |
| `toggleClubAthletes(button)`        | Mostra/esconde a lista de atletas contratados do clube.         |
| `renderClubAthletes(clubId, container)` | Lista os atletas contratados (nome clicável + duração/término/renovado). |
| `renderFreeAgents(countryId)`       | Lista os agentes livres do país (nomes clicáveis).              |
| `refreshClubView()` / `refreshAthleteView()` | Reavaliam as abas Clubes/Atletas após a passagem de tempo. |

---

## 5. Como estender (guia rápido)

- **Novo país**: adicione uma entrada em `COUNTRIES` (`countries.js`).
- **Novo campeonato**: adicione uma entrada em `CHAMPIONSHIPS` (`championships.js`).
  Ele aparece automaticamente no seletor da aba Campeonatos, e suas etapas são
  marcadas no calendário.
- **Outro padrão de etapas**: reutilize `buildMonthlyStages(...)` ou crie a lista
  `stages` manualmente (`{ number, date }`).
