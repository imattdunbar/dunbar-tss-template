import { env } from 'cloudflare:workers'
import { drizzle } from 'drizzle-orm/d1'

// import * as schema from '@/server/db/schema'

// Need this for db.query to work, can be done after .wrangler/* exists
// export const db = drizzle(env.DB, { schema })

export const db = drizzle(env.DB)
