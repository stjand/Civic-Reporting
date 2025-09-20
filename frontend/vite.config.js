// File: frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react()
  ],
  server: {
    host: '0.0.0.0',     // bind to all interfaces for Replit
    port: 5000,          // Replit standard port
    allowedHosts: 'all', // allow all hosts for Replit proxy
    watch: {
      usePolling: true,  // critical for file system changes
      interval: 100
    }
  },
  css: {
    devSourcemap: true   // helps browser pick up CSS changes immediately
  }
})
