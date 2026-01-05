import { Elysia } from 'elysia'
import { openapi } from '@elysiajs/openapi'
import * as z from 'zod'
import { AppError, onErrorHandler } from './errors'

const app = new Elysia({ prefix: '/api' })
  .use(
    openapi({
      provider: 'scalar',
      path: '/docs',
      specPath: '/spec',
      mapJsonSchema: {
        zod: z.toJSONSchema
      }
    })
  )
  .onError(onErrorHandler)
  .get('/', () => 'Hello Elysia')
  .post(
    '/sign-in',
    async (c) => {
      // this will match and is typechecked below in "response"
      return c.status(201, {
        haha: 'lol'
      })
    },
    {
      // headers: z.object({
      //   auth: z.string().describe('the auth thing')
      // }),
      body: z.object({
        username: z.string().meta({ description: 'username!', example: 'john_doe' }),
        password: z.string().min(8).meta({
          example: 'securePassword123',
          description: 'User password (at least 8 characters)'
        })
      }),
      detail: {
        summary: 'Sign in the user',
        tags: ['authentication']
      },
      response: {
        200: z.object({
          test: z.string()
        }),
        201: z.object({
          haha: z.string()
        }),
        404: z.object({
          message: z.string()
        })
      }
    }
  )

const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD']
const handler = (ctx: { request: Request }) => app.fetch(ctx.request)

export const TanstackRouteHandlers = Object.fromEntries(methods.map((method) => [method, handler]))
