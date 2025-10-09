import { Config, defineConfig } from 'drizzle-kit'
import { readdirSync } from 'fs'
import { join } from 'path'

const getLocalDbUrl = () => {
  const targetDir = join(process.cwd(), '.wrangler/state/v3/d1/miniflare-D1DatabaseObject')
  try {
    const files = readdirSync(targetDir)
    const dbFile = files.find((f) => f.endsWith('.sqlite') && !f.includes('.sqlite-wal') && !f.includes('.sqlite-shm'))
    if (!dbFile) throw new Error('No .sqlite file found')
    return `.wrangler/state/v3/d1/miniflare-D1DatabaseObject/${dbFile}`
  } catch {
    throw new Error('Local DB not found. Run wrangler d1 migrations apply DB --local')
  }
}

let config: Config

const localConfig = defineConfig({
  schema: './src/server/db/schema.ts',
  out: './src/server/db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: getLocalDbUrl()
  }
})

const remoteConfig = defineConfig({
  schema: './src/server/db/schema.ts',
  out: './src/server/db/migrations',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
    token: process.env.CLOUDFLARE_D1_TOKEN!
  }
})

config = localConfig

if (process.env.DB_CONFIG === 'remote') {
  config = remoteConfig
}

export default config
