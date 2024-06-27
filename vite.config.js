import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [],
  build: {
    rollupOptions: {
      input: {
        main: '/index.html',
        page1: '/games.html',
        page2: '/game-detail.html',

        enviroment: '/.env',

        // Añade más páginas según sea necesario
      },
    },
  },
});
