// Cloudflare Worker entry. Alchemy points `main` here (alchemy.run.ts), so this module decides what the Worker exports.
// Export Durable Object, Workflow, and other binding classes from this file so Cloudflare can find them.

import serverEntry, { createServerEntry } from '@tanstack/react-start/server-entry'
import { app } from '@web/api'

// createServerEntry opens Start's per-request scope before our code runs. Everything below runs inside it,
// so getRequest() works in Hono handlers too (the per-request database in db/client.ts depends on it).
export default createServerEntry({
  fetch(request, options) {
    // Hono handles /api, /mcp, and the OAuth discovery documents (api/index.ts).
    // Any other path reaches Hono's notFound handler, which calls this fallback to render the TanStack Start app.
    // A per-request closure keeps Start's request options without shared state.
    return app.fetch(request, {
      fallback: () => serverEntry.fetch(request, options)
    })
  }
})

// Cloudflare binding classes go here, for example:
// export { MyDurableObject } from '@web/cloudflare/MyDurableObject'
