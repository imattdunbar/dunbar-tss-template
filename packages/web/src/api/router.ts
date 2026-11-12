import '@tanstack/react-start/server-only'
import type { RouterClient } from '@orpc/server'
import { openapi } from '@orpc/openapi'
import { desc } from 'drizzle-orm'
import { createInsertSchema, createSelectSchema } from 'drizzle-orm/zod'
import { z } from 'zod'
import { authenticationSchema } from '@web/api/auth/authenticate'
import procedures from '@web/api/procedures'
import { db, schema } from '@web/db/client'

const postSelectSchema = createSelectSchema(schema.posts)

const postInsertSchema = createInsertSchema(schema.posts, {
  text: field => {
    return field.trim().min(1, 'Enter some text for the post.').max(2000)
  }
})

const hello = procedures.public
  .meta(openapi({ method: 'GET', path: '/hello', summary: 'Get a greeting' }))
  .input(z.object({ name: z.string().trim().min(1).max(100).default('World') }))
  .output(z.object({ message: z.string() }))
  .handler(async opts => {
    return { message: `Hello, ${opts.input.name}!` }
  })

const listPosts = procedures.public
  .meta(openapi({ method: 'GET', path: '/posts', summary: 'List posts' }))
  .output(z.array(postSelectSchema))
  .handler(async () => {
    const posts = await db.select().from(schema.posts).orderBy(desc(schema.posts.id))

    return posts
  })

const createPost = procedures.public
  .meta(openapi({ method: 'POST', path: '/posts', summary: 'Create a post', successStatus: 201 }))
  .input(postInsertSchema)
  .output(postSelectSchema)
  .handler(async opts => {
    const [post] = await db.insert(schema.posts).values(opts.input).returning()

    if (!post) throw opts.errors.INTERNAL_SERVER_ERROR()

    return post
  })

const me = procedures.authed
  .meta(openapi({ method: 'GET', path: '/me', summary: 'Get the authenticated user' }))
  .output(authenticationSchema)
  .handler(async opts => {
    return opts.context.auth
  })

export const apiRouter = {
  hello,
  me,
  posts: {
    list: listPosts,
    create: createPost
  }
}

export type ApiClient = RouterClient<typeof apiRouter>
