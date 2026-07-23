# Decisões próprias (autônomas)

Este documento registra **decisões que tomei por conta própria** durante o
desenvolvimento — escolhas que não foram explicitamente pedidas, mas que julguei
razoáveis para o projeto andar. Estão aqui para revisão: qualquer uma pode ser
mudada se você preferir outro caminho.

> Diferença entre os documentos: `DOCUMENTACAO.md` = **o que** existe e como
> funciona; `TODO.md` = **o que falta**; `DECISOES.md` (este) = **por que** algumas
> coisas foram feitas de um certo jeito sem instrução direta.

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

---

## Processo

20. **Validação antes de entregar:** rodo checagem de sintaxe (`node --check`) e,
    quando envolve a interface, um teste rápido em navegador headless (Chromium)
    para confirmar que a tela funciona e não há erro de JavaScript.

21. **Um commit por etapa**, com mensagem descritiva, sempre na branch de trabalho
    designada.
