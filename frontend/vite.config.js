import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Keep Vite cache out of node_modules so Railway's install + build steps don't clash.
  cacheDir: '.vite',
  server: {
    port: 5173,
  },
})
