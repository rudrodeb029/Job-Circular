import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  optimizeDeps: {
    exclude: ['firebase/app', 'firebase/firestore']
  },
  build: {
    rollupOptions: {
      external: ['firebase/app', 'firebase/firestore']
    }
  }
})

