import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

export const items = sqliteTable('items', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: integer('created_at')
    .notNull()
    .default(sql`(unixepoch())`)
})

export const ItemSchema = createSelectSchema(items)

export const ItemCreateSchema = createInsertSchema(items)
  .pick({ name: true })
  .extend({ name: z.string().trim().min(1).max(100) })

export type Item = z.infer<typeof ItemSchema>
export type ItemCreate = z.infer<typeof ItemCreateSchema>
