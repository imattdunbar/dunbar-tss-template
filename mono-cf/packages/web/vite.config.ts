import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  resolve: {
    tsconfigPaths: true
  },
  environments: {
    ssr: {
      build: {
        rolldownOptions: {
          external: ['cloudflare:workers']
        }
      }
    }
  },
  plugins: [
    tailwindcss(),
    tanstackStart({
      router: {
        // allows _layout.tsx to be for layouts instead of route.tsx
        routeToken: '_layout'
      }
    }),
    viteReact()
  ]
})
