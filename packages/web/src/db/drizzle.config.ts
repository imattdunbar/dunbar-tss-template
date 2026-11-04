import { defineConfig } from 'drizzle-kit'

const url = process.env.DATABASE_URL

const config = defineConfig({
  dialect: 'postgresql',
  // Drizzle resolves these paths from the web package's command directory.
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dbCredentials: url ? { url } : undefined
})

export default config
