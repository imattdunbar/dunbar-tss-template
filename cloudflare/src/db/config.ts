import { Config, defineConfig } from 'drizzle-kit'
import { readdirSync } from 'fs'
import { join } from 'path'

export const getLocalDBUrl = () => {
  const targetDir = join(process.cwd(), '.wrangler/state/v3/d1/miniflare-D1DatabaseObject')
  try {
    const files = readdirSync(targetDir)
    const dbFile = files.find((f) => f.endsWith('.sqlite') && !f.includes('.sqlite-wal') && !f.includes('.sqlite-shm'))
    if (!dbFile) throw new Error('No .sqlite file found')
    return `.wrangler/state/v3/d1/miniflare-D1DatabaseObject/${dbFile}`
  } catch {
    throw new Error(`Local DB not found, run the following: wrangler d1 execute DB --local --command 'SELECT 1'`)
  }
}

let config: Config

const localConfig = defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: getLocalDBUrl()
  }
})

const remoteConfig = defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
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
