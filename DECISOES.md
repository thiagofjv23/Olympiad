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
    Preparação Física reduz menos) — criei a fórmula, mas ela ainda não é aplicada
    (falta o vínculo atleta ↔ etapa). Registrado no `TODO.md`.

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

---

## Processo

20. **Validação antes de entregar:** rodo checagem de sintaxe (`node --check`) e,
    quando envolve a interface, um teste rápido em navegador headless (Chromium)
    para confirmar que a tela funciona e não há erro de JavaScript.

21. **Um commit por etapa**, com mensagem descritiva, sempre na branch de trabalho
    designada.
