export const gameDetail = (gameData = {}) => `
<div class="InformacionDelJuego">
      <div class="contenido">
        <div class="imagen" id="game-background_url">
          <img src="${gameData.background_image}" alt="${gameData.name}" />
        </div>
        <div class="texto">
          <h2 class="NombreJuego" id="game-name">${gameData.name}</h2>
          <p id="game-description">
            ${gameData.description}
          </p>
          <div class="detalles">
            <div class="detalles-fila">
              <span><strong>Launch Date:</strong> ${gameData.released}</span>
              <span><strong>Classification:</strong> </span>
              <span><strong>Rating:</strong> ${gameData.rating}</span>
              <span><strong>Votes:</strong> 2243</span>
            </div>
            <div class="detalles-fila">
              <span
                ><strong>Platforms:</strong> ${gameData.platforms
                  ?.map(data => data.platform?.name)
                  ?.join(', ')}</span
              >
            </div>
            <div class="detalles-fila">
              <span
                ><strong>Stores:</strong> ${gameData.stores
                  ?.map(data => data.store?.name)
                  ?.join(', ')}</span
              >
            </div>
            <div class="detalles-fila">
              <span><strong>Genres:</strong> ${gameData.genres
                ?.map(genre => genre.name)
                ?.join(', ')}</span>
            </div>
            <div class="detalles-fila">
              <span
                ><strong>Tags:</strong> ${gameData.tags
                  ?.map(tag => tag.name)
                  ?.join(', ')}</span
                )}}</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>`;
