import { openapi } from '@orpc/openapi'
import { os } from '@orpc/server'
import { z } from 'zod'
import { apiErrors } from '@/api/errors'

export type ApiContext = {
  headers: Headers
}

const procedure = os.$context<ApiContext>().errors(apiErrors)

export const apiRouter = {
  hello: procedure
    .meta(openapi({ method: 'GET', path: '/hello', summary: 'Get a greeting' }))
    .input(z.object({ name: z.string().trim().min(1).max(100).default('World') }))
    .output(z.object({ message: z.string() }))
    .handler(({ input }) => ({ message: `Hello, ${input.name}!` }))
}
