import { obtainGames, obtainAGameData } from '/src/js/dataFetcher.js';
const games_container = document.getElementById('games-container');
const txtBusqueda = document.getElementById('barraBusqueda');
const btnBusqueda = document.getElementById('botonBusqueda');

let page = 1;
let totalPages = 20;

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
/////////////////////////////////////////////////////
// Funcion para buscar juegos al hacer click en buscar
/////////////////////////////////////////////////////

btnBusqueda.addEventListener('click', event => {
  event.preventDefault();
  mostrarJuego(true);
});

async function mostrarJuego() {
  let games = [];
  if (txtBusqueda.value.trim() !== '') {
    const search = txtBusqueda.value.trim();
    games = await obtainGames(search, 1, 20);
  } else {
    games = await obtainGames('', page, 20);
  }

  if (!games || !games.results?.length) {
    console.log('No se encontraron resultados');
    return;
  }

  const { results } = games;
  console.log(results);
  const extraDataResults = await Promise.allSettled(
    results.map(game => obtainAGameData(game.id))
  );
  console.log(results);

  const extraDatas = extraDataResults.map(result => result.value || null);
  console.log(results);

  games_container.innerHTML = '';
  results.map(game => {
    if (!game) return '';

    const htmlContent = `
    <div class="card">
      <div class="card-img">
        <img src="${game.background_image}" class="card-img-top" alt="${
      game.name
    }" />
      </div>
      <div class="card-body text-center">
        <h5 class="card-title">${game.name}</h5>
        <a href="/game-detail.html" class="btn btn-primary">View More</a>
      </div>
      <section class="stars">
        <div class="star">
          <img src="/public/imagenes/dark-stars.png" alt="stars" />
        </div>
        <div class="progress">
          <div
            class="progress-bar bg-warning"
            role="progressbar"
            style="width: ${Math.floor((game.rating / 5) * 100) + '%'};"
            aria-valuenow="25"
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>
      </section>
    </div>
    `;
    games_container.innerHTML += htmlContent;
  });

  window.scrollTo(0, 0);
}
(async () => {
  window.scrollTo(0, 0);

  const cardTemplate = await loadHTMLAsString('./src/templates/game-card.html');
  let page = 1;
  let isLoadingState = 1;

  const firstGames = await obtainGames('', page, 20);

  // En el caso de poder obtener las cartas, se insertan en el contenedor
  if (firstGames && firstGames.results?.length > 0) {
    const { results } = firstGames;
    const extraDataResults = await Promise.allSettled(
      results.map(game => obtainAGameData(game.id))
    );
    const extraDatas = extraDataResults.map(result => result.value || null);

    console.log(results);
    results.forEach((game, index) => {
      if (!game) return '';
      const gameData = extraDatas[index] || {};

      const genres = gameData.genres?.map(genre => genre.name) || [];
      const htmlContent = `<div class="card">
        <div class="card-img">
        
        <img src="${game.background_image}" class="card-img-top" alt="${
        game.name
      }" />
      </div>
        <div class="card-body text-center">
          <h5 class="card-title text-center">${game.name}</h5>
          <div class="card-informacionOculta">
          </div>
          <section class="stars text-start">
          <div class="star">
            <img src="/public/imagenes/dark-stars.png" alt="stars" />
          </div>
          <div class="d-flex justify-content-between">  
          <div class="progress">
            <div
              class="progress-bar bg-warning"
              role="progressbar"
              style="width: ${Math.floor((game.rating / 5) * 100) + '%'};"
              aria-valuenow="25"
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
            <p class="text-warning">${game.rating}</p>

          </div>

          </div>
          
        </section>

        <p class="text-start">${genres.join(', ')}</p>
        <a href="/game-detail.html" class="btn btn-primary">View More</a>
        </div>
        
      </div>
      `;
      games_container.innerHTML += htmlContent;
    });

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

          const genres = gameData.genres?.map(genre => genre.name) || [];

          const htmlContent = `<div class="card">
              <div class="card-img">
              
              <img src="${game.background_image}" class="card-img-top" alt="${
            game.name
          }" />
            </div>
              <div class="card-body text-center">
                <h5 class="card-title text-center">${game.name}</h5>
                <div class="card-informacionOculta">
                </div>
                <section class="stars text-start">
                <div class="star">
                  <img src="/public/imagenes/dark-stars.png" alt="stars" />
                </div>
                <div class="d-flex justify-content-between">  
                <div class="progress">
                  <div
                    class="progress-bar bg-warning"
                    role="progressbar"
                    style="width: ${Math.floor((game.rating / 5) * 100) + '%'};"
                    aria-valuenow="25"
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                  <p class="text-warning">${game.rating}</p>

                </div>

                </div>
                
              </section>

              <p class="text-start">${genres.join(', ')}</p>
              <a href="/game-detail.html" class="btn btn-primary">View More</a>
              </div>
              
            </div>
            `;
          return htmlContent;
        });

        games_container.innerHTML += newCards.join('');
      });
    });
  } else {
    // TODO Que la carta default sea directamente un carta vacia cargando
    const defaultCard = HTMLreplacer(cardTemplate, {
      name: 'No games found',
      description: 'Try searching for a game',
      image: './imagenes/no-image.png',
    });
    games_container.innerHTML = defaultCard;
  }

  //
})();

/////////////////////////////////////////////////////
//Funcion Paginación
/////////////////////////////////////////////////////

document.addEventListener('DOMContentLoaded', () => {
  const totalPages = 10; // Supongamos 10 páginas para el ejemplo
  let currentPage = 1;
  const paginationContainer = document.querySelector('.pagination');

  function updatePagination() {
    paginationContainer.innerHTML = ''; // Limpiar la paginación existente

    // Botón "Anterior"
    const prevLi = document.createElement('li');
    prevLi.className = 'page-item';
    prevLi.innerHTML = `<a class="page-link" href="#">Previous</a>`;
    prevLi.onclick = () => changePage(currentPage - 1);
    paginationContainer.appendChild(prevLi);

    // Botones de página
    for (let i = 1; i <= totalPages; i++) {
      const pageLi = document.createElement('li');
      pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;
      pageLi.innerHTML = `<a class="page-link" href="#">${i}</a>`;
      pageLi.onclick = () => changePage(i);
      paginationContainer.appendChild(pageLi);
    }

    // Botón "Siguiente"
    const nextLi = document.createElement('li');
    nextLi.className = 'page-item';
    nextLi.innerHTML = `<a class="page-link" href="#">Next</a>`;
    nextLi.onclick = () => changePage(currentPage + 1);
    paginationContainer.appendChild(nextLi);
  }

  function changePage(page) {
    if (page < 1 || page > totalPages) return; // Evitar páginas fuera de rango
    currentPage = page;
    updatePagination();
    // Aquí puedes añadir lógica para actualizar el contenido de la página según currentPage
  }

  updatePagination(); // Inicializar la paginación
});
