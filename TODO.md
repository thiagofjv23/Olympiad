# TO DO — Pendências e decisões temporárias

Lista de coisas deixadas para depois, com contexto do porquê. Referenciada pela
`DOCUMENTACAO.md`.

## 🔴 Prioridade alta

- [ ] **Criar a mecânica de ResultSystem.** Cada esporte já declara em
      `sports.js` a lista `resultSystems` (ex.: `TimeResultSystem`,
      `DistanceResultSystem`, `HeightResultSystem`, `PointsResultSystem`,
      `MatchResultSystem`, `JudgeResultSystem`, `ScoreResultSystem`,
      `WeightResultSystem`, `CombinedResultSystem`), **mas por enquanto é só um
      indicador (rótulo) — não há nenhuma mecânica ligada a ele**. Falta criar os
      ResultSystem de verdade: como cada um resolve o resultado de uma prova
      (provavelmente sobre a `ResultsEngine` genérica em `resultsEngine.js`) e como
      o esporte/modalidade escolhe qual usar. É o próximo grande passo da simulação
      de resultados por esporte.
- [ ] **Usar o Prestígio dos clubes.** O atributo `prestige` (0-100) já existe em
      todos os clubes (`clubs.js`) com valores iniciais aproximados, **mas ainda
      não é utilizado**. Ele será a base das próximas features:
  - **Finanças** dos clubes.
  - **Contratações** (de atletas).
  - **Ordenamento de clubes** (ranking/classificação).

## 🟡 Prioridade média

- [ ] **Mecânica de cadastro de atletas em campeonatos.** Hoje a participação é
      apenas uma **regra de TESTE** (`getStageParticipants` em `participation.js`):
      cada clube inscreve **todos** os seus atletas em **todas** as etapas. Falta a
      lógica **real**: o clube **escolhendo quais** atletas inscrever, vagas/limites,
      critérios (força, forma, elenco), e a inscrição **por etapa** (não
      necessariamente todas). Deve substituir a regra de teste. **Depende do
      calendário de competições** (categorias/tiers) — o clube escolhe em **qual
      competição** (porte) inscrever cada tipo de atleta. Ver a seção "Calendário
      de competições" abaixo e `CALENDARIO_DE_COMPETICOES.md`.
      **Já existe** o calendário populado (Estaduais/Regionais/Nacional) e a
      **trava geográfica** (`eligibility.js`) que restringe por país/região/
      estado/cidade — falta a **escolha do clube** (quais/quantos/por etapa).

## Geografia (regiões e estados)

Hierarquia **país → região → estado → cidade** criada (`regions.js`, `states.js`;
cidade ganhou `stateId`). Pendências:

- [ ] **Ampliar os estados para as 27 UFs.** Hoje só existem os **10 estados** das
      cidades cadastradas (`states.js`), cobrindo as 5 regiões. Completar quando
      houver mais cidades/uso (mesmo espírito das "10 cidades de teste").
- [ ] **Regiões/estados de outros países.** Já existe a **Argentina** (`ARG`,
      só país + atributos básicos); falta criar sua **geografia** (regiões,
      estados/províncias) e depois cidades, no mesmo molde do Brasil.
- [ ] **Cidades, clubes e atletas da Argentina.** A Argentina entrou só como país;
      povoar depois (cidades → clubes → atletas), reutilizando as estruturas e os
      mesmos parâmetros já usados no Brasil.
- [x] **UI de regiões/estados.** Feito: sigla do estado e região aparecem junto
      da cidade nas abas Clubes (resumo com sigla + linhas Estado/Região no
      detalhe) e Atletas (local de nascimento: "Cidade — SIGLA · Região").

## Calendário de competições

Base criada em `competitionCategories.js` (9 categorias/tiers) — ver
`CALENDARIO_DE_COMPETICOES.md`. A hierarquia geográfica (regiões/estados) já
existe para ancorar os portes Regional e Estadual. Pendências:

- [x] **Popular o calendário (Estadual/Regional/Nacional).** Feito: gerador
      `buildCountryGeographicChampionships` cria os **Estaduais** (por estado com
      cidade) e **Regionais** (por região com cidade); o **Nacional** (`CNA-2026`)
      está na database. Brasil: **16 campeonatos** (1 + 10 + 5). Só cria para
      lugares com cidade na database.
