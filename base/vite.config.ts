import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { defineConfig } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

// Nitro for bun/vercel deployments
// Cloudflare is different: https://tanstack.com/start/latest/docs/framework/react/hosting#cloudflare-workers
const buildPlugin =
  process.env.NODE_ENV === 'production'
    ? nitro({
        config: {
          preset: 'bun'
        }
      })
    : undefined

export default defineConfig({
  server: {
    port: 7777,
    host: true
  },
  plugins: [
    tsConfigPaths({
      projects: ['./tsconfig.json']
    }),
    tailwindcss(),
    tanstackStart(),
    buildPlugin,
    viteReact()
  ]
})
