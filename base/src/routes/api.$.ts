import { createFileRoute } from '@tanstack/react-router'
import { TanstackRouteHandlers } from '@/api'

export const Route = createFileRoute('/api/$')({
  server: {
    handlers: TanstackRouteHandlers
  }
})
