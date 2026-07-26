# Princípios dos contratos (Atleta ↔ Clube)

Regras que guiam o **elo entre atletas e clubes** (`contracts.js`). O vínculo se
dá **por contrato**; este documento fixa as regras da mecânica.

## O elo

- Um atleta se liga a um clube **apenas por um contrato**. Fora de um contrato
  ativo, o atleta é um **agente livre**.
- **Um vínculo por vez**: um atleta não pode ter dois contratos ativos ao mesmo
  tempo (`signContract` recusa assinar quem já tem contrato ativo).
- O **clube de um atleta é derivado** do seu contrato ativo (`getAthleteClub`) —
  não é guardado no atleta nem no clube, para não duplicar o elo.

## Duração

- A duração é **estipulada logo no início** do contrato e é **sempre anual**:
  **1, 2 ou 3 anos** (`CONTRACT_DURATIONS = [1, 2, 3]`).
- A data de término é **derivada**: `endDate = startDate + durationYears`
  (`contractEndDate`). Não é digitada à mão.

## Situação (ativo / encerrado)

- É **derivada das datas**, sem campo de status e sem datas fixas no código
  (mesmo princípio de `isStageDone`).
- Um contrato está **ativo** no intervalo `[startDate, endDate)`: do dia de
  início (inclusive) até a **véspera** do término. **No dia do término já está
  encerrado.**

## Fim do contrato: renovar ou expirar

Ao chegar o término, há dois caminhos:

1. **Renovação pelo clube** (`renewContract`): cria um **novo termo** para o
   mesmo atleta e o mesmo clube, começando **exatamente quando o atual termina**
   (sem lacuna e sem sobreposição), com nova duração anual (1/2/3). O contrato
   anterior permanece no **histórico**; o vínculo passa a ser o novo (que aponta
   para o anterior via `renewalOf`).
2. **Expiração**: se ninguém renova, o contrato simplesmente termina (a data de
   referência passa do `endDate`) e o atleta volta ao **pool de agentes livres**.
   Não é preciso ação nem marcação — é o estado derivado das datas.

## Escopo atual (o que existe e o que não existe)

- **Estrutura/mecânica** pronta e **UI**: a aba Clubes lista os atletas
  contratados (link "Atletas do clube") com **duração e término** de cada
  contrato, além de uma seção de **Agentes livres**; a aba Atletas mostra o clube
  atual de cada atleta. As telas são **reativas à passagem de tempo**.
- **Dados de teste**: para as telas terem o que mostrar, `seedTestContracts`
  assina, no início da simulação, a maioria dos atletas a um clube do país
  **sorteado ponderando por (1) nível de infraestrutura** (clubes mais
  estruturados recebem mais atletas; menos estruturados, menos) **e (2) afinidade
  com a cidade de nascimento** (chance bem maior de ir a um clube da própria
  cidade) — via `pickClubForAthlete`, com duração anual sorteada, deixando uma
  fração (`TEST_FREE_AGENT_RATE`, hoje 25%) como **agente livre**. A afinidade de
  cidade é só um **peso**: não garante o clube local e **não** impede o atleta de
  ficar sem clube (a agência livre é decidida à parte, antes da escolha do clube).
  É **temporário** — não é um fluxo real; será substituído pelas regras de
  contratação.
- A **quem/como** os clubes assinam e a **decisão de renovar** (lógica do clube)
  ainda **não** existem — este módulo apenas oferece as operações do elo e um
  povoamento de teste. Ver `TODO.md`.