- [x] **Travas de inscrição por país/região/estado/cidade.** Feito em
      `eligibility.js`: só disputa quem é elegível ao `scope` do campeonato, pela
      **cidade de nascimento**. Ligado a `getStageParticipants`.
- [x] **Trava de cota por clube (`clubQuota`).** Feito: cada clube inscreve no
      máximo N atletas por etapa; aplicada ao **CNA = 1**. Seleção por placeholder
      (mais fortes) — a seleção **real** faz parte da mecânica de inscrição
      pendente.
- [x] **Trava de idade (mecanismo).** Feito em `eligibility.js`
      (`ageRestriction { minAge, maxAge }`); **nenhum campeonato usa ainda**.
- [ ] **Campeonatos juvenis/sub (usar a trava de idade).** O mecanismo de idade
      já existe; falta **criar os campeonatos** que o usam (ex.: Sub-18, Sub-20,
      Sub-23, juvenil) — definir faixas, calendário e como se relacionam com os
      adultos.
- [ ] **Faltam os portes Séries C/B/A e internacionais.** O gerador cobre
      Estadual/Regional/Nacional; **Séries C/B/A** (divisões nacionais) dependem
      do sistema de ranking/acesso, e **Continental/Mundial/Olímpico** dependem de
      existir mais de um país. Criar depois.
- [ ] **Campeonatos municipais (nível cidade).** A trava já suporta `level:"city"`,
      mas ainda **não há categoria municipal** nem campeonatos de cidade — criar
      se/quando fizer sentido.
- [ ] **Origem do atleta = cidade de nascimento.** A trava usa `birthCityId`.
      Depois, avaliar se a elegibilidade deveria considerar também
      **representação** (cidade do clube) além do nascimento.
- [x] **Ranking de atletas por temporada.** Feito (`ranking.js` + aba Rankings):
      pontos por etapa conforme a tier (maiores valem mais), acumulados na
      temporada; a aba mostra posição, atleta, clube, etapas e pontos, atualizando
      a cada etapa. **Distribuição por posição** é um **placeholder** (decaimento
      harmônico `base / posição`) — definir a curva definitiva e possível corte.
- [x] **Ranking de marcas por temporada.** Feito (`marksRanking.js` + aba
      Rankings): por modalidade, só a **melhor marca** do atleta na temporada;
      ordenado por marca, com posição, atleta, clube, data (clicável → campeonato/
      etapa) e a marca. **Template genérico** por modalidade; exibido para os 100 m.
- [ ] **Seletor de modalidade no ranking de marcas.** Hoje o ranking de marcas
      mostra a única modalidade existente (100 m, `MARKS_DISPLAY_MODALITY_ID` em
      `script.js`). Quando houver mais modalidades, adicionar um seletor.
- [x] **Histórico de temporada salvo para uso posterior.** DECISÃO: ao virar o ano,
      os rankings da temporada (pontos em `RANKING_HISTORY`, marcas em
      `MARKS_HISTORY`) são arquivados. **Ficam guardados de propósito para uso
      futuro** — ainda **não consumidos** por nenhuma tela/mecânica. Usos a definir:
      histórico/hall da fama, recordes, evolução de carreira, rankings all-time, etc.
