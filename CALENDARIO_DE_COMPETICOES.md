# Calendário de Competições

Documento de referência do **calendário de competições** do Olympiad. Aprofunda
**como o calendário foi desenhado** para servir de base às próximas interações
(inscrição real de atletas, ranking, índices, premiação e finais). O código-fonte
está em `competitionCategories.js` (a estrutura de categorias), `championships.js`
(as competições e o **gerador** geográfico) e `eligibility.js` (as **travas de
inscrição**).

> Estado atual: **a estrutura (categorias) está implementada** e o **calendário do
> Brasil está populado** (Nacional + Estaduais + Regionais), com as **travas de
> inscrição** por país/região/estado/cidade. A **inscrição** já existe como
> estrutura (`registrations.js`) e **substituiu** a participação automática — mas,
> por ora (escopo de teste), quem inscreve é o **jogador**, controlando todos os
> clubes um a um (`clubControl.js`, aba **Inscrições**); a **IA de inscrição** (o
> clube decidindo sozinho), a **distribuição de ranking**, os **índices**, as
> **finais** e a **premiação** ainda **não existem** — desenhadas aqui e
> registradas no `TODO.md`.

---

## 1. Por que um calendário em categorias

Hoje um clube não tem **escolha**: a participação nas etapas é uma regra de teste
(cada clube inscreve todos os atletas em todas as etapas — ver `participation.js`
e `TODO.md`). Para existir uma **mecânica real de inscrição**, o calendário
precisa oferecer **competições de portes diferentes**, para que o clube decida
**em qual competição inscrever cada tipo de atleta**:

- **Manter ritmo/forma**: levar um atleta a competições menores para competir com
  frequência sem desgaste excessivo (ver o atributo `ritmo` em `athletes.js`).
- **Buscar ranking e índices**: inscrever os melhores atletas em competições de
  maior porte, que valem mais **pontos de ranking**.
- **Classificação**: usar competições menores como porta de entrada para as
  maiores (subir de série / se classificar).

O calendário é, portanto, organizado em **níveis (tiers)** — as **categorias de
competição**.

---

## 2. As categorias (estrutura)

Nove categorias, do menor ao maior porte. Cada uma define o **prestígio** do
porte, os **pontos de ranking** que vale e a **premiação** (esta última só como
referência — ver seção 5).

| Nível | Categoria    | Scope          | Prestígio | Ranking | Premiação (ref.) |
| ----- | ------------ | -------------- | --------- | ------- | ---------------- |
| 1     | Regional     | subnacional    | 20        | 20      | `$`              |
| 2     | Estadual     | subnacional    | 35        | 40      | `$$`             |
| 3     | Série C      | nacional       | 45        | 60      | `$$$`            |
| 4     | Série B      | nacional       | 60        | 100     | `$$$$`           |
| 5     | Série A      | nacional       | 75        | 160     | `$$$$$`          |
| 6     | Nacional     | nacional       | 95        | 300     | `$$$$$$$`        |
| 7     | Continental  | internacional  | 98        | 450     | *a definir*      |
| 8     | Mundial      | internacional  | 99        | 700     | *a definir*      |
| 9     | Olímpico     | internacional  | 100       | 1000    | *a definir*      |

- **`level`** (1–9): ordena as categorias e permite comparar "quem é maior".
- **`prestige`** (0–100): porte da categoria. Pensado para **casar** clubes e
  atletas ao nível certo (um clube/atleta de prestígio X tende a competir em
  categorias de prestígio próximo). O **uso** desse casamento é futuro.
- **`rankingPoints`**: pontos de ranking que a categoria vale (ver seção 4).
- A **premiação** em `$` **não é modelada em código** — é referência para o
  sistema financeiro futuro (seção 5). Categorias internacionais ficaram **sem
  valor definido** de propósito (não inventamos dados — ver `DECISOES.md`).

---

## 3. Scope: como o calendário serve TODOS os países

As categorias são uma database **global** (as mesmas para qualquer país). O que
muda de país para país é **quem organiza/participa** de cada competição — e isso
é dado pelo **scope** (alcance geográfico) da categoria:

| Scope           | Categorias                          | A quem pertence a competição                                   |
| --------------- | ----------------------------------- | -------------------------------------------------------------- |
| `subnacional`   | Regional, Estadual                  | A um recorte **dentro de um país** (região/estado).            |
| `nacional`      | Série C, Série B, Série A, Nacional | A **um** país.                                                 |
| `internacional` | Continental, Mundial, Olímpico      | A **vários** países (um continente, o mundo, os Jogos).         |

Consequências do desenho:

