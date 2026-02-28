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
    console.error(
      `Local DB not found, run the following: wrangler d1 execute DB --local --command 'SELECT 1' | If running db.ts init this should be done for you.`
    )
    return ''
  }
}

let config: Config

const schemaPath = '../shared/db/schema.ts'

const localConfig = defineConfig({
  schema: schemaPath,
  out: './src/db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: getLocalDBUrl()
  }
})

// Only used in scripts/db.ts for accessing dev/prod DBs
const remoteConfig = defineConfig({
  schema: schemaPath,
  out: './src/db/migrations',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID as string,
    databaseId: process.env.CLOUDFLARE_DATABASE_ID as string,
    token: process.env.CLOUDFLARE_D1_TOKEN as string
  }
})

config = localConfig

if (process.env.DB_CONFIG === 'remote') {
  config = remoteConfig
}

export default config
