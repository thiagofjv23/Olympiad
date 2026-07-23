// -----------------------------------------------------------------------------
// Entidade: Atletas (Athletes) — gerador de "regens"
// Relaciona-se com os países (countries.js) pela força olímpica e pelo COI.
//
// Cada atleta possui:
//   - id                   : número sequencial (1, 2, 3, ...)
//   - label                : nome base ("Atleta 1", "Atleta 2", ...)
//   - countryId            : país de origem (ver countries.js)
//   - age                  : idade
//   - strength             : Força (0-100), baseada na força olímpica + idade
//   - potential            : Potencial (0-100), teto de crescimento; nunca < Força
//   - physicalPreparation  : Preparação Física (0-100)
//   - fatigue              : Cansaço (%), inicia em 100 e cai a cada etapa
//   - birthCityId          : cidade de nascimento (ver cities.js)
//   - favoriteSportId      : esporte favorito (ver sports.js) — a ligação do
//                            atleta com um esporte. Todo regen recebe um ao ser
//                            gerado; neste início, todos têm Atletismo.
//
// O nome exibido combina o label com o código do COI do país,
// por exemplo: "Atleta 1 (BRA)".
// -----------------------------------------------------------------------------

// Capacidade máxima do gerador (faixa de idade que ele consegue produzir).
const ATHLETE_AGE_LIMITS = { min: 12, max: 40 };

// Esporte favorito atribuído a todo regen no início. Por enquanto todos os
// atletas nascem com o Atletismo como favorito (ver sports.js).
// TODO: variar o esporte favorito entre os regens depois (ver TODO.md).
const INITIAL_FAVORITE_SPORT_ID = "SPT-ATLETISMO";

// Configuração de geração usada nos testes atuais.
// TODO: `count` e a faixa de idade abaixo são apenas para testes — tornar
// configuráveis/dinâmicos depois (ver TODO.md).
const ATHLETE_GENERATION_CONFIG = {
  count: 10, // quantidade gerada por simulação (apenas para testes)
  minAge: 18, // faixa deste exemplo inicial (gerador suporta 12-40)
  maxAge: 35,
};

// Idade de pico de rendimento — usada na curva de força por idade.
const PEAK_AGE = 27;

// Influência da infraestrutura esportiva da cidade de nascimento.
// Cidades com melhor infraestrutura tendem a formar atletas mais fortes e com
// maior potencial. O efeito é medido em relação a uma infra "neutra" (50):
//   - infra 100 => bônus máximo; infra 50 => nenhum; infra 0 => penalidade máxima.
const NEUTRAL_CITY_INFRA = 50;
const MAX_CITY_STRENGTH_BONUS = 10; // pontos de Força no melhor/pior caso
const MAX_CITY_POTENTIAL_BONUS = 8; // pontos extras no teto de Potencial

// Crescimento por idade: quanto mais jovem o atleta, maior a distância entre
// Força e Potencial (mais espaço para evoluir). Com o passar da idade essa
// distância diminui, até os mais velhos que já atingiram o potencial (gap ~0).
const GROWTH_FULL_AGE = 18; // até esta idade, margem de crescimento plena
const GROWTH_END_AGE = 32; // a partir desta idade, potencial já atingido (gap ~0)

// Lista viva de atletas da simulação atual.
let ATHLETES = [];

// --- utilidades ---------------------------------------------------------------

