import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: '../shared/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'sqlite'
})
