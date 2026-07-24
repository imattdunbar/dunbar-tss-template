import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from '@cloudflare/vite-plugin'

export default defineConfig({
  resolve: {
    tsconfigPaths: true
  },
  server: {
    port: 7777,
    host: true
  },
  plugins: [
    tailwindcss(),
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    tanstackStart({
      router: {
        // allows _layout.tsx to be for layouts instead of route.tsx
        routeToken: '_layout'
      }
    }),
    viteReact()
  ]
})
