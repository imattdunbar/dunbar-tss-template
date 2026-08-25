import { OpenAPIGenerator } from '@orpc/openapi'
import { OpenAPIHandler } from '@orpc/openapi/fetch'
import { OpenAPIReferenceHandlerPlugin } from '@orpc/openapi/plugins'
import { RPCHandler } from '@orpc/server/fetch'
import { ZodToJsonSchemaConverter } from '@orpc/zod'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { apiRouter } from '@/api/router'

const app = new Hono({ strict: false }).basePath('/api')

const rpcHandler = new RPCHandler(apiRouter)

const generator = new OpenAPIGenerator({
  converters: [new ZodToJsonSchemaConverter()]
})

const openAPIHandler = new OpenAPIHandler(apiRouter, {
  plugins: [
    new OpenAPIReferenceHandlerPlugin({
      docsPath: '/docs',
      specPath: '/openapi.json',
      provider: 'scalar',
      spec: () =>
        generator.generate(apiRouter, {
          base: {
            info: {
              title: 'Dunbar Template API',
              version: '1.0.0'
            }
          }
        })
    })
  ]
})

app.use('*', cors())

app.onError((error, c) => {
  console.error(error)
  return c.json({ error: 'Internal server error' }, 500)
})

app.get('/health', (c) => {
  return c.json({ status: 'ok' })
})

app.use('/rpc/*', async (c, next) => {
  const { matched, response } = await rpcHandler.handle(c.req.raw, {
    prefix: '/api/rpc',
    context: {}
  })

  if (matched) return c.newResponse(response.body, response)

  await next()
})

app.use('*', async (c, next) => {
  const { matched, response } = await openAPIHandler.handle(c.req.raw, {
    prefix: '/api',
    context: {}
  })

  if (matched) return c.newResponse(response.body, response)

  await next()
})

export const TanstackRouteHandlers = {
  ANY: ({ request }: { request: Request }) => app.fetch(request)
}
