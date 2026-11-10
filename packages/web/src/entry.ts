// Alchemy uses this entry for the Worker and its binding class exports.
import serverEntry, { createServerEntry } from '@tanstack/react-start/server-entry'
import { app } from '@web/api'

// Open Start's request scope before Hono so the database can access the current request.
export default createServerEntry({
  fetch(request, options) {
    // Preserve each request's Start options without shared mutable state.
    return app.fetch(request, {
      fallback: () => serverEntry.fetch(request, options)
    })
  }
})
