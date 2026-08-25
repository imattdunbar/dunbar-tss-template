import { drizzle as drizzleD1 } from 'drizzle-orm/d1'
import * as schema from '@dunbar/shared/db/schema'
import { env } from '@/cloudflare/env'

const db: ReturnType<typeof drizzleD1<typeof schema>> = drizzleD1(env.DB, { schema })

export { db, schema }
