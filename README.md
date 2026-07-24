# Olympiad

Calendário mensal simples em HTML, CSS e JavaScript (sem dependências).

## Recursos

- Inicia em **01/01/2026**.
- Exibe o mês inteiro em grade (domingo a sábado).
- Navegue entre meses anteriores e posteriores pelas **setas** (`‹` / `›`) ou pelas teclas de seta do teclado.
- Tema claro/escuro automático conforme a preferência do sistema.

## Sistema de passagem de tempo

- A simulação começa em **01/01/2026** e usa o **dia** como unidade de tempo.
- **+ 1 dia**: avança um dia.
- **+ 1 semana**: avança sete dias (mesma unidade de tempo).
- A data atual da simulação é destacada no calendário, que **acompanha** a passagem do tempo (vira mês/ano automaticamente).
- **Ir para a data atual**: retorna a visualização ao mês da data simulada, caso você tenha navegado para outro mês.

## Abas

A interface tem duas abas:

- **Calendário** — o calendário com passagem de tempo; as datas de etapas dos campeonatos aparecem marcadas (ponto laranja) nos dias correspondentes.
- **Campeonatos** — mostra o campeonato selecionado, com um seletor para futuros campeonatos. Cada etapa **realizada** tem o link **"Ver"** que abre a classificação (posição, atleta e resultado, ex.: tempo dos 100 m).
- **Atletas** — seletor por país; lista os atletas daquele país (nome, idade e Força), com clique para expandir e ver todos os atributos (incluindo o **Clube atual**, ou "Agente livre").
- **Clubes** — seletor por país; lista os clubes daquele país (nome, país e prestígio), com clique para expandir e ver as demais informações. No detalhe do clube há o link **"Atletas do clube"**, que mostra os atletas contratados (nome + **duração e término do contrato**; nomes clicáveis que levam ao perfil do atleta). Abaixo dos clubes, a lista de **Agentes livres** do país. As telas são reativas à passagem de tempo (contratos expiram/entram em vigor).

## Entidades (dados)

- **`countries.js`** — entidade **Países**. Cada país tem `id`, `nome`, `população` e um rating de **Força Olímpica** (0–100). Já inclui o **Brasil** (`BRA`).
- **`championships.js`** — entidade **Campeonatos**. Cada campeonato tem `id` única, `nome`, `participantes`, `país` (referência a `countries.js`), **`esporte`** (`sportId`, referência a `sports.js`), **`categoria`** (`categoryId`, referência a `competitionCategories.js`), `eventos`, `modalidades`, `competidores` e `etapas`. O `CNA-2026` está vinculado ao Atletismo e à categoria **Nacional**.
  - Campeonato inicial: **Campeonato Nacional de Atletismo** (`CNA-2026`), Brasil, 0 participantes.
  - **10 etapas**, sempre no **segundo sábado de cada mês**, começando no segundo sábado de janeiro/2026.
- **`competitionCategories.js`** — entidade **Categorias de Competição**: os **níveis/tiers** do calendário (Regional → Olímpico), cada um com `level`, `scope` (subnacional/nacional/internacional), `prestígio` e `pontos de ranking`. Database **global** (serve todos os países); a competição aponta para a categoria via `categoryId`. A **premiação** (dinheiro) é só referência (sistema financeiro futuro). Desenho completo em **`CALENDARIO_DE_COMPETICOES.md`**.
- **`athletes.js`** — entidade **Atletas** + gerador de "regens" (nome, país/COI, idade, Força, Potencial, Preparação Física, Cansaço e **esporte favorito**). Ao iniciar a simulação, gera 100 atletas (número de teste — ver `TODO.md`), distribuídos entre os clubes e agentes livres. Todo regen nasce com um esporte favorito (ver `sports.js`); neste início, todos com Atletismo. O **Cansaço** cai ao competir e **se recupera** nos dias de descanso (energia: 100 = descansado). O **Ritmo** (forma) começa baixo no início do ano, sobe competindo e cai parado (inicial/ganho/queda dependem da Preparação Física); ele **modifica a resolução de resultados** (redutor de forma somado ao da fadiga, sem remover Força/fadiga). É exibido na aba Atletas ao expandir o atleta.
- **`clubs.js`** — entidade **Clubes**: database inicial com 10 clubes reais de tradição no atletismo (id, país, cidade-sede, presidente, ano de fundação, nível de infraestrutura, prestígio, finanças e rivais). Sem gerador e ainda sem tela; os clubes inscreverão atletas nas competições (mecânica futura — ver `TODO.md`).
- **`contracts.js`** — entidade **Contratos**: o **elo Atleta ↔ Clube**. O vínculo se dá por contrato de duração anual (1, 2 ou 3 anos), estipulada no início; ao término, o clube pode renovar ou o contrato expira e o atleta vai para o **pool de agentes livres**. Situação (ativo/encerrado) derivada das datas. As telas de Clubes/Atletas já exibem o elo (atletas do clube / clube do atleta); no início a lista é povoada com contratos de **teste** (`seedTestContracts`), a serem substituídos pelo fluxo real. Regras em `PRINCIPIOS_CONTRATOS.md`.
- **`regions.js`** / **`states.js`** — entidades **Regiões** e **Estados**, formando a hierarquia **país → região → estado → cidade**. Regiões: as 5 do Brasil. Estados: os 10 das cidades cadastradas (sigla, país e região), cobrindo as 5 regiões (as 27 UFs virão depois — ver `TODO.md`). São a base dos portes **Regional** e **Estadual** do calendário.
- **`cities.js`** — entidade **Cidades**: database inicial com 10 cidades reais do Brasil (id, país, **estado**, população/tamanho, infraestrutura esportiva). Vincula-se a países, **estados**, clubes (cidade-sede) e atletas (cidade de nascimento). Regras em `PRINCIPIOS_CIDADES.md`.
- **`sports.js`** — entidade **Esportes**: database inicial com 6 esportes (id, nome, descrição, popularidade geral, ano de início da prática, país originário). Definirá como os atributos dos atletas são usados na simulação de resultados (lógica futura — ver `TODO.md`). Ainda sem tela.
- **`resultsEngine.js`** — **engine de resolução de resultados** (`ResultsEngine`): módulo genérico que não conhece os esportes; expõe parâmetros de simulação (métrica, direção de vitória, agregação, unidade, precisão) e resolve o ranking de resultados numéricos. Ver `DOCUMENTACAO.md`.
- **`participation.js`** — **participação atleta ↔ etapa**: define quais atletas disputam cada etapa (por ora, regra de **teste**: cada clube inscreve todos os seus atletas em todas as etapas), **resolve e trava o resultado** de cada etapa realizada (via `resolveModality`) e aplica a **fadiga** aos participantes. A mecânica real de cadastro é prioridade média (ver `TODO.md`).
- **`modalities.js`** — entidade **Modalidades**: variações de prática de um esporte (id, nome, esporte primário, forma de resolução, modelo de desempenho, popularidade geral e por país). Já inclui os **100 m rasos** do Atletismo, com o cálculo de tempo (Força − fadiga → tempo, tendo o recorde 9,58 s como piso). Sem tela ainda. Ver `TODO.md`.

Consulte **`DOCUMENTACAO.md`** (controle do projeto), **`TODO.md`** (pendências) e
**`CALENDARIO_DE_COMPETICOES.md`** (desenho do calendário de competições).

## Como usar

Abra o arquivo `index.html` em qualquer navegador.
