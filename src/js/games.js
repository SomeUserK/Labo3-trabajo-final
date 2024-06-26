const { VITE_SECRET_KEY: apiKey } = import.meta.env;

// URL hardcodeada para no andar enviando el .env
const _gamesUrl = new URL('https://api.rawg.io/api/games');

async function fetchGames(toSearch = '', page = 1, max = 20) {
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
    const response = await fetch(gamesUrl);
    const result = await response.json();
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
  }
}

// fetchGames().then(result => console.log(result));
