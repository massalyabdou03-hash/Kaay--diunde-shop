import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// robots.txt et favicon.svg sont dans /public : Vite les copie tout seul dans dist/.
// Le sitemap est généré à la demande par la fonction Netlify « sitemap ».
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
