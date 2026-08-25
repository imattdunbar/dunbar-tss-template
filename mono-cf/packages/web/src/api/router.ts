import { apiContract } from '@dunbar/shared/api/contract'
import { implement } from '@orpc/server'
import { desc } from 'drizzle-orm'
import { db, schema } from '@/db/client'

const os = implement(apiContract)

const listItems = os.items.list.handler(async () => {
  return db.select().from(schema.items).orderBy(desc(schema.items.createdAt))
})

const createItem = os.items.create.handler(async ({ input }) => {
  const [item] = await db
    .insert(schema.items)
    .values({
      id: crypto.randomUUID(),
      name: input.name
    })
    .returning()

  if (!item) throw new Error('The item could not be created')

  return item
})

export const apiRouter = os.router({
  items: {
    list: listItems,
    create: createItem
  }
})
