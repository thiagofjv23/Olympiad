# Diário de Trabalho

Registro do que foi **implantado no jogo**, separado por data. Atualizado
**apenas quando instruído**, ao final de cada dia de trabalho. Durante o dia, os
demais documentos (`DOCUMENTACAO.md`, `TODO.md`, `DECISOES.md`, etc.) continuam
sendo atualizados normalmente.

---

## 24/07/2026

Segundo dia. Foco em **ligações** (atleta ↔ esporte, atleta ↔ clube, atleta ↔
etapa), no **ciclo competitivo** (participação → resultado → fadiga) e num novo
atributo de forma. Entregas do dia:

### Atletas ↔ esportes
- **Esporte favorito** (`favoriteSportId`) em todo regen (por ora, todos com
  Atletismo), exibido ao expandir o atleta.

### Contratos (elo Atleta ↔ Clube)
- **Entidade Contratos** (`contracts.js`): vínculo por contrato de duração anual
  (1/2/3), com assinatura (só agente livre), **renovação** pelo clube e
  **expiração** → pool de **agentes livres**. Situação derivada das datas. Regras
  em `PRINCIPIOS_CONTRATOS.md`.
- **UI**: link **"Atletas do clube"** no detalhe do clube (elenco com **duração e
  término** do contrato; nomes clicáveis → perfil do atleta); **Clube atual** na
  aba Atletas; lista de **Agentes livres**; tudo **reativo à passagem de tempo**.
- Contratos de **teste** (`seedTestContracts`) para as telas terem dados (~25%
  ficam agentes livres) — a substituir pelo fluxo real.

### Campeonatos, participação e resultados
- **Campeonato ↔ esporte** (`sportId`; CNA-2026 = Atletismo) e ↔ **modalidade**
  (100 m).
- **Participação atleta ↔ etapa** (`participation.js`): regra de **teste** — cada
  clube inscreve todos os seus atletas (contratados) em todas as etapas.
- **Resultados das etapas**: ao realizar a etapa, o ranking é **resolvido e
  travado** (`resolveModality`) e exibido na aba Campeonatos (coluna **"Ver"** →
  posição, atleta, tempo).

### Cansaço e Ritmo
- **Cansaço reformulado**: além de cair ao competir, **recupera** nos dias de
  descanso (rumo a 100). Passagem de tempo virou **dia a dia** (`processDay`).
- **Novo atributo Ritmo** (forma, 0–100): começa baixo no ano, sobe ao competir,
  cai parado (inicial/ganho/queda dependem da Preparação Física; reinicia na
  virada de ano). Entra na resolução como **redutor de forma** somado ao da
  fadiga (Força e fadiga **mantidas**). Exibido na aba Atletas.

### Documentação e processo
- Novos documentos: `contracts.js`, `participation.js`, `PRINCIPIOS_CONTRATOS.md`.
- **10 etapas** de desenvolvimento no dia (20 a 29 — ver histórico em
  `DOCUMENTACAO.md`).

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