function clampNumber(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Amostra de uma distribuição normal (Box-Muller).
function randomNormal(mean, stdDev) {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return mean + z * stdDev;
}

// Fator de idade (0.6 a 1.0): máximo perto do pico, caindo nos extremos.
function ageFactor(age) {
  const penalty = Math.pow((age - PEAK_AGE) / 18, 2);
  return clampNumber(1 - penalty * 0.5, 0.6, 1);
}

// Fator de infraestrutura da cidade: -1 (infra 0) a +1 (infra 100), 0 no neutro.
function cityInfraFactor(sportsInfrastructure) {
  return (sportsInfrastructure - NEUTRAL_CITY_INFRA) / NEUTRAL_CITY_INFRA;
}

// Fator de crescimento por idade (1 a 0): 1 até GROWTH_FULL_AGE (jovem, margem
// plena), caindo linearmente até 0 em GROWTH_END_AGE (potencial já atingido).
function growthFactor(age) {
  if (age <= GROWTH_FULL_AGE) return 1;
  if (age >= GROWTH_END_AGE) return 0;
  return (GROWTH_END_AGE - age) / (GROWTH_END_AGE - GROWTH_FULL_AGE);
}

// --- geração de atributos -----------------------------------------------------

// Força: distribuição normal centrada na força olímpica ajustada pela idade,
// mais um bônus/penalidade conforme a infraestrutura da cidade de nascimento.
function generateStrength(olympicStrength, age, cityInfra) {
  const cityBonus = cityInfraFactor(cityInfra) * MAX_CITY_STRENGTH_BONUS;
  const mean = olympicStrength * ageFactor(age) + cityBonus;
  return Math.round(clampNumber(randomNormal(mean, 8), 1, 100));
}

// Potencial: força inicial + margem de crescimento. A margem vem da força
// olímpica e da infraestrutura da cidade, e é então escalada pela idade
// (`growthFactor`): jovens têm margem grande (Força bem abaixo do Potencial);
// os mais velhos têm margem pequena ou nula (já perto/no Potencial).
// Nunca menor que a força e no máximo 100.
function generatePotential(olympicStrength, strength, cityInfra, age) {
  const cityBonus = cityInfraFactor(cityInfra) * MAX_CITY_POTENTIAL_BONUS;
  const baseMargin = Math.abs(randomNormal(olympicStrength * 0.15, 6)) + cityBonus;
  const margin = Math.max(0, baseMargin) * growthFactor(age);
  return Math.round(clampNumber(strength + margin, strength, 100));
}

// Preparação Física (0-100).
function generatePhysicalPreparation() {
  return Math.round(clampNumber(randomNormal(60, 15), 0, 100));
}

// Nome exibido: "Atleta N (COI)".
function getAthleteName(athlete) {
  const country = getCountry(athlete.countryId);
  const ioc = country ? country.iocCode : "???";
  return `${athlete.label} (${ioc})`;
}

// Esporte favorito do atleta (objeto de sports.js). Retorna undefined se o
// esporte referenciado não existir.
function getAthleteFavoriteSport(athlete) {
  return getSport(athlete.favoriteSportId);
}

// Redução de Cansaço por etapa concluída: maior com a idade e menor quanto
// melhor a Preparação Física (atleta mais preparado se cansa menos).
// TODO: aplicar quando os atletas forem vinculados às etapas (ver TODO.md).
function fatigueReductionForStage(athlete) {
  const base = 4;
  const ageEffect = (athlete.age / ATHLETE_AGE_LIMITS.max) * 6; // +idade => +redução
  const prepRelief = (athlete.physicalPreparation / 100) * 5; // +preparo => -redução
  return clampNumber(base + ageEffect - prepRelief, 1, 20);
}

// --- criação e geração --------------------------------------------------------

// Sorteia a cidade de nascimento entre as cidades do país, ponderando pelo
// tamanho da cidade: quanto maior a cidade, maior a proporção de atletas nela
// nascidos. Retorna null se o país ainda não tiver cidades cadastradas.
function randomBirthCityId(countryId) {
  const cities = getCitiesByCountry(countryId);
  if (cities.length === 0) return null;

  const totalWeight = cities.reduce(
    (sum, city) => sum + citySizeWeight(city.size),
    0
  );

  let pick = Math.random() * totalWeight;
  for (const city of cities) {
    pick -= citySizeWeight(city.size);
    if (pick < 0) return city.id;
  }
  return cities[cities.length - 1].id;
}

function createAthlete(index, country) {
  const age = randomInt(
    ATHLETE_GENERATION_CONFIG.minAge,
    ATHLETE_GENERATION_CONFIG.maxAge
  );

  // Cidade de nascimento e sua infraestrutura esportiva influenciam os atributos.
  const birthCityId = randomBirthCityId(country.id);
  const birthCity = birthCityId ? getCity(birthCityId) : null;
  const cityInfra = birthCity ? birthCity.sportsInfrastructure : NEUTRAL_CITY_INFRA;

  const strength = generateStrength(country.olympicStrength, age, cityInfra);
  const potential = generatePotential(
    country.olympicStrength,
    strength,
    cityInfra,
    age
  );

  return {
    id: index,
    label: `Atleta ${index}`,
    countryId: country.id,
    birthCityId,
    favoriteSportId: INITIAL_FAVORITE_SPORT_ID, // por ora, todos: Atletismo
    age,
    strength,
    potential,
    physicalPreparation: generatePhysicalPreparation(),
    fatigue: 100, // Cansaço inicia sempre em 100%
  };
}

// Gera `count` atletas do país informado e substitui a lista atual.
// Chamado ao iniciar a simulação.
function generateAthletes(
  count = ATHLETE_GENERATION_CONFIG.count,
  countryId = "BRA"
) {
  const country = getCountry(countryId);
  const list = [];
  for (let i = 1; i <= count; i++) {
    list.push(createAthlete(i, country));
  }
  ATHLETES = list;
  return list;
}
