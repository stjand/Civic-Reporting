// File: frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react()
  ],
  server: {
    host: true,          // allows access from other devices
    port: 5173,
    watch: {
      usePolling: true,  // critical for Docker to detect file changes
      interval: 100
    }
  },
  css: {
    devSourcemap: true   // helps browser pick up CSS changes immediately
  }
})
