import { createFileRoute } from '@tanstack/react-router'
import { TanstackRouteHandlers } from '@dunbar/api/server/hono'

export const Route = createFileRoute('/api/$')({
  server: {
    handlers: TanstackRouteHandlers
  }
})
