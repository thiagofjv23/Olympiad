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
//   - ritmo                : Ritmo/forma (0-100). Começa INTERMEDIÁRIO no ano,
//                            sobe ao competir e cai em dias parado. Modifica a
//                            resolução de resultados. Inicial, ganho e queda
//                            dependem da Preparação Física.
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
  count: 100, // quantidade gerada por simulação (apenas para testes)
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

// -----------------------------------------------------------------------------
// Modelo de Cansaço (fatigue)
//
// O stat `fatigue` é, na prática, a ENERGIA/FRESCOR do atleta: 100 = totalmente
// descansado, 0 = exausto. Dois efeitos opostos o movem:
//   - COMPETIR (participar de uma etapa) DESGASTA → reduz o fatigue.
//   - DESCANSAR (um dia sem competir) RECUPERA → aumenta o fatigue, até 100.
//
// O desgaste é por EVENTO (uma etapa é um esforço pontual). A recuperação é por
// DIA (o corpo se recupera continuamente, todo dia de descanso) — por isso as
// magnitudes são diferentes: o desgaste de uma etapa é grande e único; a
// recuperação é menor, mas se soma ao longo dos vários dias entre as etapas.
//
// As duas fórmulas são SIMÉTRICAS nos atributos, com sinais trocados:
//   - Preparação Física: no desgaste, REDUZ a perda; na recuperação, AUMENTA o
//     ganho. Tema: quanto melhor o condicionamento, melhor a gestão de fadiga
//     (cansa menos e se recupera mais rápido).
//   - Idade: no desgaste, AUMENTA a perda; na recuperação, DIMINUI o ganho.
//     Tema: quanto mais velho, pior a gestão (cansa mais e se recupera devagar).
//
// `fatigue` é guardado como número real (não arredondado) para o acúmulo diário
// da recuperação não perder precisão; a UI é que arredonda para exibir.
// -----------------------------------------------------------------------------

// Redução de Cansaço por etapa disputada: maior com a idade e menor quanto
// melhor a Preparação Física (atleta mais preparado se cansa menos).
function fatigueReductionForStage(athlete) {
  const base = 4;
  const ageEffect = (athlete.age / ATHLETE_AGE_LIMITS.max) * 6; // +idade => +redução
  const prepRelief = (athlete.physicalPreparation / 100) * 5; // +preparo => -redução
  return clampNumber(base + ageEffect - prepRelief, 1, 20);
}

// Recuperação de Cansaço por DIA de descanso (dia sem competir). É o oposto do
// desgaste: espelha os atributos com sinais trocados. Um mínimo (base) garante
// que todo dia de descanso recupera algo; a Preparação Física acelera e a idade
// desacelera a recuperação. Clamp em [0.5, 10] (descanso nunca cansa; teto de
// segurança). Constantes de balanceamento, fáceis de recalibrar.
function fatigueRecoveryForRestDay(athlete) {
  const base = 2;
  const prepBoost = (athlete.physicalPreparation / 100) * 2; // +preparo => +recuperação
  const agePenalty = (athlete.age / ATHLETE_AGE_LIMITS.max) * 1.5; // +idade => -recuperação
  return clampNumber(base + prepBoost - agePenalty, 0.5, 10);
}

// Aplica o desgaste de UMA etapa a UM atleta (individual): reduz o seu Cansaço
// pelo valor de `fatigueReductionForStage`, limitado a [0, 100]. Retorna o novo
// valor de `fatigue`. O cansaço é sempre INDIVIDUAL — cada atleta desgasta
// conforme seus próprios atributos (idade, preparação física).
//
// Este é o ponto de aplicação do cansaço por participação, e é INDEPENDENTE de
// clube: quando o mecanismo de inscrição (via clube) definir QUAIS atletas
// disputam cada etapa, basta chamar esta função para cada participante — não há
// nada aqui atrelado a clubes nem que aplique a fadiga em massa a um país.
function applyStageFatigue(athlete) {
  const reduction = fatigueReductionForStage(athlete);
  athlete.fatigue = clampNumber(athlete.fatigue - reduction, 0, 100);
  return athlete.fatigue;
}

// Aplica UM dia de descanso a UM atleta (individual): recupera o Cansaço em
// direção a 100 (descansado), sem ultrapassar. Retorna o novo valor de `fatigue`.
function applyRestDay(athlete) {
  const recovery = fatigueRecoveryForRestDay(athlete);
  athlete.fatigue = clampNumber(athlete.fatigue + recovery, 0, 100);
  return athlete.fatigue;
}

// Aplica o desgaste de uma etapa a uma LISTA de participantes, individualmente.
// Pensado para receber, no futuro, os atletas inscritos numa etapa (via clube).
function applyStageFatigueToParticipants(participants) {
  for (const athlete of participants) {
    applyStageFatigue(athlete);
  }
  return participants;
}