- **Categorias não pertencem a país nenhum** → podem ser reutilizadas por
  qualquer país sem duplicação. Adicionar um novo país **não** exige recriar o
  calendário: ele herda a mesma escala de portes.
- **Competições `nacional`/`subnacional`** referenciam **um** `countryId` (como o
  `CNA-2026` referencia `BRA`). Cada país terá o seu conjunto.
- **Competições `internacional`** abrangerão **vários** países. A forma de
  representar isso (lista de países, confederação, sede rotativa) **ainda será
  definida** quando existir mais de um país (hoje só há o Brasil).
- **Entidades geográficas subnacionais já existem**: **regiões** (`regions.js`) e
  **estados** (`states.js`), na hierarquia país → região → estado → cidade. Uma
  competição **Regional** acontece dentro de uma **região**; uma **Estadual**,
  dentro de um **estado**.

---

## 3.1. Como o calendário do Brasil foi populado (gerador)

O calendário é montado por um **gerador genérico**,
`buildCountryGeographicChampionships(config)` (em `championships.js`), que serve
**qualquer país**. Dado um país (e o esporte/modalidade), ele cria:

- **um Estadual por estado** que tenha **ao menos uma cidade** na database;
- **um Regional por região** que tenha **ao menos uma cidade** (via seus estados).

O **Nacional** (`CNA-2026`) está na database à mão. Para o Brasil, o resultado são
**16 campeonatos**: 1 Nacional + 10 Estaduais + 5 Regionais.

Princípios:

- **Só lugares com cidade na database geram competição.** Um estado/região sem
  cidade cadastrada **não** vira campeonato — o calendário reflete exatamente as
  cidades que temos.
- **Etapas em sábados distintos por nível** para não colidir no calendário:
  Estadual no **1º** sábado, Nacional no **2º**, Regional no **3º** de cada mês.
- **Genérico**: para um novo país, basta chamar o gerador com o seu `countryId`
  (e ter a sua geografia/cidades cadastradas).

## 3.2. Travas de inscrição (quem pode disputar)

Cada campeonato declara um **`scope`** `{ level, placeId }` (a **abrangência**), e
só disputa quem é **elegível** a ele — ver `eligibility.js`:

- `country` → atletas **do país**; `region` → **da região**; `state` → **do
  estado**; `city` → **da cidade**.
- A **origem** do atleta vem da sua **cidade de nascimento** (`birthCityId`), que
  dá todos os níveis pela hierarquia. Vale inclusive para **agentes livres**
  (independe de contrato/clube).

Exemplos: o **Estadual de São Paulo** (`scope` estado = `EST-SP`) só recebe
atletas nascidos em SP; o **Regional Sudeste** (`REG-SUDESTE`), os nascidos na
região; o **Nacional** (`BRA`), todos os brasileiros.

Além da geográfica, há mais duas travas (genéricas — **qualquer** campeonato pode
declará-las):

- **Faixa etária** (`ageRestriction { minAge, maxAge }`): trava de atleta por
  idade. **Uso futuro** — o mecanismo existe (ver `eligibility.js`), mas nenhum
  campeonato usa ainda; é para os **juvenis/sub** (Sub-18, Sub-20, ...). Ver
  `TODO.md`.
- **Cota por clube** (`clubQuota`): máximo de atletas que **cada clube** inscreve
  **por etapa**. Aplicada ao **CNA = 1** (cada clube manda 1 atleta por etapa);
  os demais campeonatos ainda **sem cota**. É uma trava de **grupo**, aplicada em
  `participation.js`; enquanto a inscrição real não existe, a seleção de quem o
  clube manda é um **placeholder** (os mais fortes).

Na prática, os participantes de uma etapa são **os contratados via clube ∩ os
elegíveis pelas travas de atleta (geografia + idade)**, depois **limitados pela
cota por clube**. Todas essas regras ficam visíveis ao jogador no card **"Regras
de Inscrição"** (aba Campeonatos).

---

## 4. Ranking (pontos) — **implementado**

Cada categoria vale um total de **pontos de ranking** (`rankingPoints`) — a coluna
"Ranking" da tabela — lido como a **base de pontos do campeão**; quanto maior o
porte, mais pontos vale a vitória.

**Como funciona** (ver `ranking.js` e a aba **Rankings**):

- **Por posição**: o campeão leva a base cheia e as posições seguintes levam
  frações (placeholder: decaimento harmônico `base / posição`). Ex.: Nacional
  (300) → 1º 300, 2º 150, 3º 100…; Regional (20) → 1º 20…
- **Por temporada**: os pontos de **todas** as competições que o atleta disputa se
  **somam** ao longo do ano (ranking de **atleta**, por temporada). A aba Rankings
  mostra posição, atleta, clube, etapas disputadas e pontos, e **atualiza a cada
  etapa**.
