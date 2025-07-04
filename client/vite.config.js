import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_BASE_URL || 'http://localhost:3000',
        changeOrigin: true,
        secure: true
      },
      '/auth/api': {
        target: process.env.VITE_BASE_URL || 'http://localhost:3000',
        changeOrigin: true,
        secure: true
      }
    }
  }
})
