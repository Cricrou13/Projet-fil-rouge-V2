import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Le front tourne sur 5173, l'API sur le vhost .test. Sans ce proxy la
      // requete est cross-origin et le navigateur refuse d'y mettre le cookie de
      // session ; avec, /index.php?route=... part de la meme origine que la page.
      '/index.php': {
        target: 'http://projet-fil-rouge-v2.test',
        changeOrigin: true,
      },
    },
  },
})
