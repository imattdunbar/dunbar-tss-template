import { createFileRoute } from '@tanstack/react-router'
import { app } from '@/api'

export const Route = createFileRoute('/api/$')({
  server: {
    handlers: {
      ANY: ({ request }) => app.fetch(request)
    }
  }
})
