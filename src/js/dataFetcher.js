const { VITE_SECRET_KEY: apiKey } = import.meta.env;

// URL hardcodeada para no andar enviando el .env
const _gamesUrl = new URL('https://api.rawg.io/api/games');
// Punteros para el cache
const _cachePointers = {
  gamesPage: (page = 1, search = '', genres = '') =>
    `games-p_${page}${search ? `-s_${search}` : ''}${
      genres.length > 0 ? `-g_${genres}` : ''
    }`,
  gameWithId: n => `game-id_${n}`,
};
// Tiempo de vida de cada cache en minutos
const _cacheExpireTime = {
  gamesPage: 30,
  eachGame: 60,
};

async function _fetchGames(toSearch = '', page = 1, max = 30, genres = []) {
  // Copio la URL para no modificar la original
  const gamesUrl = new URL(_gamesUrl);
  // Extraigo los searchParams
  const { searchParams } = gamesUrl;

  if (!apiKey)
    throw new Error('Se necesita una API key para realizar la petición');

  searchParams.append('key', apiKey);
  searchParams.append('page', page);
  searchParams.append('page_size', max);
  if (toSearch.trim().length > 0) searchParams.append('search', toSearch);
  if (genres.length > 0) searchParams.append('genres', genres.join(','));

  try {
    const response = await fetch(gamesUrl, {
      method: 'GET',
    });
    const json = await response.json();

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
      saveToLocalStorage(
        _cachePointers.gameWithId(id),
        JSON.stringify(cachedData)
      );
    }

    // console.log(json);
    return json;
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 *
 * @param {*} search
 * @param {*} page
 * @param {*} max
 * @returns
 */
//Funcion para Guardar en el local Storage
function saveToLocalStorage(key, value) {
  try {
    // Intenta guardar directamente
    localStorage.setItem(key, value);
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      // Si el almacenamiento está lleno, limpia localStorage y vuelve a intentar
      console.warn('localStorage está lleno, limpiando...');
      localStorage.clear(); // Ten cuidado con esta línea, ya que elimina todos los datos
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        console.error('Error al guardar después de limpiar localStorage', e);
      }
    } else {
      // Si el error es por otra razón, simplemente lánzalo
      throw e;
    }
  }
}

export async function obtainGames(search, page, max, genres = []) {
  search = (search || '').trim().toLowerCase();

  // Obtiene los juegos cacheados para no volver a solicitar la api
  const cachedGames = (() => {
    const now = new Date();
    /** Formato
     * games: {
     *  lastUpdate: 'new Date()',
     *  search: 'search',
     *  all: ...
     * }
     */

    if (
      !localStorage.getItem(
        _cachePointers.gamesPage(page, search, genres.join(','))
      )
    )
      return null;

    try {
      const cachedData = JSON.parse(
        localStorage.getItem(
          _cachePointers.gamesPage(page, search, genres.join(','))
        )
      );

      if (
        !cachedData ||
        !cachedData.lastUpdate ||
        !cachedData.all ||
        cachedData.search !== search
      )
        return null;

      // Revisa que el cache no haya expirado (pasando 30 minutos)
      const lastUpdated = new Date(cachedData.lastUpdate);

      if (now - lastUpdated > _cacheExpireTime.gamesPage * 1000 * 60)
        return null;

      return JSON.parse(cachedData.all);
    } catch (error) {
      console.error('Error al parsear el JSON de los juegos:', error);
    }
    return null;
  })();

  if (cachedGames) {
    console.log(
      'Using cached games at page',
      page,
      'with search:',
      search || null,
      'and genres:',
      genres.join(',')
    );
    return cachedGames;
  }
  console.log(
    'Fetching games at page',
    page,
    'with search:',
    search || null,
    'and genres:',
    genres.join(',')
  );
  // En el caso de ser nulo, se vuelve a solicitar la API
  const json = await _fetchGames(search, page, max);

  if (json?.results?.length > 0) {
    const dataToCache = {
      lastUpdate: new Date().toString(),
      search,
      all: JSON.stringify(json),
    };
    saveToLocalStorage(
      _cachePointers.gamesPage(page, search, genres.join(',')),
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
export async function obtainAGameData(id) {
  const cachedGame = (() => {
    const now = new Date();

    try {
      const cachedData = JSON.parse(
        localStorage.getItem(_cachePointers.gameWithId(id))
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
  const json = await _fetchOneGame(id);

  if (json) {
    const dataToCache = {
      lastUpdate: new Date().toString(),
      all: JSON.stringify(json),
    };
    saveToLocalStorage(
      _cachePointers.gameWithId(json.id),
      JSON.stringify(dataToCache)
    );
  }

  return json;
}
