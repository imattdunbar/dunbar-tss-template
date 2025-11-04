import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { onErrorHandler } from '@/api/errors'

const app = new Hono({ strict: false }).basePath('/api')
app.use('*', cors())
app.onError(onErrorHandler)

app.get('/health', async (c) => {
  return c.json({ sup: 'nerd' })
})

const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD']
const handler = (ctx: { request: Request }) => app.fetch(ctx.request)

export const TanstackRouteHandlers = Object.fromEntries(methods.map((method) => [method, handler]))
