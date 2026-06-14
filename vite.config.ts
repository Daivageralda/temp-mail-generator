import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/tempmail-api': {
        target: 'https://api.internal.temp-mail.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/tempmail-api/, '/api/v3'),
      },
    },
  },
})
