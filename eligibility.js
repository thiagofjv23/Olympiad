// -----------------------------------------------------------------------------
// Elegibilidade / Travas de inscrição (Eligibility)
//
// Define QUEM pode disputar um campeonato conforme a sua ABRANGÊNCIA geográfica
// (`championship.scope` — ver championships.js). A regra: só participa quem é
// "daquele" recorte — país, região, estado ou cidade.
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

// Conveniência: o atleta é elegível para um CAMPEONATO (usa o escopo dele)?
function isAthleteEligibleForChampionship(athlete, championship) {
  return isAthleteEligibleForScope(athlete, getChampionshipScope(championship));
}

// Conveniência: todos os atletas elegíveis a um campeonato (pela trava geográfica),
// independente de contrato. Útil para a UI ("atletas elegíveis").
function getChampionshipEligibleAthletes(championship) {
  return getEligibleAthletes(ATHLETES, getChampionshipScope(championship));
}
