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
import { auth } from '@web/api/auth/server'
import { handleMcpRequest } from '@web/api/mcp'

// entry.ts passes these per request as Hono's env (the second app.fetch argument).
type AppEnv = {
  Bindings: {
    // Renders the TanStack Start app for paths that no Hono route owns.
    fallback: () => Response | Promise<Response>
  }
}

// Root app: the Worker sends every request here first (entry.ts).
export const app = new Hono<AppEnv>({ strict: false })

// API app: mounted at /api below, so its routes and handlers use paths relative to /api.
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

// Global error handler. Errors thrown in the mounted API app also reach it.
app.onError(error => createApiErrorResponse(error, import.meta.env.DEV))

// MCP endpoint. OAuth checks happen in handleMcpRequest; tools are oRPC procedures (api/mcp.ts).
app.all('/mcp', c => handleMcpRequest(c.req.raw))

// OAuth discovery documents that Better Auth serves for MCP clients. Only these paths, so other
// /.well-known files can still come from the Start app. Hono also answers HEAD with these GET handlers.
app.on(
  'GET',
  [
    '/.well-known/oauth-protected-resource',
    '/.well-known/oauth-protected-resource/mcp',
    '/.well-known/oauth-authorization-server/api/auth'
  ],
  c => auth.handler(c.req.raw)
)

// Better Auth handlers
api.on(['GET', 'POST'], '/auth/*', c => auth.handler(c.req.raw))

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

// Unknown API paths get a JSON API error, not the Start app's HTML 404.
// This must stay last: Hono runs handlers in registration order. Hono only calls notFound on the root
// app, so a child notFound handler would never run.
api.all('*', () =>
  createApiErrorResponse(
    new ORPCError('NOT_FOUND', {
      message: 'The requested API route was not found'
    }),
    import.meta.env.DEV
  )
)

app.route('/api', api)

// Every path without a Hono route goes to the TanStack Start app (pages, server functions, assets, its 404).
app.notFound(c => c.env.fallback())
