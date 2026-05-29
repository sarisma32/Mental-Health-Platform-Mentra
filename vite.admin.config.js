import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Rewrite all requests to admin.html for SPA routing
    {
      name: 'admin-html-fallback',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          // Rewrite non-asset requests to admin.html
          if (!req.url.includes('.') && !req.url.startsWith('/@')) {
            req.url = '/admin.html'
          }
          next()
        })
      },
    },
  ],
  root: '.',
  server: {
    port: 5174,
  },
  build: {
    outDir: 'dist-admin',
    rollupOptions: {
      input: 'admin.html',
    },
  },
})
