import { obtainGames, obtainAGameData } from '/src/js/dataFetcher.js';
import { gameCard } from '/src/js/templates/game-card';

const games_container = document.getElementById('games-container');
const txtBusqueda = document.getElementById('barraBusqueda');
const btnBusqueda = document.getElementById('botonBusqueda');

// La pagina actual
let _cooldown = false;
let _page = 1;

// Utilidad para reemplazar valores en un string HTML
function HTMLreplacer(template, data) {
  let html = template;
  for (const key in data) {
    // Formato de los datos a reemplazar: {key}
    const value = data[key] ?? null;
    html = html.replaceAll(`{${key}}`, value);
  }
  return html;
}

// Utilidad para cargar un archivo HTML como string
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
  if (_cooldown) return true;
  _cooldown = true;
  setTimeout(() => (_cooldown = false), 3.5 * 1000);
  return false;
}

/////////////////////////////////////////////////////
// Funcion para buscar juegos al hacer click en buscar
/////////////////////////////////////////////////////

// btnBusqueda.addEventListener('click', event => {
//   event.preventDefault();
//   mostrarJuego(true);
// });

async function loadGames(search, page, max) {
  let defaultCard = gameCard({
    name: 'No games found',
    description: 'Try searching for a game',
    background_image: '/imagenes/no-image.png',
  });
  if (page === 1) games_container.innerHTML = defaultCard;

  const genres = [
    document.getElementById('action')?.checked ? 'action' : '',
    document.getElementById('adventure')?.checked ? 'adventure' : '',
    document.getElementById('sports')?.checked ? 'sports' : '',
    document.getElementById('strategy')?.checked ? 'strategy' : '',
    document.getElementById('simulation')?.checked ? 'simulation' : '',
    document.getElementById('rpg')?.checked ? 'rpg' : '',
    document.getElementById('puzzle')?.checked ? 'puzzle' : '',
    document.getElementById('horror')?.checked ? 'horror' : '',
    document.getElementById('racing')?.checked ? 'racing' : '',
  ].filter(genre => !!genre);

  const games = await obtainGames(search, page, max, genres);

  // let games = [];
  // if (txtBusqueda.value.trim() !== '') {
  //   const search = txtBusqueda.value.trim();
  //   games = await obtainGames(search, 1, 20);
  // } else {
  //   games = await obtainGames('', page, 20);
  // }

  // const { results } = games;

  // const extraDataResults = await Promise.allSettled(
  //   results.map(game => obtainAGameData(game.id))
  // );
  // console.log(results);

  // const extraDatas = extraDataResults.map(result => result.value || null);

  // if (results && results.length > 0) {
  //   //quita la plantilla por defecto
  //   games_container.innerHTML = '';

  //   results.map(game => {
  //     if (!game) return '';

  //     games_container.innerHTML += htmlContent;
  //   });
  // }
  // window.scrollTo(0, 0);

  // En el caso de poder obtener las cartas, se insertan en el contenedor
  if (games && games.results?.length > 0) {
    const { results } = games;
    const extraDataResults = await Promise.allSettled(
      results.map(game => obtainAGameData(game.id))
    );
    const extraDatas = extraDataResults.map(result => result.value || null);

    const cards = results.map((game, index) => {
      // Por cada juego ...

      if (!game) return '';
      const extraGameData = extraDatas[index] || {};

      // const words = gameData.description?.split(' ') || [];
      // const stars_rating = Math.floor((game.rating / 5) * 100) + '%';

      return gameCard(game, extraGameData, genres);
    });

    if (page === 1) {
      games_container.innerHTML = cards.join('');
    } else {
      games_container.innerHTML += cards.join('');
    }
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

  loadGames(txtBusqueda.value, ++_page, 20);
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