- [ ] **Ranking de clube/país e índices.** Hoje o ranking é só de **atleta**.
      Faltam ranking de **clube**/**país**, os **índices** (marcas que classificam
      para categorias maiores) e o **consumo do histórico** arquivado.
- [ ] **Pesos de etapa e final.** As etapas do campeonato (hoje 10, todas iguais)
      poderão ter **pesos diferentes** e **valer pontos** para uma **final** na
      **última etapa** (temporada acumulada, decidida no fim).
- [ ] **Premiação (dinheiro) — referência para o sistema financeiro.** A
      premiação por categoria **não está no código** (só referência). Usar esta
      tabela quando o sistema financeiro existir:
      Regional `$`, Estadual `$$`, Série C `$$$`, Série B `$$$$`, Série A `$$$$$`,
      Nacional `$$$$$$$`; **Continental/Mundial/Olímpico a definir** (não
      inventados). Liga-se a **Finanças** dos clubes (ver seção Clubes).
- [ ] **Competições internacionais (multi-país).** Continental/Mundial/Olímpico
      abrangem **vários** países; como representar isso (lista de países,
      confederação, sede) depende de existir **mais de um país** (hoje só o Brasil).
- [ ] **Casar clube/atleta ao porte certo.** O `prestige` da categoria (e o do
      clube) deverá orientar **quem compete onde** (uso ainda não implementado).

## Atletas (regens)

- [ ] **Quantidade de atletas por simulação é de teste.** Hoje geramos **100**
      atletas ao iniciar a simulação (`ATHLETE_GENERATION_CONFIG.count` em
      `athletes.js`), distribuídos entre clubes e agentes livres pelo seed de
      teste. Esse número é apenas para nossos testes — depois precisará mudar
      (provavelmente derivado dos campeonatos/países/vagas).
- [ ] **Faixa de idade do exemplo inicial.** O gerador suporta **12–40 anos**
      (`ATHLETE_AGE_LIMITS`), mas neste exemplo geramos só **18–35**
      (`ATHLETE_GENERATION_CONFIG.minAge/maxAge`). Rever depois.
- [ ] **Lógica de melhoria e decréscimo de Força/Potencial.** Ainda não existe.
      O `potential` já é o teto de crescimento da `strength`, mas a evolução
      (subir com treino/idade e cair depois do pico) ainda será criada.
- [x] **Ritmo (forma) como modificador de resultados.** Criado o atributo `ritmo`
      (0–100): inicia baixo no ano, sobe ao competir e cai parado (inicial/ganho/
      queda dependem da Preparação Física); entra na Força efetiva como redutor de
      forma somado ao da fadiga (`formPenaltyPerPoint`), sem remover Força/fadiga.
      Reinicia na virada de ano. UI do atributo ainda pendente (ver Atletas — UI).
- [x] **Cansaço: desgaste e recuperação.** Feito: o Cansaço **cai** ao competir
      (`applyStageFatigue`, por etapa) e **recupera** nos dias de descanso
      (`fatigueRecoveryForRestDay`/`applyRestDay`, por dia, rumo a 100). A
      orquestração é dia a dia em `participation.js` (`processDay`, via
      `advanceDays`). `fatigue` virou número real (a UI arredonda).
- [ ] **Atletas de outros países.** Já existe a **Argentina** (`ARG`), mas só o
      país + atributos básicos — **sem cidades/clubes/atletas** ainda; por isso
      todos os atletas seguem brasileiros. Ao dar cidades/clubes à Argentina,
      gerar e distribuir a origem dos seus atletas.
- [ ] **Variar o esporte favorito dos regens.** O campo `favoriteSportId` já
      existe e é atribuído na geração (`INITIAL_FAVORITE_SPORT_ID` em
      `athletes.js`), mas por ora **todos nascem com Atletismo**. Depois, sortear
      entre os esportes (provavelmente ponderando por popularidade). Estender a
      ligação também para **modalidades** (modalidade favorita/praticada).
- [x] **Esporte favorito na UI de Atletas.** Feito: exibido como linha "Esporte
      favorito" ao expandir o atleta (`<details>`).

## Atletas — UI

- [x] **Aba Atletas (lista por país).** Feita: seletor de país + lista de atletas
      (nome, idade, Força) expansível para os demais atributos.
- [ ] **Barras/visual dos atributos** (Força, Potencial, Preparação, Cansaço) —
      hoje são apenas números.
- [x] **Exibir o Ritmo (forma) na UI de Atletas.** Feito: linha "Ritmo N/100" ao
      expandir o atleta.

## Clubes

- [x] **Elo atleta ↔ clube (contratos).** Criado `contracts.js`: o vínculo se dá
      por contrato de duração anual (1/2/3), com assinatura (`signContract`, só
      agente livre), renovação pelo clube (`renewContract`) e expiração →
      **pool de agentes livres**. Situação derivada das datas. **Só a estrutura,
      sem UI.** Ver `PRINCIPIOS_CONTRATOS.md`.
- [x] **UI de contratos (parte 1).** Feito: aba Clubes tem o link "Atletas do
      clube" (elenco contratado, nomes clicáveis → perfil do atleta) e a aba
      Atletas mostra o "Clube atual" de cada atleta.
- [x] **UI de contratos (parte 2).** Feito: elenco do clube mostra **duração,
      término e "renovado"**; nova lista de **agentes livres** na aba Clubes; e as
      abas Clubes/Atletas são **reativas à passagem de tempo** (contratos
      expiram/entram em vigor e as telas se atualizam).
- [ ] **Substituir os contratos de TESTE.** `seedTestContracts` (assinatura no
      início a um clube sorteado **ponderando pela infraestrutura** — mais infra,
      mais atletas — **e pela afinidade com a cidade de nascimento** — chance bem
      maior de ir a um clube da sua cidade — via `pickClubForAthlete`, deixando
      ~25% como agentes livres via `TEST_FREE_AGENT_RATE`) é temporário, só para as
      telas terem dados. Trocar pelo fluxo real de contratação.
- [ ] **Assinaturas iniciais / quem assina quem.** Definir como os clubes montam
      elenco no início e ao longo do tempo (regras de contratação — provavelmente
      ligadas a prestígio e finanças), substituindo o seeding de teste.
- [ ] **Decisão de renovar (lógica do clube).** `renewContract` existe, mas
      **quando/por que** um clube renova (ou deixa expirar) ainda não foi definido.
- [x] **Inscrição de atletas via clube nas etapas (versão de teste).** Feito em
      `participation.js`: participantes = atletas com contrato ativo em clubes do
      país (regra de teste "todos"), e a fadiga é aplicada aos participantes. A
      lógica **real** de cadastro está na seção de prioridade média. Falta ainda
      **resolver o resultado** da etapa (ver Modalidades/Engine).
- [ ] **Presidente.** Campo `president` já existe na entidade, mas ainda **não é
      utilizado**.
- [ ] **Finanças.** Campo `finances` já existe na entidade, mas ainda **não é
      utilizado**.
- [ ] **Rivais.** Campo `rivals` (clubes rivais) criado vazio — evoluir depois
      (rivalidades, efeitos, etc.).
- [ ] **Sistema de evolução de atletas via infraestrutura.** O
      `infrastructureLevel` do clube (0–100, ligado à força olímpica do país)
      servirá de base para a evolução dos atletas — sistema ainda **não** criado.
- [ ] **Expandir/revisar a database de clubes.** Hoje são **22 clubes reais**,
      todos do Brasil (10 iniciais + 2 por cidade que não tinha clube), de modo que
      **toda cidade da database tem clube**. Revisar/ampliar depois, inclusive com
      clubes de **outros países** (ex.: Argentina) quando eles tiverem cidades.
- [x] **UI dos clubes (lista por país).** Feita: seletor de país + lista de
      clubes (nome, país, prestígio) expansível para as demais informações.
- [x] **Atributo de Prestígio do clube.** Criado: `prestige` (0-100) em todos os
      clubes, com valores iniciais aproximados, e exibido na aba Clubes. O **uso**
      do prestígio está na seção de prioridade alta, no topo deste arquivo.

## Interface — organização/ordenação

- [ ] **Organizador/ordenador nas telas de Clubes e Atletas.** Permitir ordenar
      as listas por diferentes critérios (ex.: **prestígio**, **local/cidade**,
      idade, força, etc.). **Apenas documentado por enquanto — lógica ainda não
      implementada.**

## Cidades

- [ ] **10 cidades por país é número de teste.** Hoje cada país implantado tem só
      **10 cidades** (`cities.js`); ampliar depois (ver `PRINCIPIOS_CIDADES.md`).
- [ ] **Gerador de cidades (opcional).** Hoje as cidades são uma database à mão;
      um gerador futuro poderia calcular `sportsInfrastructure` a partir da força
      olímpica + tamanho.
- [ ] **UI das cidades.** Ainda não existe tela para cidades (próximo passo).
- [ ] **Cidades nas etapas de campeonatos.** Expandir o uso de cidades para as
      etapas (cada etapa acontecer em uma cidade-sede). **Apenas documentado por
      enquanto — lógica ainda não implementada.**

## Esportes

- [ ] **Esporte afeta o uso dos atributos na simulação de resultados.** A entidade
      `sports.js` já existe, mas a lógica de **como cada esporte usa/pondera os
      atributos dos atletas** para simular resultados ainda **não foi criada**.
      Liga-se à **mecânica de ResultSystem** (prioridade alta, no topo).
- [x] **Vincular campeonatos a um esporte** (`sportId`). Feito: campo `sportId` na
      entidade Campeonato + helper `getChampionshipSport`; o `CNA-2026` aponta para
      o Atletismo. As etapas herdam o esporte do seu campeonato.
- [x] **Criar os esportes olímpicos.** Feito: `sports.js` passou de 6 para **36
      esportes** (a lista olímpica pedida), cada um com o campo **`resultSystems`**
      (indicador dos ResultSystem, conforme a tabela). Dados (descrição,
      popularidade, ano de início, origem) são **aproximações** — revisar depois.
- [ ] **`resultSystems` é só indicador (sem mecânica).** Ver o item de **prioridade
      alta** "Criar a mecânica de ResultSystem" no topo.
- [ ] **UI dos esportes.** Ainda não existe tela para esportes.

## Modalidades

- [ ] **Popularidade por país da modalidade.** O campo `countryPopularity` faz
      parte da entidade, mas a **relação modalidade ↔ país** ainda **não foi
      feita** — construir depois.
- [ ] **Popular a database de modalidades.** Já existe a **100 m rasos**; criar as
      demais modalidades (ex.: outras provas do Atletismo) quando solicitado, cada
      uma com sua `resolution` e `performance`.
- [x] **UI de resultados de uma etapa.** Feito: na aba Campeonatos, a etapa
      realizada tem o link "Ver" que abre a classificação (posição, atleta,
      resultado). Falta ainda a **UI das modalidades** em si (lista/detalhe das
      provas).
- [ ] **Modalidade por etapa.** Hoje todas as etapas do campeonato disputam a
      **mesma** modalidade (a primeira de `championship.modalities`,
      `getStageModality`). Depois, permitir que cada etapa seja uma prova
      diferente (várias modalidades ao longo do campeonato).
- [x] **Participação atleta ↔ etapa (versão de teste).** Feito em
      `participation.js`: `getStageParticipants` define quem disputa cada etapa
      (regra de teste "todos os contratados via clube"), o **resultado é resolvido
      e travado** ao realizar a etapa (`processStage` + `resolveModality`) e a
      fadiga é aplicada aos participantes. Falta só a mecânica **real** de cadastro
      (prioridade média).
- [ ] **Modelos de desempenho por métrica.** O modelo atual cobre **tempo**
      (100 m). Distância/altura/pontos precisarão de suas próprias fórmulas.

## Engine de resultados

- [ ] **Ligar esporte ↔ engine.** Definir, para cada esporte/prova, o objeto de
      parâmetros da `ResultsEngine` (métrica, direção, agregação, precisão). A
      engine é genérica; falta a camada que traduz cada esporte para esses
      parâmetros.
- [ ] **Gerar resultados a partir dos atributos.** A engine só **resolve** (ranqueia)
      números prontos; falta a lógica que **produz** o número de cada atleta a
      partir dos seus atributos (força, potencial, cansaço, etc.) para então
      entregar à engine.
### Extensões da engine (implantar uma por vez, nesta ordem a combinar)

- [ ] **Regras de desempate.** Como resolver empates além de compartilhar posição
      (ex.: melhor tentativa seguinte / countback, tempo de reação, sorteio).
- [ ] **Conversão desempenho → pontos.** Tabela/fórmula para transformar um
      resultado (tempo/distância) em pontos (útil para provas combinadas, p. ex.
      decatlo).
- [ ] **Rodadas/qualificação.** Estrutura de fases (eliminatórias, semifinais,
      final) e critério de quem avança em cada rodada.
- [ ] **Variância/aleatoriedade.** Parâmetros de dispersão (margem de acaso) na
      resolução, para o favorito não vencer sempre.
