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

A interface tem as seguintes abas:

- **Calendário** — o calendário com passagem de tempo; as datas de etapas dos campeonatos aparecem marcadas (ponto laranja) nos dias correspondentes.
- **Campeonatos** — mostra o campeonato selecionado, com um seletor para futuros campeonatos. Cada etapa **realizada** tem o link **"Ver"** que abre a classificação (posição, atleta e resultado, ex.: tempo dos 100 m).
- **Atletas** — seletor por país; lista os atletas daquele país (nome, idade e Força), com clique para expandir e ver todos os atributos (incluindo o **Clube atual**, ou "Agente livre").
- **Clubes** — seletor por país; lista os clubes daquele país (nome, país e prestígio), com clique para expandir e ver as demais informações. No detalhe do clube há o link **"Atletas do clube"**, que mostra os atletas contratados (nome + **duração e término do contrato**; nomes clicáveis que levam ao perfil do atleta). Abaixo dos clubes, a lista de **Agentes livres** do país. As telas são reativas à passagem de tempo (contratos expiram/entram em vigor).
- **Rankings** — ao abrir, o jogador escolhe qual ranking ver: **Pontos** ou **Marcas** (da temporada corrente).
  - **Pontos**: posição, atleta, clube, **etapas disputadas** e **pontos** (por etapa, conforme a **categoria/tier** do campeonato — maiores valem mais).
  - **Marcas**: por evento (100 m), só a **melhor marca** do atleta na temporada — posição, atleta, clube, **data** (clicável: mostra data, campeonato e etapa) e a **marca**.
  - Ambos **atualizam a cada etapa**; na virada de ano são arquivados (histórico para uso posterior).
- **Esportes** — lista os esportes em **ordem alfabética**; cada esporte é clicável e **expande** (via `<details>`) para os seus **atributos** (ID, descrição, popularidade, início da prática, país de origem, ResultSystems e nº de modalidades) e as suas **modalidades** (também em `<details>`, com **atributos**: ID, esporte, nº de eventos), e cada modalidade expande para os seus **eventos** (também `<details>`, com **atributos**: ID, modalidade, esporte, **modelo de resultado** e popularidade). É a hierarquia **Esporte → Modalidade → Evento**. A tela **reconhece automaticamente** novos esportes/modalidades/eventos adicionados às databases (sem lista fixa).

## Entidades (dados)

- **`countries.js`** — entidade **Países**. Cada país tem `id`, `nome`, `população` e um rating de **Força Olímpica** (0–100). Inclui o **Brasil** (`BRA`) e a **Argentina** (`ARG`, só o país + atributos básicos por ora — cidades/clubes/atletas ficam para depois).
- **`championships.js`** — entidade **Campeonatos**. Cada campeonato tem `id` única, `nome`, `participantes`, `país` (referência a `countries.js`), **`esporte`** (`sportId`, referência a `sports.js`), **`categoria`** (`categoryId`, referência a `competitionCategories.js`), `eventos`, `modalidades`, `competidores` e `etapas`. O `CNA-2026` está vinculado ao Atletismo e à categoria **Nacional**.
  - **Calendário do Brasil** (16 campeonatos, gerados a partir da geografia): **Nacional** (`CNA-2026`, 2º sábado), **10 Estaduais** (um por estado com cidade na base, 1º sábado) e **5 Regionais** (um por região com cidade, 3º sábado). Cada campeonato tem um `scope` (país/região/estado) que **trava a inscrição** (ver `eligibility.js`).
  - **10 etapas** por campeonato, mensais. O gerador `buildCountryGeographicChampionships` serve qualquer país.
