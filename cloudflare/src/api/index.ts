import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { onErrorHandler } from '@/api/errors'
import { auth } from '@/core/auth/server'

const app = new Hono<{ Bindings: CloudflareEnv }>({ strict: false }).basePath('/api')

app.use('*', cors())
app.onError(onErrorHandler)

app.get('/health', async (c) => {
  return c.json({ sup: 'nerd' })
})

// Handle /api/auth with better-auth
app.on(['POST', 'GET'], '/auth/*', async (c) => {
  return auth.handler(c.req.raw)
})

const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD']
const handler = (ctx: { request: Request }) => app.fetch(ctx.request)

export const TanstackRouteHandlers = Object.fromEntries(methods.map((method) => [method, handler]))
