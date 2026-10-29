import { createFileRoute } from '@tanstack/react-router'
import { app } from '@web/api'

export const Route = createFileRoute('/api/$')({
  server: {
    handlers: {
      ANY: ({ request }) => app.fetch(request)
    }
  }
})
