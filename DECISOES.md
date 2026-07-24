# Decisões próprias (autônomas)

Este documento registra **decisões que tomei por conta própria** durante o
desenvolvimento — escolhas que não foram explicitamente pedidas, mas que julguei
razoáveis para o projeto andar. Estão aqui para revisão: qualquer uma pode ser
mudada se você preferir outro caminho.

> Diferença entre os documentos: `DOCUMENTACAO.md` = **o que** existe e como
> funciona; `TODO.md` = **o que falta**; `DECISOES.md` (este) = **por que** algumas
> coisas foram feitas de um certo jeito sem instrução direta.

---

## Diretrizes permanentes (recebidas do usuário)

Regras a seguir sempre, salvo instrução em contrário:

- **Não criar exemplos/dados que não foram solicitados.** Ao criar uma entidade
  ou módulo, implementar apenas o que foi pedido; **não** preencher com dados de
  exemplo (registros fictícios, presets, casos de teste embutidos) sem o usuário
  pedir. Quando faltar dado, perguntar ou deixar vazio — não inventar.

---

## Arquitetura e stack

1. **Site estático (HTML + CSS + JS puro), sem framework e sem build.**
   O repositório estava vazio; escolhi a stack mais simples possível para abrir
   direto no navegador (`index.html`), sem instalar nada. Consequência: dá para
   evoluir sem ferramentas, mas não temos ecossistema de pacotes.

2. **Scripts globais carregados em ordem, em vez de módulos ES.**
   Cada arquivo (`countries.js`, `championships.js`, ...) define variáveis/funções
   globais, carregadas em ordem no `index.html`. Motivo: módulos ES (`import`)
   costumam quebrar ao abrir via `file://`. Custo: a ordem de carregamento importa
   e os nomes são globais.

3. **Dados separados da interface.**
   As entidades (países, campeonatos, atletas, clubes) ficam em arquivos de dados
   próprios, só com estruturas e funções puras; o `script.js` cuida da UI. Assim,
   adicionar um dado novo não exige mexer na interface.

---

## Calendário e tempo

4. **Separei "data da simulação" da "data em exibição".**
   `currentDate` (o "agora", só muda pelos botões de tempo) é diferente de
   `viewYear`/`viewMonth` (o mês visível, muda pelas setas). Assim, folhear o
   calendário nunca avança o relógio.

5. **Datas de etapas calculadas por regra, não fixas.**
   O 2º sábado de cada mês é calculado (`secondSaturday`), e a realização de uma
   etapa é decidida comparando a data da própria etapa com a data atual
   (`isStageDone`) — nada de datas "chumbadas" no código.

6. **Uma etapa conta como realizada já no próprio dia** (comparação `>=`), não
   só no dia seguinte.

7. **Sinais visuais escolhidos por mim:** ponto laranja = etapa agendada, ponto
   verde = etapa realizada, e o dia atual da simulação em destaque azul.

---

## Componentes de UI

8. **Abas generalizadas em uma estrutura única** (`TABS`), em vez de tratar cada
   aba na mão — facilita adicionar novas abas (foi assim que Atletas e Clubes
   entraram sem retrabalho).

9. **Usei o elemento nativo `<details>` para expandir/recolher** atletas e clubes,
   em vez de JavaScript próprio de abrir/fechar. Mais simples e acessível.

10. **CSS de Atletas e Clubes unificado em seletores agrupados**
    (`.athletes, .clubs { ... }`). Como as duas telas seguem o mesmo padrão,
    mantive uma só fonte de estilo — ajuste em uma vale para as duas. Custo: as
    duas ficam acopladas visualmente (intencional, por enquanto).

11. **Tema claro/escuro automático** conforme a preferência do sistema
    (`prefers-color-scheme`) — não foi pedido, mas é barato e melhora o uso.

---

## Geração de atletas

12. **Distribuição normal via Box-Muller** para a Força, com uma **curva de idade
    com pico por volta dos 27 anos**. Os números exatos (desvio padrão, forma da
    curva, média da Preparação Física ~60) foram escolhas minhas de balanceamento
    inicial — fáceis de ajustar depois.

13. **Potencial = Força inicial + margem** (também derivada da força olímpica),
    garantindo que o Potencial nunca fique abaixo da Força.

14. **Fórmula de redução de Cansaço por etapa** (mais idade reduz mais, mais
    Preparação Física reduz menos). A **aplicação** foi implementada em
    `applyStageFatigue` (ver 14b); falta só o vínculo de participação (inscrição
    via clube) para escolher quem disputa cada etapa.

