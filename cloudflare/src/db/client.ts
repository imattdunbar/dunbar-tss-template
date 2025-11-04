import { drizzle as drizzleD1 } from 'drizzle-orm/d1'
import * as schema from '@/db/schema'

let db: ReturnType<typeof drizzleD1<typeof schema>>

if (process.env.BETTER_AUTH_CLI) {
  // If it's the CLI pretend it's a local sqlite file
  const { drizzle: drizzleLibsql } = await import('drizzle-orm/libsql')
  const { createClient } = await import('@libsql/client')

  const client = createClient({
    url: 'file:./tmp/db.sqlite'
  })

  db = drizzleLibsql(client) as any
} else {
  // Otherwise get the cloudflare worker env and export as normal
  const { env } = await import('cloudflare:workers')
  db = drizzleD1(env.DB, { schema })
}

export { db, schema }
