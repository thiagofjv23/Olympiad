# Princípios de geração de cidades

Regras que guiam a criação das cidades (`cities.js`). Servem tanto para a
database inicial feita à mão quanto para um eventual gerador futuro.

## Escopo inicial

- **10 cidades por país implantado.** No início, cada país existente terá apenas
  **10 cidades** — número escolhido para nossos testes. Deverá crescer depois
  (registrado no `TODO.md`).
- As cidades iniciais de um país são **cidades reais** relevantes (as principais /
  mais populosas), não geradas proceduralmente.

## Vínculos

Cada cidade se relaciona com as demais entidades:

- **País** — toda cidade pertence a um país (`countryId`).
- **Estado / Região** — toda cidade pertence a um estado (`stateId` → `states.js`),
  e o estado pertence a uma região (`regionId` → `regions.js`), formando a
  hierarquia **país → região → estado → cidade**. País e região são deriváveis do
  estado (helpers `getCityState` / `getCityRegion`).
- **Clubes** — todo clube tem uma cidade-sede (`club.cityId`).
- **Atletas** — todo atleta tem uma cidade de nascimento (`athlete.birthCityId`),
  sorteada entre as cidades do país do atleta no momento da geração.

## Atributos

### Tamanho (por população estimada)

O `size` é **derivado** da `populationEstimate` pelas faixas abaixo
(`citySizeFromPopulation`):

| Tamanho     | População estimada        |
| ----------- | ------------------------- |
| pequena     | até 100.000               |
| média       | 100.000 a 500.000         |
| grande      | 500.000 a 2.000.000       |
| metrópole   | 2.000.000 ou mais         |

Exemplo: **São Paulo** é **metrópole**.

### Infraestrutura esportiva (0–100)

- `sportsInfrastructure` vai de 0 a 100 e é **influenciada pela força olímpica do
  país** (Brasil = 78). Cidades maiores / com mais tradição esportiva tendem a
  valores mais altos.
- Nos dados iniciais os valores foram definidos à mão dentro dessa lógica; um
  gerador futuro poderá calculá-los a partir da força olímpica + tamanho.

## Database inicial — Brasil (10 cidades)

| Cidade          | Tamanho   | Pop. estimada | Infra esportiva |
| --------------- | --------- | ------------- | --------------- |
| São Paulo       | metrópole | 12.300.000    | 90              |
| Rio de Janeiro  | metrópole | 6.700.000     | 92              |
| Brasília        | metrópole | 3.050.000     | 80              |
| Salvador        | metrópole | 2.900.000     | 74              |
| Fortaleza       | metrópole | 2.700.000     | 70              |
| Belo Horizonte  | metrópole | 2.520.000     | 82              |
| Manaus          | metrópole | 2.230.000     | 68              |
| Curitiba        | grande    | 1.960.000     | 78              |
| Recife          | grande    | 1.650.000     | 72              |
| Porto Alegre    | grande    | 1.490.000     | 80              |

> Cidades usadas como sede de clubes (São Paulo, Rio de Janeiro, Belo Horizonte e
> Porto Alegre) estão incluídas nesta lista. Populações são estimativas
> aproximadas, para fins de simulação.
