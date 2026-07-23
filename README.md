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
- **Campeonatos** — mostra o campeonato selecionado, com um seletor para futuros campeonatos.
- **Atletas** — seletor por país; lista os atletas daquele país (nome, idade e Força), com clique para expandir e ver todos os atributos.
- **Clubes** — seletor por país; lista os clubes daquele país (nome, país e prestígio), com clique para expandir e ver as demais informações.

## Entidades (dados)

- **`countries.js`** — entidade **Países**. Cada país tem `id`, `nome`, `população` e um rating de **Força Olímpica** (0–100). Já inclui o **Brasil** (`BRA`).
- **`championships.js`** — entidade **Campeonatos**. Cada campeonato tem `id` única, `nome`, `participantes`, `país` (referência a `countries.js`), `eventos`, `modalidades`, `competidores` e `etapas`.
  - Campeonato inicial: **Campeonato Nacional de Atletismo** (`CNA-2026`), Brasil, 0 participantes.
  - **10 etapas**, sempre no **segundo sábado de cada mês**, começando no segundo sábado de janeiro/2026.
- **`athletes.js`** — entidade **Atletas** + gerador de "regens" (nome, país/COI, idade, Força, Potencial, Preparação Física e Cansaço). Ao iniciar a simulação, gera 10 atletas (número de teste — ver `TODO.md`).
- **`clubs.js`** — entidade **Clubes**: database inicial com 10 clubes reais de tradição no atletismo (id, país, cidade-sede, presidente, ano de fundação, nível de infraestrutura, prestígio, finanças e rivais). Sem gerador e ainda sem tela; os clubes inscreverão atletas nas competições (mecânica futura — ver `TODO.md`).
- **`cities.js`** — entidade **Cidades**: database inicial com 10 cidades reais do Brasil (id, país, população/tamanho, infraestrutura esportiva). Vincula-se a países, clubes (cidade-sede) e atletas (cidade de nascimento). Regras em `PRINCIPIOS_CIDADES.md`. Ainda sem tela.
- **`sports.js`** — entidade **Esportes**: database inicial com 6 esportes (id, nome, descrição, popularidade geral, ano de início da prática, país originário). Definirá como os atributos dos atletas são usados na simulação de resultados (lógica futura — ver `TODO.md`). Ainda sem tela.
- **`resultsEngine.js`** — **engine de resolução de resultados** (`ResultsEngine`): módulo genérico que não conhece os esportes; expõe parâmetros de simulação (métrica, direção de vitória, agregação, unidade, precisão) e resolve o ranking de resultados numéricos. Ver `DOCUMENTACAO.md`.
- **`modalities.js`** — entidade **Modalidades**: variações de prática de um esporte (id, nome, esporte primário, forma de resolução, popularidade geral e por país). Database ainda vazia; sem tela. Ver `TODO.md`.

Consulte **`DOCUMENTACAO.md`** (controle do projeto) e **`TODO.md`** (pendências).

## Como usar

Abra o arquivo `index.html` em qualquer navegador.
