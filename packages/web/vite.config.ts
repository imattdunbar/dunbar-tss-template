import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    tsconfigPaths: true
  },
  environments: {
    ssr: {
      build: {
        rolldownOptions: {
          // Alchemy replaces the Cloudflare Vite plugin, which normally marks this module as external.
          // The Workers runtime provides it at runtime.
          external: ['cloudflare:workers']
        }
      }
    }
  },
  plugins: [tailwindcss(), tanstackStart(), react()]
})
