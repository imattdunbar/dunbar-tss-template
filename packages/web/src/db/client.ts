import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { getRequest } from '@tanstack/react-start/server'
import { env } from '@web/cloudflare/env'
import * as schema from '@web/db/schema'

type Database = ReturnType<typeof connect>

// Cloudflare only allows database access inside a request, so connect lazily.
function connect() {
  const pool = new Pool({ connectionString: env.HYPERDRIVE.connectionString })
  return drizzle({ client: pool, relations: schema.relations })
}

// One connection per request; entries disappear when the request ends.
const connections = new WeakMap<Request, Database>()

function getDatabase() {
  const request = getRequest()

  const existing = connections.get(request)
  if (existing) return existing

  const database = connect()
  connections.set(request, database)
  return database
}

// `db` is a stand-in: reading any property (db.select, db.query, ...)
// reads it from the current request's database instead.
// `{} as Database` is only for types; the empty object is never used.
const db = new Proxy({} as Database, {
  get: (_, key) => Reflect.get(getDatabase(), key)
})

export { db, schema }
