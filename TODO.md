# TO DO — Pendências e decisões temporárias

Lista de coisas deixadas para depois, com contexto do porquê. Referenciada pela
`DOCUMENTACAO.md`.

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

## Próximo passo combinado

- [ ] **Telas dos atletas.** A UI dos atletas é o próximo passo (este commit só
      criou a entidade e o gerador, sem nenhuma tela).
