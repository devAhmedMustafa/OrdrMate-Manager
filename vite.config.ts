import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 5174,
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': '/src',
      '$assets': '/src/assets'
    }
  }
})
