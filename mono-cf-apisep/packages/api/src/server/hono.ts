import { OpenAPIGenerator } from '@orpc/openapi'
import { OpenAPIHandler } from '@orpc/openapi/fetch'
import { OpenAPIReferenceHandlerPlugin } from '@orpc/openapi/plugins'
import { RPCHandler } from '@orpc/server/fetch'
import { ZodToJsonSchemaConverter } from '@orpc/zod'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { auth } from './auth'
import { apiErrorStatusMap, onErrorHandler, onNotFoundHandler, orpcErrorInterceptor } from './errors'
import { apiRouter } from './router'

const app = new Hono({ strict: false }).basePath('/api')

const rpcHandler = new RPCHandler(apiRouter, {
  clientInterceptors: [orpcErrorInterceptor],
  errorStatusMap: apiErrorStatusMap
})

const generator = new OpenAPIGenerator({
  converters: [new ZodToJsonSchemaConverter({ cache: true })]
})

const openAPIHandler = new OpenAPIHandler(apiRouter, {
  clientInterceptors: [orpcErrorInterceptor],
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

app.on(['GET', 'POST'], '/auth/*', (c) => auth.handler(c.req.raw))

app.get('/health', (c) => {
  return c.json({ status: 'ok' })
})

app.use('/rpc/*', async (c, next) => {
  const responseHeaders = new Headers()
  const { matched, response } = await rpcHandler.handle(c.req.raw, {
    prefix: '/api/rpc',
    context: {
      headers: c.req.raw.headers,
      responseHeaders
    }
  })

  if (!matched) return next()

  const result = c.newResponse(response.body, response)
  responseHeaders.forEach((value, name) => result.headers.set(name, value))
  return result
})

app.use('*', async (c, next) => {
  const responseHeaders = new Headers()
  const { matched, response } = await openAPIHandler.handle(c.req.raw, {
    prefix: '/api',
    context: {
      headers: c.req.raw.headers,
      responseHeaders
    }
  })

  if (!matched) return next()

  const result = c.newResponse(response.body, response)
  responseHeaders.forEach((value, name) => result.headers.set(name, value))
  return result
})

export const TanstackRouteHandlers = {
  ANY: ({ request }: { request: Request }) => app.fetch(request)
}
