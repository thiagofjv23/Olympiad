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
- [ ] **Aplicar o Cansaço nas etapas.** A fórmula já existe
      (`fatigueReductionForStage`), mas só deve reduzir o cansaço dos atletas que
      **participarem** de cada etapa — falta o vínculo atleta ↔ etapa
      (participação), que virá com as próximas telas/entidades.
- [ ] **Atletas de outros países.** Hoje só existe o Brasil (`BRA`); por isso
      todos os atletas são brasileiros. Ao adicionar países, distribuir a origem.

## Atletas — UI

- [x] **Aba Atletas (lista por país).** Feita: seletor de país + lista de atletas
      (nome, idade, Força) expansível para os demais atributos.
- [ ] **Barras/visual dos atributos** (Força, Potencial, Preparação, Cansaço) —
      hoje são apenas números.

## Clubes

- [ ] **Inscrição de atletas via clube.** Os clubes serão responsáveis por
      inscrever atletas nas competições — um atleta só entra numa competição
      através de um clube. A mecânica de inscrição (vínculo atleta ↔ clube ↔
      etapa) ainda não existe.
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
