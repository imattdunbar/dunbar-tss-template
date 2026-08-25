import { apiErrorStatusMap } from '@dunbar/shared/api/errors'
import { OpenAPIGenerator } from '@orpc/openapi'
import { OpenAPIHandler } from '@orpc/openapi/fetch'
import { OpenAPIReferenceHandlerPlugin } from '@orpc/openapi/plugins'
import { onError } from '@orpc/server'
import { RPCHandler } from '@orpc/server/fetch'
import { ZodToJsonSchemaConverter } from '@orpc/zod'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { normalizeError, onErrorHandler, onNotFoundHandler } from '@/api/errors'
import { apiRouter } from '@/api/router'

const app = new Hono({ strict: false }).basePath('/api')

const rpcHandler = new RPCHandler(apiRouter, {
  clientInterceptors: [onError((error) => normalizeError(error))],
  errorStatusMap: apiErrorStatusMap
})

const generator = new OpenAPIGenerator({
  converters: [new ZodToJsonSchemaConverter({ cache: true })]
})

const openAPIHandler = new OpenAPIHandler(apiRouter, {
  clientInterceptors: [onError((error) => normalizeError(error))],
  errorStatusMap: apiErrorStatusMap,
  plugins: [
    new OpenAPIReferenceHandlerPlugin({
      docsPath: '/docs',
      specPath: '/openapi.json',
      provider: 'scalar',
      spec: () =>
        generator.generate(apiRouter, {
          errorStatusMap: apiErrorStatusMap,
          base: {
            openapi: '3.1.1',
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

app.onError(onErrorHandler)
app.notFound(onNotFoundHandler)

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
