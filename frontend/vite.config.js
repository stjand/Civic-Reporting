import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,           // allows access from other devices
    port: 5173,
    watch: {
      usePolling: true,   // critical for Docker or certain file systems
      interval: 100
    }
  },
  css: {
    devSourcemap: true
  }
})
