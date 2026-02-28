import { $ } from 'bun'
import { z } from 'zod'
import wranglerJson from '../../../wrangler.jsonc'
import { getLocalDBUrl } from '@/db/config'

const args = process.argv.slice(2)
const remote = args[1] === '--remote'
const local = !remote

async function init() {
  await generate()
  await migrate()
}

async function generate() {
  const dbConfig = 'src/db/config.ts'

  if (local) {
    await $`bun run wrangler d1 execute DB --local --command 'SELECT 1'`
    await Bun.write('./tmp/db.sqlite', '')
  }

  await $`bun run drizzle-kit generate --config ${dbConfig}`
}

async function migrate() {
  console.log('Applying migrations')
  await $`bun run wrangler d1 migrations apply DB${remote ? '--remote' : ''}`
}

async function studio() {
  console.log('Starting Drizzle Studio...')

  const envArg = args[1]

  // Gets the databse id from wrangler.jsonc
  const prodDB = (wranglerJson.d1_databases as any[])[0].database_id
  const devDB = (wranglerJson.env.dev.d1_databases as any[])[0].database_id

  let env: any = {
    ...process.env
  }

  // Adds API token from 1Pass and relevant database id
  if (envArg) {
    env.DB_CONFIG = 'remote'
    env.CLOUDFLARE_ACCOUNT_ID = '2b3e0f465eb005d61b0fc8f019ee7d95'
    env.CLOUDFLARE_D1_TOKEN = await getCloudflareAPITokenFrom1Pass()

    if (envArg === 'prod') {
      env.CLOUDFLARE_DATABASE_ID = prodDB
    }
    if (envArg === 'dev') {
      env.CLOUDFLARE_DATABASE_ID = devDB
    }
  }

  const child = Bun.spawn(['bun', 'run', 'drizzle-kit', 'studio', '--config', 'src/db/main/config.ts'], {
    cwd: process.cwd(),
    stdin: 'inherit',
    stdout: 'inherit',
    stderr: 'inherit',
    env
  })

  const exitCode = await child.exited

  if (exitCode !== 0) {
    process.exit(exitCode)
  }
}

async function cloneRemote() {
  const localDBUrl = getLocalDBUrl()

  const databases = wranglerJson.d1_databases as any[]
  if (databases.length < 1) {
    console.log('Could not find d1 databases in wrangler.jsonc')
    return
  }

  const remoteDB = databases[0]
  const remoteDBName = remoteDB.database_name

  if (!remoteDB || !remoteDBName) {
    console.log('Could not find d1 database name in wrangler.jsonc')
    return
  }

  await $`wrangler d1 export ${remoteDBName} --remote --output=${localDBUrl}`
}

async function getCloudflareAPITokenFrom1Pass() {
  const ACCOUNT_ID = 'JTBWQ5UAQRHP7G2DZ66QVMOY4U'
  const VAULT_NAME = 'Personal'
  const ITEM_NAME = 'Cloudflare'

  const result =
    await $`op item get "${ITEM_NAME}" --vault "${VAULT_NAME}" --account "${ACCOUNT_ID}" --format json`.text()
  const fields = JSON.parse(result).fields as any[]
  const key = fields.find((entry: { label: string; value: string }) => entry.label === 'D1 Token')

  return key.value
}

async function main() {
  const schema = z.enum([
    'init', // Local init, generates DB and runs migrations
    'generate', // Generate auth+schema for main db, and durable schema
    'migrate', // Apply migrations
    'studio', // Drizzle Studio
    'clone-remote' // Clones the remote database in wrangler.jsonc to the local wrangler db state
  ])

  const cmd = schema.safeParse(args[0]).data

  if (!cmd) {
    console.log('\nInvalid db command\n')
    console.log(`Valid options:\n${schema.options.join('\n')}`)
    return
  }

  if (cmd === 'generate') {
    await generate()
  } else if (cmd === 'migrate') {
    await migrate()
  } else if (cmd === 'studio') {
    // await studio()
  } else if (cmd === 'clone-remote') {
    // await cloneRemote()
  } else if (cmd === 'init') {
    await init()
  } else {
    console.log('Failed to match command', cmd)
  }
}

await main()
