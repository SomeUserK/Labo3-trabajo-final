const { VITE_SECRET_KEY: apiKey } = import.meta.env;

// URL hardcodeada para no andar enviando el .env
const _gamesUrl = new URL('https://api.rawg.io/api/games');
// Punteros para el cache
const _cachePointers = {
  firstLandingGames: (page = 1) => `games-${page}`,
  gameWithId: n => `game-${n}`,
};
// Tiempo de vida de cada cache en minutos
const _cacheExpireTime = {
  firstLandingGames: 30,
  eachGame: 60,
};

async function _fetchGames(toSearch = '', page = 1, max = 30) {
  // Copio la URL para no modificar la original
  const gamesUrl = new URL(_gamesUrl);
  // Extraigo los searchParams
  const { searchParams } = gamesUrl;

  if (!apiKey)
    throw new Error('Se necesita una API key para realizar la petición');

  searchParams.append('key', apiKey);
  searchParams.append('page', page);
  searchParams.append('page_size', max);
  if ((searchParams.get('search') || '').trim().length > 0)
    searchParams.append('search', toSearch);

  try {
    const response = await fetch(gamesUrl, {
      // La pagina no recibe la key de otra forma que no sea con el query
      // method: 'POST',
      // headers: {
      //   'Content-Type': 'application/json',
      // },
      // body: {
      //   key: apiKey,
      // },
      method: 'GET',
    });
    const json = await response.json();

    console.log('Juegos...', json);
    return json;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function _fetchOneGame(id) {
  const gameUrl = new URL(`${_gamesUrl}/${id}`);
  const { searchParams } = gameUrl;

  if (!apiKey)
    throw new Error('Se necesita una API key para realizar la petición');
  if (!id) throw new Error('Se necesita un ID para realizar la petición');

  searchParams.append('key', apiKey);

  try {
    const response = await fetch(gameUrl, {
      method: 'GET',
    });
    const json = await response.json();

    if (json) {
      const cachedData = {
        lastUpdate: new Date().toString(),
        all: JSON.stringify(json),
      };
      localStorage.setItem(
        _cachePointers.gameWithId(id),
        JSON.stringify(cachedData)
      );
    }

    console.log(json);
    return json;
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 *
 * @param {*} toSearch
 * @param {*} page
 * @param {*} max
 * @returns
 */
export async function obtainGames(...args) {
  const page = args[1];

  // Obtiene los juegos cacheados para no volver a solicitar la api
  const cachedGames = (() => {
    const now = new Date();
    /** Formato
     * games: {
     *  lastUpdate: 'new Date()',
     *  search: 'toSearch',
     *  all: ...
     * }
     */

    try {
      const cachedData = JSON.parse(
        localStorage.getItem(_cachePointers.firstLandingGames(page))
      );

      if (!cachedData || !cachedData.lastUpdate || !cachedData.all) return null;

      if (cachedData.search !== args[0]) return null;

      // Revisa que el cache no haya expirado (pasando 30 minutos)
      const lastUpdated = new Date(cachedData.lastUpdate);

      if (now - lastUpdated > _cacheExpireTime.firstLandingGames * 1000 * 60)
        return null;

      return JSON.parse(cachedData.all);
    } catch (error) {
      console.error('Error al parsear el JSON de los juegos:', error);
    }
    return null;
  })();

  if (cachedGames) return cachedGames;
  console.log('No hay juegos cacheados');
  // En el caso de ser nulo, se vuelve a solicitar la API
  const json = await _fetchGames(...args);

  if (json.results?.length > 0) {
    const dataToCache = {
      lastUpdate: new Date().toString(),
      search: args[0],
      all: JSON.stringify(json),
    };
    localStorage.setItem(
      _cachePointers.firstLandingGames(page),
      JSON.stringify(dataToCache)
    );
  }

  return json;
}

/**
 *
 * @param {*} id
 * @returns
 */
export async function obtainAGameData(...args) {
  const cachedGame = (() => {
    const now = new Date();

    try {
      const cachedData = JSON.parse(
        localStorage.getItem(_cachePointers.gameWithId(args[0]))
      );

      if (!cachedData || !cachedData.lastUpdate || !cachedData.all) return null;
      // Revisa que el cache no haya expirado (pasando 60 minutos)
      const lastUpdated = new Date(cachedData.lastUpdate);
      if (now - lastUpdated > _cacheExpireTime.eachGame * 1000 * 60)
        return null;

      return JSON.parse(cachedData.all);
    } catch (error) {
      console.error('Error al parsear el JSON del juego:', error);
    }
    return null;
  })();

  if (cachedGame) return cachedGame;
  // En el caso de ser nulo, se vuelve a solicitar la API
  const json = await _fetchOneGame(...args);

  if (json) {
    const dataToCache = {
      lastUpdate: new Date().toString(),
      all: JSON.stringify(json),
    };
    localStorage.setItem(
      _cachePointers.gameWithId(json.id),
      JSON.stringify(dataToCache)
    );
  }

  return json;
}