14b. **Aplicação do Cansaço é individual e desacoplada de clube.** A pedido, o
    desgaste por etapa é aplicado por atleta (`applyStageFatigue`), nunca em massa
    aos atletas de um país. Não amarrei nada a clube: o mecanismo recebe os
    participantes (`applyStageFatigueToParticipants`) e já fica pronto para quando
    a inscrição via clube existir. **Arredondo o `fatigue` para inteiro** ao
    aplicar, para casar com a exibição (`${fatigue}%`) e manter o stat limpo.

14a. **Esporte favorito guardado como `favoriteSportId` (referência a `sports.js`),
    não texto.** Segui o padrão das demais ligações do atleta (`countryId`,
    `birthCityId`): guardo o id do esporte e resolvo o objeto quando preciso
    (`getAthleteFavoriteSport`), evitando duplicar nome/dados. O valor inicial
    fixo (Atletismo) fica numa constante única (`INITIAL_FAVORITE_SPORT_ID`) para
    ser fácil trocar por um sorteio depois.

---

## Entidades e dados

15. **Adicionei `iocCode` ao país** (Brasil = `BRA`) para compor o nome do atleta
    ("Atleta 1 (BRA)"), em vez de reaproveitar o `id` — o `id` e o código do COI
    são conceitos diferentes, ainda que coincidam aqui.

16. **Todos os clubes iniciais são do Brasil.**
    Como o Brasil é o único país existente, criar clubes de outros países deixaria
    o vínculo clube→país apontando para algo inexistente. Escolhi clubes reais
    brasileiros com tradição no atletismo. Deve ser revisado quando houver mais
    países.

17. **IDs legíveis para clubes** (ex.: `CLB-FLAMENGO`), seguindo o estilo já usado
    em campeonatos (`CNA-2026`).

18. **Campos ainda não usados começam "vazios" de forma explícita:**
    `president: null`, `finances: null`, `rivals: []` — deixa claro que existem,
    mas não têm valor/uso ainda. Na UI aparecem como `—`.

19. **Valores numéricos iniciais são aproximações minhas** e podem ser recalibrados:
    força olímpica do Brasil (78), níveis de infraestrutura e prestígio dos clubes,
    população. Foram definidos "a olho" para termos dados plausíveis para teste.

19a. **Cidades: as 10 primeiras do Brasil = as 10 mais populosas.** Interpretei
    "as 10 primeiras cidades" como as principais/mais populosas, garantindo que as
    sedes dos clubes (São Paulo, Rio, Belo Horizonte, Porto Alegre) estivessem
    incluídas.

19b. **`size` da cidade é derivado da população, não digitado à mão.** Guardo a
    `populationEstimate` e calculo o tamanho por faixas (`citySizeFromPopulation`),
    para manter a categoria coerente com a população.

19c. **Faixas de tamanho escolhidas por mim** (metrópole ≥ 2.000.000; grande
    500.000–2.000.000; etc.), calibradas para dar variedade já nas 10 primeiras
    (7 metrópoles + 3 grandes). Documentadas em `PRINCIPIOS_CIDADES.md`.

19d. **Cidade de nascimento do atleta é sorteada** entre as cidades do país do
    atleta, no momento da geração.

19e. **Pesos por tamanho de cidade escolhidos por mim** (`CITY_SIZE_WEIGHTS`:
    pequena 1, média 2, grande 4, metrópole 8), usados no sorteio ponderado da
    cidade de nascimento. Escolhi progressão que dobra a cada faixa para que
    cidades maiores concentrem claramente mais atletas; são valores de
    balanceamento, fáceis de ajustar.

19f. **Infra da cidade influencia Força/Potencial via desvio de uma infra neutra
    (50).** Escolhi medir o efeito em relação ao ponto médio da escala (50), de
    modo que infra acima da média dá bônus e abaixo dá penalidade. Os tetos
    (`MAX_CITY_STRENGTH_BONUS` ±10 e `MAX_CITY_POTENTIAL_BONUS` ±8) são valores de
    balanceamento: mantêm a cidade como uma influência perceptível, porém menor
    que idade e força olímpica do país. Fáceis de recalibrar.

19g. **Curva de crescimento por idade linear, plena até 18 e nula a partir de 32.**
    Escolhi `GROWTH_FULL_AGE = 18` e `GROWTH_END_AGE = 32` para que o gap
    Força↔Potencial seja máximo na base da faixa gerada e zere na maturidade
    esportiva típica de provas de velocidade. A queda linear é a forma mais
    simples que reproduz "jovem cresce muito, veterano já no teto"; os dois
    limites são de balanceamento e fáceis de ajustar.

19h. **Esporte: `originCountry` é texto, não referência a `countries.js`.** A origem
    de um esporte costuma ser um país real que não é (nem será) um país jogável em
    `COUNTRIES` (ex.: "Grécia Antiga"). Guardar como nome evita referência
    quebrada; se um dia a origem coincidir com um país implantado, dá para linkar.

