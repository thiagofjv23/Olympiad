# Diário de Trabalho

Registro do que foi **implantado no jogo**, separado por data. Atualizado
**apenas quando instruído**, ao final de cada dia de trabalho. Durante o dia, os
demais documentos (`DOCUMENTACAO.md`, `TODO.md`, `DECISOES.md`, etc.) continuam
sendo atualizados normalmente.

---

## 23/07/2026

Primeiro dia de trabalho. Do repositório vazio até um esqueleto de simulador
esportivo (atletismo). Entregas do dia:

### Calendário e tempo
- **Calendário mensal** iniciando em 01/01/2026, com navegação por setas
  (e teclado) entre meses anteriores/posteriores.
- **Sistema de passagem de tempo** (unidade: dia), com botões **+1 dia** e
  **+1 semana**; a data da simulação é destacada e o calendário a acompanha.

### Campeonatos e etapas
- **Entidade Países** (`countries.js`) com o **Brasil** (id, nome, COI, população,
  força olímpica 0–100).
- **Entidade Campeonatos** (`championships.js`): **Campeonato Nacional de
  Atletismo** com **10 etapas** no 2º sábado de cada mês (a partir de jan/2026).
- **Abas** Calendário e Campeonatos; etapas marcadas no calendário nas datas certas.
- **Lógica de realização das etapas**: etapa vira "Realizada" (✓) ao chegar a data;
  status e progresso refletidos na UI e reativos à passagem de tempo.
- **Dias clicáveis**: mostram os eventos do dia; clicar num evento leva ao
  campeonato e destaca a etapa.

### Atletas
- **Entidade Atletas + gerador de "regens"** (`athletes.js`): nome, país/COI,
  idade, Força, Potencial, Preparação Física e Cansaço; 10 atletas por simulação.
- **Aba Atletas** (lista por país, expansível).
- Refinos de geração: **nascimento ponderado pelo tamanho da cidade**;
  **infraestrutura da cidade** influencia Força/Potencial; **idade** define a
  distância Força↔Potencial (jovem cresce mais; veterano já no teto).

### Clubes
- **Entidade Clubes** (`clubs.js`): database de 10 clubes reais; id, país,
  cidade-sede, presidente, ano de fundação, infraestrutura, **prestígio**,
  finanças e rivais.
- **Aba Clubes** (lista por país, expansível); cidade ao lado do país.

### Cidades
- **Entidade Cidades** (`cities.js`): 10 cidades reais do Brasil; população/tamanho
  (derivado) e infraestrutura esportiva. Vinculada a países, clubes (sede) e
  atletas (nascimento). Regras em `PRINCIPIOS_CIDADES.md`.

### Esportes, engine e modalidades
- **Entidade Esportes** (`sports.js`): database de 6 esportes.
- **Engine de resolução de resultados** (`resultsEngine.js`): genérica, só
  parâmetros (métrica, direção de vitória, agregação, unidade, precisão) e ranking.
- **Entidade Modalidades** (`modalities.js`): ligada a esporte; criada a
  **100 m rasos** com modelo de tempo (Força − fadiga → tempo; recorde 9,58 s como
  piso) e resolução via engine.

### Documentação e processo
- Criados os documentos de controle: `DOCUMENTACAO.md`, `TODO.md`, `DECISOES.md`,
  `PRINCIPIOS_CIDADES.md`.
- Diretriz registrada: **não criar exemplos/dados não solicitados**.
- Total: **19 etapas** de desenvolvimento (ver histórico em `DOCUMENTACAO.md`).
