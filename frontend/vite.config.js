import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Define the port of your Express backend server
const backendPort = 3001; 

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  server: {
    port: 5173,
    // Setting host: true is required for network/mobile access
    host: true, 
    watch: {
      usePolling: true,
      interval: 100
    },
    // 🟢 CRITICAL FIX: PROXY CONFIGURATION ADDED HERE
    proxy: {
      // Proxy requests starting with /api (like /api/geocode/reverse)
      '/api': {
        target: `http://localhost:${backendPort}`,
        changeOrigin: true,
        secure: false, // Set to true if your backend uses HTTPS
        rewrite: (path) => path.replace(/^\/api/, '/api'), // Standard proxy rewrite rule
      },
      // Ensure uploaded files (if needed) are also served correctly
      '/uploads': {
        target: `http://localhost:${backendPort}`,
        changeOrigin: true,
        secure: false,
      },
    },
    // The host field already supports 0.0.0.0 via host: true, 
    // ensuring the server is accessible on the local network (for mobile testing).
  }
})
