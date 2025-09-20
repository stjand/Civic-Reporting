// File: frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react()
  ],
  server: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: true,
    allowedHosts: 'all',
    watch: {
      usePolling: true,
      interval: 100
    }
  },
  css: {
    devSourcemap: true   // helps browser pick up CSS changes immediately
  }
})
