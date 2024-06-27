import { obtainAGameData } from './dataFetcher';

function doError404() {
  const gameContainer = document.getElementsByClassName('contenido')[0];
  gameContainer.innerHTML = `
    <h1>Game not found</h1>
    <p>The game you're looking for doesn't exist</p>
  `;
}

// Funcion Main Auto Ejecutable
(async () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const gameId = (urlParams.get('id') || '').trim();

  if (!gameId) {
    doError404();
    return;
  }

  const gameData = await obtainAGameData(gameId);

  if (!gameData) {
    doError404();
    return;
  }

  const gameContainer = document.getElementsByClassName('contenido')[0];

  // gameContainer.innerHTML = `
  //   <h1>${gameData.name}</h1>
  //   <div class="row">
  //     <div class="col-12 col-lg-6">
  //       <img src="${gameData.background_image}" class="img-fluid" alt="${
  //   gameData.name
  // }">
  //     </div>
  //     <div class="col-12 col-lg-6">
  //       <p>${gameData.description}</p>
  //       <p>Rating: ${gameData.rating}</p>
  //       <p>Released: ${gameData.released}</p>
  //       <p>Genres: ${gameData.genres.map(genre => genre.name).join(', ')}</p>
  //       <p>Platforms: ${gameData.platforms
  //         .map(platform => platform.platform.name)
  //         .join(', ')}</p>
  //     </div>
  //   </div>
  // `;
})();
