import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

export default defineConfig({
  server: {
    port: 7777,
    host: true
  },
  resolve: {
    tsconfigPaths: true
  },
  plugins: [
    tailwindcss(),
    tanstackStart({
      router: {
        // allows _layout.tsx to be for layouts instead of route.tsx
        routeToken: '_layout'
      }
    }),
    nitro({ preset: 'bun' }),
    viteReact()
  ]
})