19i. **Ano de início da prática usa negativos para a.C.** (ex.: Atletismo = −776 =
    776 a.C.). Manter um único campo numérico é mais simples do que separar
    era/ano.

19j. **Conjunto e popularidade dos esportes escolhidos por mim.** Comecei com 6
    esportes conhecidos (Atletismo é o do campeonato) e a `generalPopularity` é uma
    aproximação de balanceamento, fácil de recalibrar. Anos e origens seguem fatos
    razoavelmente estabelecidos da codificação moderna de cada esporte.

### Contratos (elo Atleta ↔ Clube)

19s. **Contratos num módulo próprio (`contracts.js`), guardando o elo em si.** Em
    vez de pôr um campo `clubId` no atleta (ou uma lista de atletas no clube),
    modelei o vínculo como uma entidade Contrato separada. O clube atual do atleta
    é **derivado** do contrato ativo (`getAthleteClub`). Motivo: um mesmo elo em
    dois lugares tende a divergir; e a diretriz era não mexer em estruturas não
    relacionadas — assim Atleta e Clube ficam intocados.

19t. **Situação (ativo/encerrado) derivada das datas, sem campo de status.**
    Segui o mesmo princípio de `isStageDone`: comparo as datas do próprio contrato
    com a data de referência (por dia). Evita um status persistente que possa
    divergir das datas. Intervalo ativo `[startDate, endDate)`: no dia do término
    já conta como encerrado.

19u. **Renovação = novo termo começando no fim do anterior (via `signContract`).**
    Interpretei "após o término, o mesmo pode ser renovado" preservando o
    histórico: `renewContract` cria um novo contrato começando no `endDate` do
    atual (sem lacuna nem sobreposição), apontando para o anterior com `renewalOf`.
    Reaproveita `signContract`, então a mesma regra de "um vínculo por vez" vale.

19v. **`CONTRACTS` começa vazia (nenhum contrato inventado).** Pela diretriz de
    não criar dados não solicitados, não gerei vínculos iniciais atleta→clube.
    O módulo oferece as operações; popular quem assina quem é passo futuro
    (registrado no `TODO.md`).

19w. **Ids de contrato sequenciais (`CTR-1`, `CTR-2`, ...).** Como contratos são
    criados em runtime (não uma database à mão), usei um contador com prefixo, no
    estilo dos demais ids legíveis do projeto.

19x. **Contratos de TESTE no início (`seedTestContracts`), a seu pedido.** Para as
    telas terem o que mostrar, assino cada atleta a um clube aleatório do país com
    duração anual sorteada. É temporário e está isolado numa função marcada como
    teste — o fluxo real de contratação (quem assina quem, renovar/expirar por
    decisão do clube) substitui isso depois. Registrado no `TODO.md`.

19y. **"Perfil do atleta" reaproveita a aba Atletas (não criei tela nova).** Como
    não existe uma tela de perfil dedicada, `goToAthlete` troca para a aba Atletas,
    seleciona o país e abre/rola até o cartão do atleta (destaque), no mesmo padrão
    do `goToEvent`. Evita duplicar UI e respeita "não mexer em outra coisa".

19z. **Clube do atleta exibido é derivado do contrato ativo, não guardado.** Na
    aba Atletas, a linha "Clube atual" vem de `getAthleteClub(id, currentDate)`;
    sem contrato ativo, "Agente livre". Mantém uma só fonte de verdade (o
    contrato) e não altera a entidade Atleta.

19aa. **No elenco mostro duração E término (não só a duração pedida).** O pedido
    era a duração; incluí também o término ("até dd/mm/aaaa") e a marca "renovado"
    porque o dado já está no contrato e a "parte 2" do TODO pedia isso — dá a
    informação completa sem custo extra.

19ab. **Agentes livres ficam na aba Clubes, abaixo dos clubes.** Como é a tela do
    "ecossistema de contratos" (quem está em que clube), agrupei ali a lista de
    quem está sem clube, reusando o seletor de país já existente. Sincronizo com
    `renderClubs` (uma chamada renderiza clubes + agentes livres).

19ac. **Reatividade à passagem de tempo via re-render.** `advanceDays` reavalia
    Clubes e Atletas (além de campeonatos/dia). Um re-render completo recolhe
    detalhes/rosters abertos, mas é o padrão já usado (campeonatos) e o avanço de
    tempo é ação explícita do usuário — aceitável.

19ad. **Seed de teste deixa ~25% de agentes livres (`TEST_FREE_AGENT_RATE`).**
    Antes o seed assinava todos, então a lista de agentes livres nasceria sempre
    vazia. Para a feature ser demonstrável, deixo uma fração livre. É dado de
    TESTE, fácil de ajustar/remover quando vier o fluxo real.

