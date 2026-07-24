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

- **Estrutura/mecânica** pronta e uma **UI parcial**: a aba Clubes lista os
  atletas contratados (link "Atletas do clube") e a aba Atletas mostra o clube
  atual de cada atleta. Uma tela mais completa (durações, término, agentes
  livres) segue no `TODO.md`.
- **Dados de teste**: para as telas terem o que mostrar, `seedTestContracts`
  assina, no início da simulação, cada atleta a um clube aleatório do país (com
  duração anual sorteada). É **temporário** — a lista de contratos não é mais uma
  database à mão nem um fluxo real; será substituído pelas regras de contratação.
- A **quem/como** os clubes assinam e a **decisão de renovar** (lógica do clube)
  ainda **não** existem — este módulo apenas oferece as operações do elo e um
  povoamento de teste. Ver `TODO.md`.
