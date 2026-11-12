import '@tanstack/react-start/server-only'
import type { RouterClient } from '@orpc/server'
import { openapi } from '@orpc/openapi'
import { z } from 'zod'
import procedures from '@web/api/procedures'

const hello = procedures.public
  .meta(openapi({ method: 'GET', path: '/hello', summary: 'Get a greeting' }))
  .input(z.object({ name: z.string().trim().min(1).max(100).default('World') }))
  .output(z.object({ message: z.string() }))
  .handler(async opts => {
    return { message: `Hello, ${opts.input.name}!` }
  })

export const apiRouter = {
  hello
}

export type ApiClient = RouterClient<typeof apiRouter>