// -----------------------------------------------------------------------------
// Ritmo (forma / afiação de competição)
//
// O `ritmo` (0-100) mede a FORMA do atleta: quanto mais competindo, mais afiado
// (marcas melhores); parado, a forma "esfria". Diferente da Força (que é o teto
// de habilidade) e do Cansaço (energia de curto prazo), o ritmo é uma forma de
// médio prazo, construída ao longo da temporada.
//
// Todos começam o ANO com ritmo INTERMEDIÁRIO e evoluem competindo. Os TRÊS
// parâmetros abaixo dependem da Preparação Física (atleta mais preparado entra
// em forma mais fácil e a perde mais devagar):
//   - ritmo INICIAL: base intermediária + um acréscimo conforme o preparo.
//   - GANHO por prova: fecha uma fração do que falta para a forma plena (100);
//     mais preparo => fração maior (entra em forma mais rápido).
//   - QUEDA por dia parado: perde uma fração do ritmo atual; mais preparo =>
//     fração menor (mantém a forma por mais tempo).
//
// (O EFEITO do ritmo na resolução de resultados fica na modalidade — ver
// modalities.js —, como um redutor de forma somado ao da fadiga, sem remover
// nenhuma variável anterior.)
// -----------------------------------------------------------------------------

const RITMO_INITIAL_BASE = 45; // ritmo mínimo no início do ano (preparo 0)
const RITMO_INITIAL_PREP_RANGE = 25; // + até isso conforme o preparo (=> 45..70)
const RITMO_GAIN_PCT_MIN = 0.15; // ganho por prova: fração do gap até 100 (preparo 0)
const RITMO_GAIN_PCT_MAX = 0.35; // ganho por prova (preparo 100)
const RITMO_DROP_PCT_MIN = 0.005; // queda por dia parado: fração do ritmo (preparo 100)
const RITMO_DROP_PCT_MAX = 0.02; // queda por dia parado (preparo 0)

// Ritmo inicial (intermediário), maior quanto melhor a Preparação Física.
function initialRitmo(physicalPreparation) {
  return clampNumber(
    RITMO_INITIAL_BASE + (physicalPreparation / 100) * RITMO_INITIAL_PREP_RANGE,
    0,
    100
  );
}

// Fração de GANHO de ritmo por prova (do gap até 100). Mais preparo => maior.
function ritmoGainPctForRace(athlete) {
  return (
    RITMO_GAIN_PCT_MIN +
    (athlete.physicalPreparation / 100) * (RITMO_GAIN_PCT_MAX - RITMO_GAIN_PCT_MIN)
  );
}

// Fração de QUEDA de ritmo por dia parado (do ritmo atual). Mais preparo => menor.
function ritmoDropPctForRestDay(athlete) {
  return (
    RITMO_DROP_PCT_MAX -
    (athlete.physicalPreparation / 100) * (RITMO_DROP_PCT_MAX - RITMO_DROP_PCT_MIN)
  );
}

// Ganha ritmo ao competir: fecha uma fração do que falta para a forma plena (100).
function applyRaceRitmo(athlete) {
  const gainPct = ritmoGainPctForRace(athlete);
  athlete.ritmo = clampNumber(
    athlete.ritmo + (100 - athlete.ritmo) * gainPct,
    0,
    100
  );
  return athlete.ritmo;
}

// Perde ritmo num dia parado: uma fração do ritmo atual (forma esfriando).
function applyRestDayRitmo(athlete) {
  const dropPct = ritmoDropPctForRestDay(athlete);
  athlete.ritmo = clampNumber(athlete.ritmo - athlete.ritmo * dropPct, 0, 100);
  return athlete.ritmo;
}

// Reinicia o ritmo para o piso de início de temporada (novo ano): forma baixa,
// conforme o preparo. Aplicado a cada virada de ano (ver participation.js).
function resetSeasonRitmo(athlete) {
  athlete.ritmo = initialRitmo(athlete.physicalPreparation);
  return athlete.ritmo;
}

// Aplica o ganho de ritmo (por prova) a uma LISTA de participantes.
function applyRaceRitmoToParticipants(participants) {
  for (const athlete of participants) {
    applyRaceRitmo(athlete);
  }
  return participants;
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
  const physicalPreparation = generatePhysicalPreparation();

  return {
    id: index,
    label: `Atleta ${index}`,
    countryId: country.id,
    birthCityId,
    favoriteSportId: INITIAL_FAVORITE_SPORT_ID, // por ora, todos: Atletismo
    age,
    strength,
    potential,
    physicalPreparation,
    fatigue: 100, // Cansaço inicia sempre em 100%
    ritmo: initialRitmo(physicalPreparation), // forma baixa no início do ano
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
