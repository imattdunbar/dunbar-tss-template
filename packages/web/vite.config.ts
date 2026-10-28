import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: true,
    port: 7777,
    strictPort: true
  },
  resolve: {
    tsconfigPaths: true
  },
  plugins: [tailwindcss(), tanstackStart(), react()]
})
