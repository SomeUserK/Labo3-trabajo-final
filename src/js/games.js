import { obtainGames, obtainAGameData } from '/src/js/dataFetcher.js';
const games_container = document.getElementById('games-container');
const txtBusqueda = document.getElementById('barraBusqueda');
const btnBusqueda = document.getElementById('botonBusqueda');

let _Cooldown = false;

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

function isOnCooldown() {
  if (_Cooldown) return true;
  _Cooldown = true;
  setTimeout(() => (_Cooldown = false), 5 * 1000);
  return false;
}

// Funcion para buscar juegos al hacer click en buscar
btnBusqueda.addEventListener('click', async event => {});

async function loadGames(search, page, max, categories) {
  const cardTemplate = await loadHTMLAsString('./src/templates/game-card.html');

  // TODO Que la carta default sea directamente un carta vacia cargando
  const defaultCard = HTMLreplacer(cardTemplate, {
    name: 'No games found',
    description: 'Try searching for a game',
    image: './imagenes/no-image.png',
  });
  games_container.innerHTML = defaultCard;

  const firstGames = await obtainGames(search, page, max, categories);

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
      const stars_rating = Math.floor((game.rating / 5) * 100) + '%';

      return HTMLreplacer(cardTemplate, {
        name: game.name,
        description: words.slice(0, 30).join(' ') + '...',
        stars_rating: stars_rating,
        image: game.background_image,
        css: `.progress-bar[data-width] {width: ${Math.floor(
          (game.rating / 5) * 100
        )}%; }`,
      });
    });

    games_container.innerHTML = cards.join('');
  }
}

// Evento para detectar si se llegó al final de la página
window.addEventListener('scroll', () => {
  const posicionDesplazamiento = window.scrollY + window.innerHeight;
  const alturaDocumento = document.documentElement.scrollHeight;

  // Si no se llegó al final de la página o ya se está cargando, no hacer nada
  if (!(posicionDesplazamiento >= alturaDocumento - 1) || isOnCooldown())
    return;
  console.log('Llegaste al final de la página');

  // Cargar más juegos

  loadGames(txtBusqueda.value, 1, 20);
});

// Funcion MAIN Auto Ejecutable
(async () => {
  window.scrollTo(0, 0);

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const search = urlParams.get('search') || '';

  if (search) txtBusqueda.value = search;

  isOnCooldown();
  loadGames(search, 1, 20);
})();
