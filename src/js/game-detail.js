import { obtainAGameData } from './dataFetcher';
import { gameDetail } from './templates/game-detail-container';
const gameContainer = document.getElementById('game-container');

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

  console.log(gameData);

  gameContainer.innerHTML = gameDetail(gameData);
})();