- **Ranking de MARCAS** (além do de pontos): por modalidade, guarda a **melhor
  marca** de cada atleta na temporada (ver `marksRanking.js`). Na aba Rankings, o
  jogador escolhe ver **Pontos** ou **Marcas**; o de marcas mostra posição, atleta,
  clube, data (clicável → campeonato/etapa) e a marca. É um **template genérico**
  por modalidade (implementado para os 100 m).
- **Histórico**: ao virar o ano, os rankings da temporada (pontos e marcas) são
  **arquivados** (salvos para uso posterior) e novos começam.

Ainda **a definir** (registrado no `TODO.md`):

- **Curva de pontuação definitiva** (hoje é o placeholder harmônico) e eventual
  **corte** (só os N primeiros pontuam).
- **Ranking de clube/país** (hoje só de atleta) e **uso do histórico** arquivado.
- **Índices**: marcas mínimas que classificam um atleta para categorias maiores.

---

## 5. Premiação (dinheiro) — referência para o futuro

A coluna **Premiação** (`$`, `$$`, ...) descreve a **ordem de grandeza** do prêmio
por categoria e existe **apenas como referência**. **Não há campo de dinheiro no
código** e nenhuma mecânica financeira foi criada.

Quando o **sistema financeiro** for implementado (finanças dos clubes,
contratações pagas, orçamento), esta tabela será o ponto de partida da premiação
por categoria. Os valores estão preservados no `TODO.md` e na tabela da seção 2.
Note que **Nacional** salta para `$$$$$$$` (sete) e as **internacionais** ficaram
**sem valor definido** — a completar quando o sistema existir.

---

## 6. Etapas, pesos e final (futuro)

O campeonato que já temos (`CNA-2026`) tem **10 etapas** mensais (2º sábado de
cada mês). A ideia registrada para depois (ver `TODO.md`):

- **Pesos por etapa**: etapas podem valer **pesos diferentes** (nem toda etapa
  vale o mesmo).
- **Pontos rumo à final**: as etapas somam pontos para uma **final** disputada na
  **última etapa** — ou seja, a temporada de um campeonato vira uma disputa
  acumulada, decidida no fim.

Isso conecta o calendário (categorias) com a estrutura **interna** de cada
campeonato (etapas → final), mas é uma camada à parte, ainda não implementada.

---

## 7. Modelo de dados (referência rápida)

### `competitionCategories.js`

- **`COMPETITION_SCOPES`** — `{ SUBNACIONAL, NACIONAL, INTERNACIONAL }`.
- **`COMPETITION_CATEGORIES`** — objeto indexado por `id`; cada categoria tem
  `id`, `name`, `level`, `scope`, `prestige`, `rankingPoints`.
- Helpers:
  - `getCompetitionCategory(id)` — categoria por id (ou `undefined`).
  - `getAllCompetitionCategories()` — todas, ordenadas por `level` crescente.
  - `getCategoriesByScope(scope)` — categorias de um alcance.
  - `getCategoryByLevel(level)` — categoria de um nível (1..9).

### Ligação com `championships.js`

- Todo campeonato tem um **`categoryId`** (aponta para uma categoria).
- `getChampionshipCategory(championship)` — resolve a categoria do campeonato.
- Exemplo atual: **`CNA-2026`** → **`CAT-NACIONAL`** (Nacional, prestígio 95,
  ranking 300).

Ordem de carregamento (em `index.html`): `competitionCategories.js` vem **antes**
de `championships.js`, pois o campeonato referencia a categoria.

---

## 8. Próximos passos (roteiro)

Registrados no `TODO.md`; em ordem sugerida:

1. ✅ **Popular o calendário** (Estadual/Regional/Nacional) e as **travas de
   inscrição** — feito (seções 3.1 e 3.2).
2. **Inscrição real** (prioridade média): o clube escolhendo **quais** atletas
   inscrever em **qual** competição, por perfil (força/forma/índice), vagas e
   critérios — substituindo a regra de teste em `participation.js`. A trava
   geográfica já restringe **quem pode**; falta a **escolha do clube**.
3. **Séries C/B/A** (divisões nacionais) — dependem do sistema de ranking/acesso.
4. **Ranking**: distribuição de pontos por posição, ranking acumulado e índices.
5. **Pesos de etapa e final** dentro de cada campeonato.
6. **Competições internacionais**: como representar a participação de vários
   países (depende de existir mais de um país).
7. **Premiação/finanças**: usar a tabela de premiação quando houver sistema
   financeiro.
