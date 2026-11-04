import { defineRelations } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { account, apikey, authRelations, jwks, session, user, verification } from './auth'

export * from './auth'

export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  text: text('text').notNull()
})

// The generated relation part omits tables without foreign keys, such as apikey and jwks.
export const relations = {
  ...defineRelations({ posts, account, apikey, jwks, session, user, verification }),
  ...authRelations
}
