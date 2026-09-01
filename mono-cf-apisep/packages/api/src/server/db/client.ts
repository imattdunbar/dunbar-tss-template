import { drizzle as drizzleD1 } from 'drizzle-orm/d1'
import * as schema from './schema'
import { env } from '../env'

let db: ReturnType<typeof drizzleD1<typeof schema>>
db = drizzleD1(env.DB, { schema })

// if (process.env.BETTER_AUTH_CLI) {
//   const { drizzle } = await import('drizzle-orm/libsql')
//   const { createClient } = await import('@libsql/client')
//   db = drizzle(createClient({ url: 'file:./tmp/db.sqlite' }), { schema }) as unknown as typeof db
// } else {
//   db = drizzleD1(env.DB, { schema })
// }

export { db, schema }
