export const gameCard = (game, extraGameData, genres) => `<div class="card">
        <div class="card-img">
        
        <img src="${game.background_image}" class="card-img-top" alt="${
  game.name
}" alt="${game.name}" />
      </div>
        <div class="card-body text-center">
          <h5 class="card-title text-center">${game.name}</h5>
          <div class="card-informacionOculta">
          </div>
          <section class="stars text-start">
          <div class="star">
            <img src="https://cdn.discordapp.com/attachments/1253096511315775595/1255957477808148531/dark-stars.png?ex=667f050d&is=667db38d&hm=2b28300e1578990302023a607bed798210a760519c0715b418e7d3a9790d6d6a&" alt="stars" />
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

        ${genres ? `<p class="text-start">${genres.join(', ')}</p>` : ''}
        <a href="/game-detail.html?id=${
          game.id
        }" class="btn btn-primary">View More</a>
        </div>
        
      </div>
      `;
