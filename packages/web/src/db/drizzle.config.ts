import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'sqlite',
  // Drizzle resolves these paths from the web package's command directory.
  schema: './src/db/schema.ts',
  out: './src/db/migrations'
})
