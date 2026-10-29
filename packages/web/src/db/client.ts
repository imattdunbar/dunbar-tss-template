import { drizzle as drizzleD1 } from 'drizzle-orm/d1'
import { env } from '@web/cloudflare/env'
import * as schema from '@web/db/schema'

const db = drizzleD1(env.DB, { relations: schema.relations })

export { db, schema }
