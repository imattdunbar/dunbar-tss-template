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
      name: input.name.trim()
    })
    .returning()

  if (!item) throw new Error('The item could not be created')

  return item
})

const triggerValidationError = os.examples.errors.validation.handler(() => ({ success: true as const }))

const triggerNotFoundError = os.examples.errors.notFound.handler(({ errors }) => {
  throw errors.NOT_FOUND()
})

const triggerConflictError = os.examples.errors.conflict.handler(({ errors }) => {
  throw errors.CONFLICT()
})

const triggerInternalError = os.examples.errors.internal.handler(() => {
  throw new Error('Example internal failure', {
    cause: new Error('Example root cause')
  })
})

export const apiRouter = os.router({
  items: {
    list: listItems,
    create: createItem
  },
  examples: {
    errors: {
      validation: triggerValidationError,
      notFound: triggerNotFoundError,
      conflict: triggerConflictError,
      internal: triggerInternalError
    }
  }
})
