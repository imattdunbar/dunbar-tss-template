import { sqliteTable, text, integer, primaryKey, unique } from 'drizzle-orm/sqlite-core'
import { v7 as uuidv7 } from 'uuid'
import { relations } from 'drizzle-orm'

// Needed to get drizzle to pick up all the exports from the generated auth-schema
export * from '@/db/auth-schema'

// Import them back for use with relations
import * as authSchema from '@/db/auth-schema'
