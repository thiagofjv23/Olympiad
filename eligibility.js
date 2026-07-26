// -----------------------------------------------------------------------------
// Elegibilidade / Travas de inscrição (Eligibility)
//
// Define QUEM pode disputar um campeonato conforme as TRAVAS DE ATLETA:
//   - ABRANGÊNCIA geográfica (`championship.scope`): só participa quem é
//     "daquele" recorte — país, região, estado ou cidade.
//   - FAIXA ETÁRIA (`championship.ageRestriction`): só participa quem está na
//     idade exigida (uso FUTURO — campeonatos juvenis/sub; nenhum usa ainda).
// (A trava de COTA por clube é de grupo/etapa e fica em participation.js.)
//
// A ORIGEM do atleta é derivada da sua CIDADE DE NASCIMENTO (`birthCityId`), que
// dá, pela hierarquia país → região → estado → cidade, todos os níveis. Usar a
// cidade de nascimento mantém a trava independente de contrato/clube (vale
// inclusive para agentes livres) e casa com "atletas daquele estado/região".
//
// O escopo é um objeto { level, placeId }:
//   - level = "country" → placeId é um id de país   (countries.js)
//   - level = "region"  → placeId é um id de região (regions.js)
//   - level = "state"   → placeId é um id de estado (states.js)
//   - level = "city"    → placeId é um id de cidade (cities.js)
// Sem escopo (null), não há trava: todos são elegíveis.
// -----------------------------------------------------------------------------

// Ids de origem de um atleta (cidade/estado/região/país), derivados da cidade de
// nascimento. Campos ausentes vêm como null (país cai para athlete.countryId).
function getAthleteOriginIds(athlete) {
  const city = getCity(athlete.birthCityId);
  const state = getCityState(city);
  const region = getCityRegion(city);
  return {
    cityId: city ? city.id : null,
    stateId: state ? state.id : null,
    regionId: region ? region.id : null,
    countryId: (city && city.countryId) || athlete.countryId || null,
  };
}

// Um atleta é elegível para um escopo { level, placeId }? Sem escopo → true.
function isAthleteEligibleForScope(athlete, scope) {
  if (!scope) return true; // sem trava
  const origin = getAthleteOriginIds(athlete);
  switch (scope.level) {
    case "country":
      return origin.countryId === scope.placeId;
    case "region":
      return origin.regionId === scope.placeId;
    case "state":
      return origin.stateId === scope.placeId;
    case "city":
      return origin.cityId === scope.placeId;
    default:
      return false; // level desconhecido: por segurança, ninguém entra
  }
}

// Filtra uma lista de atletas pelos que são elegíveis a um escopo.
function getEligibleAthletes(athletes, scope) {
  return athletes.filter((athlete) => isAthleteEligibleForScope(athlete, scope));
}

// Idade: o atleta está na faixa etária exigida? ageRestriction = { minAge, maxAge }
// (ambos opcionais). Sem restrição (null) → true. Uso futuro (juvenil/sub).
function isAthleteAgeEligible(athlete, ageRestriction) {
  if (!ageRestriction) return true;
  const { minAge, maxAge } = ageRestriction;
  if (minAge != null && athlete.age < minAge) return false;
  if (maxAge != null && athlete.age > maxAge) return false;
  return true;
}

// Conveniência: o atleta passa em TODAS as travas de atleta de um CAMPEONATO
// (abrangência geográfica + faixa etária)?
function isAthleteEligibleForChampionship(athlete, championship) {
  return (
    isAthleteEligibleForScope(athlete, getChampionshipScope(championship)) &&
    isAthleteAgeEligible(athlete, getChampionshipAgeRestriction(championship))
  );
}

// Conveniência: todos os atletas elegíveis a um campeonato pelas travas de atleta
// (geográfica + idade), independente de contrato/cota. Útil para a UI
// ("atletas elegíveis").
function getChampionshipEligibleAthletes(championship) {
  return ATHLETES.filter((athlete) =>
    isAthleteEligibleForChampionship(athlete, championship)
  );
}
