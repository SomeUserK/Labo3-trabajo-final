import { obtainGames, obtainAGameData } from '/src/js/dataFetcher.js';
const games_container = document.getElementById('games-container');
const txtBusqueda = document.getElementById('barraBusqueda');
const btnBusqueda = document.getElementById('botonBusqueda');

function HTMLreplacer(template, data) {
  let html = template;
  for (const key in data) {
    // Formato de los datos a reemplazar: {key}
    const value = data[key] ?? null;
    html = html.replaceAll(`{${key}}`, value);
  }
  return html;
}

async function loadHTMLAsString(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const htmlContent = await response.text();
    return htmlContent;
  } catch (error) {
    console.error('Error al cargar el archivo HTML:', error);
  }
}

// Funcion para buscar juegos al hacer click en buscar
btnBusqueda.addEventListener('click', async event => {
  event.preventDefault();

  const cardTemplate = await loadHTMLAsString('./src/templates/game-card.html');

  const search = txtBusqueda.value;
  const games = await obtainGames(search, 1, 20);

  if (!games || !games.results?.length) {
    games_container.innerHTML = HTMLreplacer(cardTemplate, {
      name: 'No games found',
      description: 'Try searching for a game',
      image: './imagenes/no-image.png',
    });
    return;
  }

  const { results } = games;

  const extraDataResults = await Promise.allSettled(
    results.map(game => obtainAGameData(game.id))
  );

  const extraDatas = extraDataResults.map(result => result.value || null);

  const cards = results.map((game, index) => {
    if (!game) return '';
    const gameData = extraDatas[index] || {};

    const words = gameData.description?.split(' ') || [];

    return HTMLreplacer(cardTemplate, {
      name: game.name,
      description: words.slice(0, 30).join(' ') + '...',
      rating: game.rating,
      image: game.background_image,
    });
  });

  games_container.innerHTML = cards.join('');

  window.scrollTo(0, 0);
});

(async () => {
  window.scrollTo(0, 0);

  const cardTemplate = await loadHTMLAsString('./src/templates/game-card.html');
  let page = 1;
  let isLoadingState = 1;

  // TODO Que la carta default sea directamente un carta vacia cargando
  const defaultCard = HTMLreplacer(cardTemplate, {
    name: 'No games found',
    description: 'Try searching for a game',
    image: './imagenes/no-image.png',
  });
  games_container.innerHTML = defaultCard;

  const firstGames = await obtainGames('', page, 20);

  // En el caso de poder obtener las cartas, se insertan en el contenedor
  if (firstGames && firstGames.results?.length > 0) {
    const { results } = firstGames;
    const extraDataResults = await Promise.allSettled(
      results.map(game => obtainAGameData(game.id))
    );
    const extraDatas = extraDataResults.map(result => result.value || null);

    const cards = results.map((game, index) => {
      // Por cada juego ...

      if (!game) return '';
      const gameData = extraDatas[index] || {};
      if (index === 0) console.log(gameData);

      const words = gameData.description?.split(' ') || [];

      return HTMLreplacer(cardTemplate, {
        name: game.name,
        description: words.slice(0, 30).join(' ') + '...',
        rating: game.rating,
        image: game.background_image,
      });
    });

    games_container.innerHTML = cards.join('');
    setTimeout(() => (isLoadingState = 0), 3 * 1000);

    // Evento para detectar si se llegó al final de la página
    window.addEventListener('scroll', () => {
      const posicionDesplazamiento = window.scrollY + window.innerHeight;
      const alturaDocumento = document.documentElement.scrollHeight;

      // Si no se llegó al final de la página o ya se está cargando, no hacer nada
      if (!(posicionDesplazamiento >= alturaDocumento - 1) || isLoadingState)
        return;

      isLoadingState = 1;
      console.log('Llegaste al final de la página');

      setTimeout(() => (isLoadingState = 0), 5 * 1000);

      // Cargar más juegos

      obtainGames('', ++page, 20).then(async games => {
        if (!games || !games.results?.length) return;

        const extraDataResults = await Promise.allSettled(
          games.results.map(game => obtainAGameData(game.id))
        );
        const extraDatas = extraDataResults.map(result => result.value || null);

        const newCards = games.results.map((game, index) => {
          if (!game) return '';
          const gameData = extraDatas[index] || {};

          const words = gameData.description_raw?.split(' ') || [];

          return HTMLreplacer(cardTemplate, {
            name: game.name,
            description: words.slice(0, 36).join(' ') + '...',
            rating: game.rating,
            image: game.background_image,
          });
        });

        games_container.innerHTML += newCards.join('');
      });
    });
  }

  //
})();
