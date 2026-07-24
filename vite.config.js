import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    rollupOptions: {
      external: [
        'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js',
        'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js'
      ]
    }
  }
})

