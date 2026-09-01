import { openapi } from '@orpc/openapi'
import { desc } from 'drizzle-orm'
import { z } from 'zod'
import { db, schema } from './db/client'
import { os } from './middleware'

const route = os

export default {
  list: route
    .meta(
      openapi({
        method: 'GET',
        path: '/items',
        operationId: 'listItems',
        summary: 'List items',
        tags: ['Items']
      })
    )
    .output(z.array(schema.ItemSchema))
    .handler(async () => {
      return db.select().from(schema.items).orderBy(desc(schema.items.createdAt))
    }),
  create: route
    .meta(
      openapi({
        method: 'POST',
        path: '/items',
        operationId: 'createItem',
        summary: 'Create an item',
        successStatus: 201,
        tags: ['Items']
      })
    )
    .input(schema.ItemCreateSchema)
    .output(schema.ItemSchema)
    .handler(async ({ input }) => {
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
}
