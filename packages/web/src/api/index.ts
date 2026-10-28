import { OpenAPIHandler } from '@orpc/openapi/fetch'
import { OpenAPIReferenceHandlerPlugin } from '@orpc/openapi/plugins'
import { ORPCError } from '@orpc/server'
import { RPCHandler } from '@orpc/server/fetch'
import { Hono } from 'hono'
import {
  apiErrorStatusMap,
  createApiErrorInterceptor,
  createApiErrorResponse,
  createApiHandlerErrorInterceptor
} from '@/api/errors'
import { OpenAPIGenerator } from '@orpc/openapi'
import { ZodToJsonSchemaConverter } from '@orpc/zod'
import { apiRouter, type ApiContext } from '@/api/router'

export const app = new Hono({ strict: false }).basePath('/api')
const errorInterceptor = createApiErrorInterceptor(import.meta.env.DEV)

const handlerOptions = {
  errorStatusMap: apiErrorStatusMap,
  interceptors: [createApiHandlerErrorInterceptor<ApiContext>(import.meta.env.DEV)],
  clientInterceptors: [errorInterceptor]
}

const rpcHandler = new RPCHandler(apiRouter, handlerOptions)
const generator = new OpenAPIGenerator({
  converters: [new ZodToJsonSchemaConverter()]
})

const openApiHandler = new OpenAPIHandler(apiRouter, {
  ...handlerOptions,
  plugins: [
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

app.onError((error) => createApiErrorResponse(error, import.meta.env.DEV))

app.notFound(() =>
  createApiErrorResponse(
    new ORPCError('NOT_FOUND', {
      message: 'The requested API route was not found'
    }),
    import.meta.env.DEV
  )
)

app.use('/rpc/*', async (c, next) => {
  const result = await rpcHandler.handle(c.req.raw, {
    prefix: '/api/rpc',
    context: { headers: c.req.raw.headers }
  })

  if (!result.matched) return next()
  return c.newResponse(result.response.body, result.response)
})

app.use('*', async (c, next) => {
  const result = await openApiHandler.handle(c.req.raw, {
    prefix: '/api',
    context: { headers: c.req.raw.headers }
  })

  if (!result.matched) return next()
  return c.newResponse(result.response.body, result.response)
})
