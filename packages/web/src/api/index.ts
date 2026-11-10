import { OpenAPIHandler } from '@orpc/openapi/fetch'
import { OpenAPIReferenceHandlerPlugin } from '@orpc/openapi/plugins'
import { ORPCError } from '@orpc/server'
import { RPCHandler } from '@orpc/server/fetch'
import { ResponseHeadersHandlerPlugin } from '@orpc/server/plugins'
import { Hono } from 'hono'
import {
  apiErrorStatusMap,
  createApiErrorInterceptor,
  createApiErrorResponse,
  createApiHandlerErrorInterceptor
} from '@web/api/errors'
import { OpenAPIGenerator } from '@orpc/openapi'
import { ZodToJsonSchemaConverter } from '@orpc/zod'
import type { ApiContext } from '@web/api/procedures'
import { apiRouter } from '@web/api/router'

// entry.ts supplies a separate Start fallback for each request.
type AppEnv = {
  Bindings: {
    fallback: () => Response | Promise<Response>
  }
}

// The root app handles API requests before Start handles pages and server functions.
export const app = new Hono<AppEnv>({ strict: false })
const api = new Hono({ strict: false })

// ORPC handler options / error interceptor
const errorInterceptor = createApiErrorInterceptor(import.meta.env.DEV)

const handlerOptions = {
  errorStatusMap: apiErrorStatusMap,
  // Procedures set headers through context.resHeaders; the plugin adds them to the response.
  plugins: [new ResponseHeadersHandlerPlugin<ApiContext>()],
  interceptors: [createApiHandlerErrorInterceptor<ApiContext>(import.meta.env.DEV)],
  clientInterceptors: [errorInterceptor]
}

// RPC handler
const rpcHandler = new RPCHandler(apiRouter, handlerOptions)

// OpenAPI generator
const generator = new OpenAPIGenerator({
  converters: [new ZodToJsonSchemaConverter()]
})

// Regular REST handler + OpenAPI docs config
const openApiHandler = new OpenAPIHandler(apiRouter, {
  ...handlerOptions,
  plugins: [
    ...handlerOptions.plugins,
    new OpenAPIReferenceHandlerPlugin({
      docsPath: '/docs',
      specPath: '/openapi.json',
      spec: () =>
        generator.generate(apiRouter, {
          version: '3.1.1',
          errorStatusMap: apiErrorStatusMap,
          base: {
            info: { title: 'Dunbar API', version: '1.0.0' },
            servers: [{ url: '/api' }]
          }
        })
    })
  ]
})

// Global error handler
app.onError(error => createApiErrorResponse(error, import.meta.env.DEV))

// RPC handlers from ORPC
api.use('/rpc/*', async (c, next) => {
  const result = await rpcHandler.handle(c.req.raw, {
    prefix: '/api/rpc',
    context: { headers: c.req.raw.headers }
  })

  if (!result.matched) return next()
  return c.newResponse(result.response.body, result.response)
})

// Regular REST handlers from ORPC
api.use('*', async (c, next) => {
  const result = await openApiHandler.handle(c.req.raw, {
    prefix: '/api',
    context: { headers: c.req.raw.headers }
  })

  if (!result.matched) return next()
  return c.newResponse(result.response.body, result.response)
})

// Keep this last so unknown API paths return JSON instead of the Start HTML fallback.
api.all('*', () =>
  createApiErrorResponse(
    new ORPCError('NOT_FOUND', {
      message: 'The requested API route was not found'
    }),
    import.meta.env.DEV
  )
)

app.route('/api', api)
app.notFound(c => c.env.fallback())
