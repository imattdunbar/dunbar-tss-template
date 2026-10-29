import { openapi } from '@orpc/openapi'
import { os } from '@orpc/server'
import { desc } from 'drizzle-orm'
import { createInsertSchema, createSelectSchema } from 'drizzle-orm/zod'
import { z } from 'zod'
import { apiErrors } from '@web/api/errors'
import { db, schema } from '@web/db/client'

export type ApiContext = {
  headers: Headers
}

const procedure = os.$context<ApiContext>().errors(apiErrors)

const postSelectSchema = createSelectSchema(schema.posts)

const postInsertSchema = createInsertSchema(schema.posts, {
  text: (field) => field.trim().min(1, 'Enter some text for the post.').max(2000)
}).omit({ id: true })

const hello = procedure
  .meta(openapi({ method: 'GET', path: '/hello', summary: 'Get a greeting' }))
  .input(z.object({ name: z.string().trim().min(1).max(100).default('World') }))
  .output(z.object({ message: z.string() }))
  .handler(async ({ input }) => {
    return { message: `Hello, ${input.name}!` }
  })

const listPosts = procedure
  .meta(openapi({ method: 'GET', path: '/posts', summary: 'List posts' }))
  .output(z.array(postSelectSchema))
  .handler(async () => {
    const posts = await db.select().from(schema.posts).orderBy(desc(schema.posts.id))

    return posts
  })

const createPost = procedure
  .meta(openapi({ method: 'POST', path: '/posts', summary: 'Create a post', successStatus: 201 }))
  .input(postInsertSchema)
  .output(postSelectSchema)
  .handler(async ({ input, errors }) => {
    const [post] = await db.insert(schema.posts).values(input).returning()

    if (!post) throw errors.INTERNAL_SERVER_ERROR()

    return post
  })

export const apiRouter = {
  hello,
  posts: {
    list: listPosts,
    create: createPost
  }
}
