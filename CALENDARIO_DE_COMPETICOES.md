# Calendário de Competições

Documento de referência do **calendário de competições** do Olympiad. Aprofunda
**como o calendário foi desenhado** para servir de base às próximas interações
(inscrição real de atletas, ranking, índices, premiação e finais). O código-fonte
está em `competitionCategories.js` (a estrutura) e em `championships.js` (as
competições que apontam para ela).

> Estado atual: **a estrutura (categorias) está implementada**; a lógica de
> **inscrição real**, a **distribuição de ranking**, os **índices**, as **finais**
> e a **premiação** ainda **não existem** — estão desenhadas aqui e registradas no
> `TODO.md`.

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
- **Entidades geográficas subnacionais (região, estado) ainda não existem.** Por
  ora o scope `subnacional` apenas **classifica o nível**; quando região/estado
  forem criados, uma competição subnacional apontará para o recorte específico.

---

## 4. Ranking (pontos)

Cada categoria vale um total de **pontos de ranking** (`rankingPoints`) — a coluna
"Ranking" da tabela. A leitura atual é: **base de pontos do campeão** da
competição; quanto maior o porte, mais pontos valem a vitória.

Ainda **a definir** (registrado no `TODO.md`):

- **Distribuição por posição**: como os `rankingPoints` se repartem entre 1º, 2º,
  3º... (tabela/curva de pontuação).
- **Ranking acumulado**: onde os pontos se somam (ranking de atleta? de clube? por
  país? por temporada?).
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

1. **Popular o calendário** de um país com competições nas várias categorias
   (hoje só existe o `CNA-2026`, na categoria Nacional).
2. **Inscrição real** (prioridade média): o clube escolhendo **quais** atletas
   inscrever em **qual** competição, por perfil (força/forma/índice), vagas e
   critérios — substituindo a regra de teste em `participation.js`.
3. **Ranking**: distribuição de pontos por posição, ranking acumulado e índices.
4. **Pesos de etapa e final** dentro de cada campeonato.
5. **Competições internacionais**: como representar a participação de vários
   países (depende de existir mais de um país).
6. **Premiação/finanças**: usar a tabela de premiação quando houver sistema
   financeiro.
