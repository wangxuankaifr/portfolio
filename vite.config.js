import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: ['index.html', 'mobile.html', 'mobile-preview.html'],
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5180,
    strictPort: true,
    headers: { 'Cache-Control': 'no-store' },
  },
  preview: {
    port: 5181,
  },
})
