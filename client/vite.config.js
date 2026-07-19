import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5180,
    open: true,
    host: 'localhost',
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
      '/media': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        rewrite: (path) => path,
      },
    },
  },
})