19cc. **Distribuição inicial dos regens ponderada pela infraestrutura do clube.**
    A pedido, o clube que recebe cada atleta no seed deixou de ser sorteado de
    forma **uniforme** e passou a ser **ponderado pelo `infrastructureLevel`**:
    quanto maior a infraestrutura, mais atletas o clube recebe (e vice-versa).
    Modelei como um **sorteio ponderado** (`pickClubByInfrastructure`), no mesmo
    estilo já usado para a cidade de nascimento (`randomBirthCityId`), com a chance
    **proporcional à infraestrutura** — simples, sem constantes novas de
    balanceamento (a própria escala 0–100 da infra já é o peso). Guardei um
    fallback para sorteio uniforme se a soma dos pesos for 0, para nunca travar.
    Continua **isolado no seed de TESTE**: a distribuição real (quem cada clube
    assina, por prestígio/finanças) segue pendente no `TODO.md`.

19cd. **Afinidade de cidade como PESO multiplicativo, não regra fixa.** A pedido
    ("chance bem mais alta de um atleta ir a um clube da mesma cidade, sem impedir
    que fique sem clube"), acrescentei a cidade-sede ao sorteio como um
    **multiplicador** do peso (`TEST_SAME_CITY_AFFINITY = 8`) quando o clube é da
    cidade de nascimento do atleta, combinando com a infraestrutura em
    `clubSeedWeight`. Escolhi um **peso** (e não forçar o clube local) por três
    motivos: (1) preserva a chance de clubes de outras cidades; (2) atletas de
    cidades **sem clube** simplesmente caem no sorteio por infraestrutura, sem
    caso especial; (3) mantém a **agência livre** intacta — ela é sorteada
    **antes** e independe do clube, então a afinidade nunca faz o atleta deixar de
    ficar sem clube. Renomeei `pickClubByInfrastructure` → `pickClubForAthlete`
    (agora recebe o atleta). O fator 8 é de balanceamento (dá ~77–83% de mesma
    cidade onde há vários clubes locais), fácil de recalibrar.

### Campeonato ↔ esporte e Participação

19ae. **`sportId` no campeonato, não na etapa.** Vinculei o esporte ao campeonato
    inteiro (as etapas herdam), em vez de repetir em cada etapa — um campeonato
    disputa um esporte. Se um dia uma etapa precisar de esporte próprio, dá para
    especializar depois.

19af. **Participação num módulo próprio (`participation.js`), derivada e não
    guardada.** `getStageParticipants` calcula quem disputa na hora (não armazena
    inscrições), o que evita estado obsoleto e reflete a data da etapa. Fica claro
    que é a camada que liga atletas/contratos/clubes às etapas, sem inchar
    `championships.js`.

19ag. **Regra de teste: participantes = contratados via clube (agentes livres
    fora).** A pedido, "os clubes escolhem todos os atletas". Como a inscrição é
    **via clube**, interpretei como todos os atletas com **contrato ativo** em
    clubes do país do campeonato; quem não tem clube (agente livre) não é inscrito
    por ninguém, então não disputa. Coerente com o elo de contratos que já temos.

19ah. **Etapa processada uma única vez, controlada por `_stageResults`.**
    Como "etapa realizada" é derivado da data (reavaliado a cada avanço de tempo),
    guardo as etapas já processadas (resultado travado) para não resolver/desgastar
    de novo a cada `advanceDays`/re-render. O tempo só anda para frente, então o
    Map de resultados basta como marcador de "já processada".

### Resultados das etapas

19ai. **Resultado travado no momento da realização (histórico).** Como a fadiga
    muda ao longo do tempo, recalcular um resultado passado daria um valor
    diferente (errado). Por isso resolvo e **guardo** o resultado quando a etapa é
    realizada; depois ele não muda.

19aj. **Resolvo o resultado ANTES de aplicar a fadiga da própria etapa.** O atleta
    corre com a fadiga que trouxe (acumulada das etapas anteriores) e só então se
    cansa por esta. `processRealizedStages` processa as etapas em ordem, garantindo
    o acúmulo correto.

19ak. **Modalidade da etapa = a primeira do campeonato (`getStageModality`).**
    Como só há uma modalidade (100 m) e o campeonato agora a referencia, cada etapa
    usa a primeira modalidade do campeonato. Modalidade por etapa fica para depois
    (registrado no `TODO.md`).

19al. **UI de resultados na aba Campeonatos (coluna "Ver").** Coloquei a
    classificação junto da tabela de etapas — é o lugar natural do campeonato.
    Só aparece "Ver" nas etapas realizadas; ao clicar, mostra posição/atleta/
    resultado (empates dividem a posição, como na engine).

### Cansaço: recuperação em dias de descanso

19am. **Por que a fórmula de recuperação é do jeito que é.** O stat `fatigue` é a
    energia do atleta (100 = descansado). Competir gasta; descansar recupera. Pedi
    que a recuperação fosse "da mesma forma" que o desgaste, então a modelei como o
    **espelho** de `fatigueReductionForStage`, com os sinais dos atributos
    trocados:
    - **Preparação Física acelera** a recuperação (no desgaste ela reduz a perda).
    - **Idade desacelera** a recuperação (no desgaste ela aumenta a perda).
    Tema único e coerente: *melhor condicionamento = melhor gestão de fadiga*
    (cansa menos e se recupera mais rápido); *mais idade = pior gestão*. Um `base`
    garante recuperação mínima diária (o corpo se recupera sozinho), e o clamp
    `[0.5, 10]` evita que descanso "canse" ou recupere absurdamente.

19an. **Recuperação por DIA, desgaste por EVENTO.** A competição é um esforço
    pontual (uma etapa), então o desgaste é por etapa. A recuperação é contínua,
    então é por dia. Como a unidade de tempo é o dia, passei `advanceDays` a rodar
    **dia a dia** (`processDay`): cada dia, quem compete se desgasta e os demais
    descansam. Isso torna o cálculo exato mesmo em avanços de vários dias.

19ao. **`fatigue` como número real (arredondo só na UI).** Como a recuperação
    diária soma valores pequenos (ex.: 2,25/dia), arredondar a cada dia acumularia
    erro. Guardo o valor real e arredondo apenas para exibir.

19ap. **Constantes calibradas sabendo que etapas são mensais.** Com ~30 dias entre
    etapas, o atleta tende a recuperar totalmente antes da próxima — o que é
    realista (competições espaçadas permitem descanso pleno). O cansaço se acumula
    quando as provas ficam próximas. Se quisermos fadiga mais persistente, basta
    reduzir a recuperação (constantes fáceis de ajustar).

### Ritmo (forma)

19aq. **Ritmo entra na resolução como um redutor de forma SOMADO ao da fadiga.**
    Foi pedido para adicionar sem remover as variáveis anteriores. Modelei a Força
    efetiva como `Força − redutor de fadiga − redutor de forma`, com
    `redutor de forma = (100 − ritmo) × formPenaltyPerPoint`. Fica simétrico à
    fadiga (`100 − fatigue`): 100 = ideal, sem penalidade. Força e fadiga
    permanecem intactas; o ritmo é só um termo a mais.

19ar. **Ganho por "fração do gap até 100"; queda por "fração do atual".** Interpretei
    "porcentagem de aumento após a prova" como fechar uma fração do que falta para a
    forma plena (ganho forte no começo, com retornos decrescentes — natural para
    "entrar em forma"), e "porcentagem de queda após tempo parado" como perder uma
    fração do ritmo atual (a forma esfria proporcionalmente). Ambos são mudanças
    percentuais rumo a um limite (100 no ganho, 0 na queda).

19as. **Os três parâmetros dependem da Preparação Física, com um tema único.**
    Preparo alto → ritmo inicial maior, ganho maior por prova e queda menor no
    descanso. Mesmo tema já usado na fadiga: *melhor preparo = melhor gestão de
    forma/energia*. Idade NÃO entra no ritmo (foi pedido só o vínculo com o preparo).

19at. **Reset de ritmo na virada de ano (temporada).** "Começam o início do ano com
    ritmo baixo" — li como forma sazonal: a cada 1º de janeiro o ritmo volta ao piso
    inicial e é reconstruído competindo. Fica isolado em `processDay` (dispara só na
    virada de ano). **Se não for o desejado, é trivial remover** — me avise.

19au. **`formPenaltyPerPoint = 0.15`.** Calibrado para que a diferença entre forma
    zero e forma plena valha ~0,6–0,7 s nos 100 m (fora de forma no começo do ano →
    afiado no auge). É constante de balanceamento, fácil de recalibrar.

19av. **Ritmo exibido ao expandir o atleta (aba Atletas).** Primeiro só a mecânica
    (a pedido); depois, quando o usuário instruiu, adicionei a linha "Ritmo N/100"
    ao lado dos demais atributos — arredondado, no mesmo padrão do Cansaço.

### Engine de resultados

19k. **Engine exposta como um único objeto `ResultsEngine`**, em vez de várias
    funções/constantes globais soltas. Dá "cara de módulo" e evita poluir o escopo
    global com muitos nomes.

19l. **Sem direção padrão por métrica.** Não assumi que "tempo = menor vence": a
    direção (`ORDERS`) é sempre um parâmetro explícito, porque o usuário destacou
    que o tempo pode ser ordenado nos dois sentidos conforme a prova.

19m. **Empates dividem a posição (ranking de competição: 1, 2, 2, 4)** e resultados
    ausentes (`null`, ex.: DNF) vão sempre por último, independentemente da direção.
    São convenções padrão de esporte; fáceis de trocar se necessário.

19n. **A engine só resolve, não gera.** Decidi que este módulo apenas **ranqueia**
    números prontos. Transformar atributos do atleta em um resultado numérico é
    outra camada (a criar), mantendo a engine genérica e sem conhecer entidades.

### Modalidade 100 m — modelo de resultado

19o. **O modelo de desempenho fica na modalidade, não na engine.** A modalidade
    guarda `performance` (parâmetros) e as funções de cálculo (`computeModalityResult`,
    etc.). Assim a engine continua genérica (só ranqueia) e cada modalidade define
    como seus atributos viram um número.

19p. **"Fadiga acumulada" = 100 − `fatigue`.** Como o stat `fatigue` começa em 100
    (descansado) e cai com o uso, interpretei o "redutor de fadiga" pedido como
    proporcional ao que já foi perdido (100 − fatigue). Assim, atleta descansado
    (fatigue 100) não sofre redução — que é o comportamento esperado.

19q. **Constantes do modelo escolhidas por mim** (`fatiguePenaltyPerPoint = 0.3`,
    `secondsPerStrengthPoint = 0.05`). Calibrei para que a faixa de Força dos
    atletas (~60–95) gere tempos de 100 m plausíveis (~9,8–11,6 s) e para que o
    recorde (9,58 s) seja atingível só com Força efetiva 100. São valores de
    balanceamento, fáceis de ajustar.

19r. **O recorde (9,58 s) é o piso de tempo.** Interpretei "tempo mais alto já
    registrado" como o melhor desempenho possível (o recorde não é superado): Força
    efetiva 100 → 9,58 s, e qualquer valor menor gera tempos maiores (mais lentos).

### Calendário populado e travas de inscrição

19bh. **Gerador de calendário a partir da geografia (não database à mão).** Em vez
    de escrever 15 campeonatos à mão, criei um **gerador**
    (`buildCountryGeographicChampionships`) que percorre a geografia do país e
    cria Estaduais/Regionais. Motivo: o pedido é "uma estrutura que sirva para
    todos os países e a partir dela criar os campeonatos do Brasil" — um gerador é
    genérico e evita repetição. O **Nacional** (`CNA-2026`) ficou na database à
    mão (é a competição-âncora, com id/nome próprios).

19bi. **Só gera competição para lugar COM cidade na database.** A pedido ("não
    criar campeonatos para cidades/estados que não estejam na database"), o gerador
    pula estados sem cidade e regiões sem nenhuma cidade. Como criamos exatamente
    os estados/regiões das cidades existentes, hoje todos geram — mas a trava está
    lá para quando a geografia crescer sem cidades.

19bj. **Escopo como `{ level, placeId }` genérico (país/região/estado/cidade).**
    Modelei a abrangência como um par nível+lugar, em vez de campos fixos
    (`regionId`/`stateId`). Assim a mesma trava serve os quatro níveis (inclusive
    `city`, ainda sem campeonato) e qualquer país, sem inchar a entidade.

19bk. **Elegibilidade pela CIDADE DE NASCIMENTO do atleta.** A trava usa
    `birthCityId` para derivar cidade/estado/região/país do atleta. Escolhi o
    nascimento porque é um atributo próprio do atleta (independe de contrato/clube,
    vale para agentes livres) e casa com "atletas daquele estado/região". A
    alternativa (representação via cidade do clube) ficou registrada no `TODO.md`.

19bl. **Trava SOMADA à regra de inscrição via clube (não a substitui).** Os
    participantes de uma etapa passaram a ser **contratados via clube ∩ elegíveis
    pela trava**. Mantive a regra de teste anterior (inscrição via clube) e apenas
    **acrescentei** o filtro geográfico, sem remover nada.

19bm. **Etapas em sábados distintos por nível.** Estadual no 1º sábado, Nacional no
    2º (o que o CNA já usava), Regional no 3º. Escolhi separar para os níveis não
    caírem todos no mesmo dia do calendário (generalizei `secondSaturday` para
    `nthSaturday`). É balanceamento de calendário, fácil de mudar.

19bn. **UI do campeonato mostra Categoria, Abrangência e Atletas elegíveis.**
    Troquei as linhas "Participantes/Eventos" (sempre 0) por informação útil e que
    **evidencia a trava**: a categoria, o lugar da abrangência e a contagem de
    atletas elegíveis pelo escopo.

### Sistema de Ranking

19bt. **Motor de ranking separado da UI (`ranking.js` × aba Rankings).** A pedido,
    o cálculo (acúmulo de pontos, ordenação, arquivamento) fica todo em
    `ranking.js`; a aba só **lê** `getSeasonRanking()` e desenha. Assim a UI é um
    indicador visual do que o sistema fez, sem lógica duplicada.

19bu. **Distribuição de pontos por decaimento harmônico (placeholder).** Escolhi
    `pontos = base / posição` (base = `rankingPoints` da categoria): campeão leva a
    base cheia, 2º metade, 3º um terço... É simples, sempre positivo, monotônico e
    escala pela tier (categoria maior → mais pontos). É um **placeholder** de
    balanceamento (fácil trocar por tabela/curva), registrado no `TODO.md`. Todos
    os participantes pontuam (sem corte por ora).

19bv. **Temporada = ano-calendário; empates em pontos compartilham posição.**
    Segui a mesma noção de temporada do ritmo (reset em 1º/jan). O ranking usa
    ranking de competição (1, 2, 2, 4) para empates em pontos, como a
    `ResultsEngine`. Desempate de ordenação: mais etapas, depois id.

19bw. **Histórico de temporada salvo para uso POSTERIOR (a pedido).** Na virada de
    ano, arquivo o ranking em `RANKING_HISTORY` antes de zerar. **Decisão explícita
    de guardar para uso futuro** (hall da fama, recordes, all-time...), ainda não
    consumido — registrado no `TODO.md`.

### Ranking de Marcas

19bx. **Módulo próprio (`marksRanking.js`), genérico por modalidade.** Separei do
    ranking de pontos: as marcas dependem da modalidade (métrica, ordem, formato),
    então o módulo é indexado por `modalityId` e usa a `resolution.order` e o
    `formatModalityResult` da própria modalidade. Assim serve **qualquer**
    modalidade; exibimos a dos 100 m. UI separada do cálculo (a tela só lê).

19by. **Só a MELHOR marca da temporada por atleta.** A pedido, cada atleta aparece
    uma vez, com a sua melhor marca do ano (via `ResultsEngine.isBetterResult`,
    respeitando a direção da modalidade). Guardo junto a data/campeonato/etapa da
    marca, para a UI detalhar ao clicar na data.

19bz. **UI: escolha do ranking ao abrir a aba.** A pedido, ao abrir Rankings só
    aparece o seletor (Pontos/Marcas); o ranking só é desenhado após a escolha.
    `renderRanking` virou dispatcher. A data da marca é um link que revela
    "data — campeonato, etapa" numa **linha logo abaixo da própria marca** (assim
    o detalhe fica sempre visível onde o jogador clicou, mesmo com a tabela longa);
    clicar de novo fecha.

19ca. **Modalidade exibida fixa nos 100 m por ora.** Só existe uma modalidade;
    `MARKS_DISPLAY_MODALITY_ID` aponta para ela. Um seletor de modalidade fica para
    quando houver mais de uma (registrado no `TODO.md`).

19cb. **Marcas também arquivadas por temporada (`MARKS_HISTORY`).** Mesmo princípio
    do ranking de pontos: na virada de ano, arquivo e zero. Guardado para uso
    posterior (ver `TODO.md`).

### Travas de idade e de cota por clube

19bo. **Idade e cota como campos do campeonato + helpers (genéricos).** Modelei as
    duas novas travas como `ageRestriction` e `clubQuota` na entidade Campeonato,
    com helpers próprios (`getChampionshipAgeRestriction`, `getChampionshipClubQuota`)
    — assim qualquer campeonato futuro pode declará-las, sem lógica especial.

19bp. **Trava de idade criada mas NÃO aplicada (a pedido).** O mecanismo
    (`isAthleteAgeEligible`, faixa `{ minAge, maxAge }`) já entra na elegibilidade,
    mas nenhum campeonato define `ageRestriction` ainda — fica pronto para os
    juvenis/sub futuros (registrado no `TODO.md`). Faixa com `min`/`max` opcionais
    cobre tanto "Sub-N" (só max) quanto faixas fechadas.

19bq. **Cota por clube é por ETAPA e de GRUPO (fica em participation.js).**
    Diferente das travas de atleta (booleanas, em eligibility.js), a cota limita
    quantos de um mesmo clube entram — então é aplicada ao montar os participantes
    da etapa (`limitAthletesPerClub`), agrupando por clube.

19br. **Seleção da cota por placeholder = mais fortes (determinístico).** Quando a
    cota corta (ex.: CNA = 1), é preciso escolher QUAIS atletas o clube manda.
    Como a inscrição real ainda não existe, uso um placeholder: os de maior
    `strength` (desempate por id), determinístico para o resultado travado da
    etapa não variar. A escolha real (por forma/índice/estratégia do clube) é a
    mecânica pendente no `TODO.md`.

19bs. **UI: card "Regras de Inscrição" agregando as travas.** A pedido, criei um
    item dedicado na aba Campeonatos reunindo Abrangência, Faixa etária e Limite
    por clube — e movi a "Abrangência" do card Campeonato para lá, para as regras
    ficarem num só lugar visível ao jogador.

### Geografia (regiões e estados)

19bc. **Regiões e estados em módulos próprios (`regions.js`, `states.js`).** Segui
    o padrão "uma entidade por arquivo" (como países, cidades, clubes). A
    hierarquia é país → região → estado → cidade; cada nível referencia o de cima
    por id.

19bd. **Criei as 5 regiões (completas) mas só 10 estados (os das cidades).** As
    regiões do Brasil são um conjunto pequeno e fechado (5) — criei todas. Já os
    estados são o nível "que se expande" (como as cidades): criei **apenas os 10**
    referenciados pelas cidades existentes, cobrindo as 5 regiões, e deixei a
    ampliação para as 27 UFs no `TODO.md`. Motivo: seguir a diretriz de não criar
    dados sem uso atual — um estado sem cidade/clube/competição não teria função
    ainda. Fronteira principiada: "existe o estado de cada cidade que temos".

19be. **Estado guarda `countryId` E `regionId` (país redundante).** O país é
    derivável via região, mas guardei `countryId` direto no estado para filtragem
    por país (`getStatesByCountry`), no mesmo estilo de cidades/clubes. Aceito a
    leve redundância em troca de consultas diretas simples.

19bf. **Cidade ganhou `stateId`, mas manteve `countryId`.** Poderia derivar o país
    da cidade via estado, mas mantive `countryId` para não quebrar
    `getCitiesByCountry` (usado na geração de atletas) e por coerência com clubes.
    País e região da cidade têm helpers derivados (`getCityRegion`).

19bg. **Distrito Federal tratado como um "estado" (unidade federativa).** O DF não
    é estado juridicamente, mas é uma UF com sigla própria (DF); modelei como um
    registro de `states.js` (região Centro-Oeste) para casar com a cidade de
    Brasília, sem criar um tipo à parte.

### Calendário de competições (categorias/tiers)

19aw. **Categorias num módulo próprio (`competitionCategories.js`) e GLOBAIS.**
    Modelei os níveis (Regional → Olímpico) como uma entidade separada e
    **independente de país** — as mesmas categorias valem para todos. Motivo: o
    pedido é "servir para todos os países posteriormente"; uma database global
    evita duplicar a escala de portes em cada país. A competição é que aponta para
    a categoria (`categoryId`), no mesmo estilo de `sportId`.

19ax. **`scope` (subnacional/nacional/internacional) para ligar categorias a
    países.** Como uma categoria é global mas uma competição pertence a alguém,
    criei o `scope` para dizer o alcance: subnacional (dentro de um país),
    nacional (um país) e internacional (vários). É o que permite o mesmo conjunto
    de categorias servir qualquer país. **Região/estado ainda não existem** como
    entidade — por ora o scope subnacional só **classifica o nível**; a ligação
    fina fica para quando essas entidades existirem.

19ay. **`level` 1–9 (crescente) para ordenar e comparar portes.** Além do nome,
    guardo um nível numérico (1 = Regional … 9 = Olímpico) para ordenar o
    calendário e comparar "quem é maior" sem depender da ordem de inserção.

19az. **Premiação (dinheiro) fica FORA do código, a pedido.** Não criei campo de
    dinheiro nas categorias: só a mecânica de portes (prestígio + ranking). A
    tabela de premiação (`$`…) foi registrada no `TODO.md` e em
    `CALENDARIO_DE_COMPETICOES.md` como referência para o sistema financeiro
    futuro. As categorias **internacionais** ficaram **sem valor de premiação
    definido** (a tabela do usuário não os trazia) — não inventei valores, seguindo
    a diretriz de não criar dados não solicitados.

19ba. **`rankingPoints` = base do campeão (por ora).** Interpretei a coluna
    "Ranking" como o total de pontos que a categoria vale, ancorado no campeão. A
    **distribuição por posição**, o **acúmulo** (ranking de atleta/clube/país) e os
    **índices** ficaram para depois (registrados no `TODO.md`), para não presumir
    regras não pedidas.

19bb. **`CNA-2026` classificado como Nacional (`CAT-NACIONAL`).** O único
    campeonato existente é o "Campeonato Nacional de Atletismo" — casa com a
    categoria Nacional (prestígio 95, ranking 300). Não criei outras competições
    (Regional, Estadual, etc.) para não inventar dados; popular o calendário é
    passo futuro (registrado no `TODO.md`).

---

## Processo

20. **Validação antes de entregar:** rodo checagem de sintaxe (`node --check`) e,
    quando envolve a interface, um teste rápido em navegador headless (Chromium)
    para confirmar que a tela funciona e não há erro de JavaScript.

21. **Um commit por etapa**, com mensagem descritiva, sempre na branch de trabalho
    designada.
