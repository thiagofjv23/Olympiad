# TO DO — Pendências e decisões temporárias

Lista de coisas deixadas para depois, com contexto do porquê. Referenciada pela
`DOCUMENTACAO.md`.

## 🔴 Prioridade alta

- [ ] **Usar o Prestígio dos clubes.** O atributo `prestige` (0-100) já existe em
      todos os clubes (`clubs.js`) com valores iniciais aproximados, **mas ainda
      não é utilizado**. Ele será a base das próximas features:
  - **Finanças** dos clubes.
  - **Contratações** (de atletas).
  - **Ordenamento de clubes** (ranking/classificação).

## Atletas (regens)

- [ ] **Quantidade de atletas por simulação é de teste.** Hoje geramos **10**
      atletas ao iniciar a simulação (`ATHLETE_GENERATION_CONFIG.count` em
      `athletes.js`). Esse número é apenas para nossos testes — depois precisará
      mudar (provavelmente derivado dos campeonatos/países/vagas).
- [ ] **Faixa de idade do exemplo inicial.** O gerador suporta **12–40 anos**
      (`ATHLETE_AGE_LIMITS`), mas neste exemplo geramos só **18–35**
      (`ATHLETE_GENERATION_CONFIG.minAge/maxAge`). Rever depois.
- [ ] **Lógica de melhoria e decréscimo de Força/Potencial.** Ainda não existe.
      O `potential` já é o teto de crescimento da `strength`, mas a evolução
      (subir com treino/idade e cair depois do pico) ainda será criada.
- [x] **Aplicar o Cansaço nas etapas (mecanismo de aplicação).** Criado
      `applyStageFatigue(athlete)` (individual, desacoplado de clube) e
      `applyStageFatigueToParticipants(list)`. Falta apenas **chamar** para os
      atletas que de fato **participarem** de cada etapa — o que depende do vínculo
      atleta ↔ etapa (inscrição via clube), ainda inexistente. Quando ele existir,
      basta passar os participantes; o desgaste já é individual.
- [ ] **Atletas de outros países.** Hoje só existe o Brasil (`BRA`); por isso
      todos os atletas são brasileiros. Ao adicionar países, distribuir a origem.
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

## Clubes

- [x] **Elo atleta ↔ clube (contratos).** Criado `contracts.js`: o vínculo se dá
      por contrato de duração anual (1/2/3), com assinatura (`signContract`, só
      agente livre), renovação pelo clube (`renewContract`) e expiração →
      **pool de agentes livres**. Situação derivada das datas. **Só a estrutura,
      sem UI.** Ver `PRINCIPIOS_CONTRATOS.md`.
- [x] **UI de contratos (parte 1).** Feito: aba Clubes tem o link "Atletas do
      clube" (elenco contratado, nomes clicáveis → perfil do atleta) e a aba
      Atletas mostra o "Clube atual" de cada atleta.
- [ ] **UI de contratos (parte 2).** Ainda a fazer: mostrar **duração/término**
      do contrato, tela/lista de **agentes livres** e uma visão mais completa do
      elenco (datas, renovação). Reatividade dessas telas à passagem de tempo.
- [ ] **Substituir os contratos de TESTE.** `seedTestContracts` (assinatura
      aleatória no início) é temporário, só para as telas terem dados. Trocar pelo
      fluxo real de contratação.
- [ ] **Assinaturas iniciais / quem assina quem.** Definir como os clubes montam
      elenco no início e ao longo do tempo (regras de contratação — provavelmente
      ligadas a prestígio e finanças), substituindo o seeding de teste.
- [ ] **Decisão de renovar (lógica do clube).** `renewContract` existe, mas
      **quando/por que** um clube renova (ou deixa expirar) ainda não foi definido.
- [ ] **Inscrição de atletas via clube nas etapas.** Com o elo pronto, um atleta
      só disputa uma etapa através do seu clube: falta ligar **contrato ativo →
      participação na etapa** (e então resolver o resultado e aplicar a fadiga aos
      participantes via `applyStageFatigueToParticipants`).
- [ ] **Presidente.** Campo `president` já existe na entidade, mas ainda **não é
      utilizado**.
- [ ] **Finanças.** Campo `finances` já existe na entidade, mas ainda **não é
      utilizado**.
- [ ] **Rivais.** Campo `rivals` (clubes rivais) criado vazio — evoluir depois
      (rivalidades, efeitos, etc.).
- [ ] **Sistema de evolução de atletas via infraestrutura.** O
      `infrastructureLevel` do clube (0–100, ligado à força olímpica do país)
      servirá de base para a evolução dos atletas — sistema ainda **não** criado.
- [ ] **Expandir/revisar a database de clubes.** Começamos com 10 clubes reais
      (todos do Brasil) apenas para teste; ampliar e revisar depois, inclusive
      com clubes de outros países quando existirem.
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
- [ ] **Vincular campeonatos/etapas a um esporte** (`sportId`), para saber qual
      esporte cada competição disputa.
- [ ] **Expandir a database de esportes** e revisar dados (popularidade é
      aproximada).
- [ ] **UI dos esportes.** Ainda não existe tela para esportes.

## Modalidades

- [ ] **Popularidade por país da modalidade.** O campo `countryPopularity` faz
      parte da entidade, mas a **relação modalidade ↔ país** ainda **não foi
      feita** — construir depois.
- [ ] **Popular a database de modalidades.** Já existe a **100 m rasos**; criar as
      demais modalidades (ex.: outras provas do Atletismo) quando solicitado, cada
      uma com sua `resolution` e `performance`.
- [ ] **UI das modalidades e de resultados.** Ainda não há tela para modalidades
      nem para exibir os resultados/tempos de uma etapa.
- [ ] **Participação atleta ↔ etapa.** O `resolveModality` já resolve o ranking a
      partir de uma lista de atletas e a aplicação individual de fadiga já existe
      (`applyStageFatigueToParticipants`); falta definir **quais** atletas (via
      clube) disputam cada etapa para então resolver o resultado e desgastar os
      participantes.
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