- **`competitionCategories.js`** — entidade **Categorias de Competição**: os **níveis/tiers** do calendário (Regional → Olímpico), cada um com `level`, `scope` (subnacional/nacional/internacional), `prestígio` e `pontos de ranking`. Database **global** (serve todos os países); a competição aponta para a categoria via `categoryId`. A **premiação** (dinheiro) é só referência (sistema financeiro futuro). Desenho completo em **`CALENDARIO_DE_COMPETICOES.md`**.
- **`athletes.js`** — entidade **Atletas** + gerador de "regens" (nome, país/COI, idade, Força, Potencial, Preparação Física, Cansaço e **esporte favorito**). Ao iniciar a simulação, gera atletas para **todos os eventos** (hoje 2 por evento → **380**, número de teste — ver `TODO.md`), distribuídos entre os clubes (sorteio **ponderado pela infraestrutura** do clube — mais infraestrutura → mais atletas — **e pela afinidade com a cidade de nascimento**: chance bem maior de ir a um clube da sua cidade, sem impedir que fique como agente livre) e agentes livres. Todo regen nasce com um **trio favorito** — esporte, **modalidade** e **evento** (ver `sports.js`/`modalities.js`/`events.js`) — que define onde ele compete; o gerador cobre todos os eventos existentes. O **Cansaço** cai ao competir e **se recupera** nos dias de descanso (energia: 100 = descansado). O **Ritmo** (forma) começa baixo no início do ano, sobe competindo e cai parado (inicial/ganho/queda dependem da Preparação Física); ele **modifica a resolução de resultados** (redutor de forma somado ao da fadiga, sem remover Força/fadiga). É exibido na aba Atletas ao expandir o atleta.
- **`clubs.js`** — entidade **Clubes**: database inicial com **22 clubes reais** de tradição no atletismo, **todos do Brasil** (id, país, cidade-sede, presidente, ano de fundação, nível de infraestrutura, prestígio, finanças e rivais). Começou com 10; depois cada cidade sem clube ganhou 2 (mesmos parâmetros), de modo que **toda cidade da database tem clube**. Sem gerador e ainda sem tela; os clubes inscreverão atletas nas competições (mecânica futura — ver `TODO.md`).
- **`contracts.js`** — entidade **Contratos**: o **elo Atleta ↔ Clube**. O vínculo se dá por contrato de duração anual (1, 2 ou 3 anos), estipulada no início; ao término, o clube pode renovar ou o contrato expira e o atleta vai para o **pool de agentes livres**. Situação (ativo/encerrado) derivada das datas. As telas de Clubes/Atletas já exibem o elo (atletas do clube / clube do atleta); no início a lista é povoada com contratos de **teste** (`seedTestContracts`), a serem substituídos pelo fluxo real. Regras em `PRINCIPIOS_CONTRATOS.md`.
- **`regions.js`** / **`states.js`** — entidades **Regiões** e **Estados**, formando a hierarquia **país → região → estado → cidade**. Regiões: as 5 do Brasil. Estados: os 10 das cidades cadastradas (sigla, país e região), cobrindo as 5 regiões (as 27 UFs virão depois — ver `TODO.md`). São a base dos portes **Regional** e **Estadual** do calendário.
- **`cities.js`** — entidade **Cidades**: database inicial com 10 cidades reais do Brasil (id, país, **estado**, população/tamanho, infraestrutura esportiva). Vincula-se a países, **estados**, clubes (cidade-sede) e atletas (cidade de nascimento). Regras em `PRINCIPIOS_CIDADES.md`.
- **`sports.js`** — entidade **Esportes**: database inicial com **36 esportes olímpicos** (id, nome, descrição, popularidade geral, ano de início da prática, país originário e **`resultSystems`** — a lista dos "ResultSystem" do esporte). O `resultSystems` é **só um indicador** por enquanto (sem mecânica — a mecânica é **prioridade alta** no `TODO.md`). Definirá como os atributos dos atletas são usados na simulação de resultados (lógica futura — ver `TODO.md`). Ainda sem tela.
- **`resultsEngine.js`** — **engine de resolução de resultados** (`ResultsEngine`): módulo genérico que não conhece os esportes; expõe parâmetros de simulação (métrica, direção de vitória, agregação, unidade, precisão) e resolve o ranking de resultados numéricos. Ver `DOCUMENTACAO.md`.
- **`participation.js`** — **participação atleta ↔ etapa**: define quais atletas disputam cada etapa (regra de **teste**: cada clube inscreve todos os seus atletas em todas as etapas) **respeitando a trava geográfica**, **resolve e trava o resultado** de cada etapa realizada (via `resolveModality`) e aplica a **fadiga** aos participantes. A mecânica real de cadastro é prioridade média (ver `TODO.md`).
- **`eligibility.js`** — **travas de inscrição**: só disputa quem é **elegível** à abrangência (`scope`) do campeonato — atletas daquele **país/região/estado/cidade**, pela **cidade de nascimento** — e à **faixa etária** (uso futuro). Ver `CALENDARIO_DE_COMPETICOES.md`.
- **`ranking.js`** — **ranking de pontos** (cálculo, separado da UI): acumula **pontos por atleta** na temporada conforme a **tier** do campeonato (maiores valem mais); ordena e **arquiva** a temporada na virada de ano (histórico para uso posterior).
- **`marksRanking.js`** — **ranking de marcas** (cálculo, separado da UI): por evento, guarda a **melhor marca** de cada atleta na temporada (com data/campeonato/etapa), ordena por marca e arquiva por temporada. **Template genérico** para qualquer evento.
- **`modalities.js`** — entidade **Modalidades**: o nível intermediário da hierarquia **Esporte → Modalidade → Evento**. A modalidade **agrupa os eventos** de um esporte (id, nome, esporte). Database com **72 modalidades** olímpicas (ex.: Atletismo → Velocidade, Meio-fundo, Saltos, …). Sem tela ainda. Ver `TODO.md`.
- **`events.js`** — entidade **Eventos**: as **provas** de uma modalidade (Modalidade → Evento). Database com **~190 eventos** seguindo o **calendário olímpico** (uma leva por modalidade). Cada evento diz qual **sistema de resultado** o resolve (`resultSystem`) e traz os **parâmetros** da sua prova; o `events.js` só **despacha** para o sistema certo. Já são disputáveis **todas as provas de tempo do Atletismo** (17 — corridas, barreiras, obstáculos, revezamentos e marcha), via `TimeResultSystem`, cada uma com o seu recorde real. Os demais viram disputáveis à medida que forem parametrizados. Exibidos na aba **Esportes**.
- **`timeResultSystem.js`** — **`TimeResultSystem`**: sistema **genérico** que resolve **qualquer** prova medida por **tempo** (corridas, natação, remo, contrarrelógio…). As diferenças entre provas vêm dos parâmetros do evento (`event.time`, ex.: o recorde/piso); o comum tem defaults. Tornar uma prova de tempo jogável é só cadastrar os seus parâmetros — sem tocar em código.

Consulte **`DOCUMENTACAO.md`** (controle do projeto), **`TODO.md`** (pendências) e
**`CALENDARIO_DE_COMPETICOES.md`** (desenho do calendário de competições).

## Como usar

Abra o arquivo `index.html` em qualquer navegador.
