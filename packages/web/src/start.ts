import { createCsrfMiddleware, createMiddleware, createStart } from '@tanstack/react-start'

// Discovery documents Better Auth serves for the MCP resource. Other /.well-known paths stay with the router.
const OAUTH_METADATA_PATHS = new Set([
  '/.well-known/oauth-protected-resource',
  '/.well-known/oauth-protected-resource/mcp',
  '/.well-known/oauth-authorization-server/api/auth'
])

// Sends non-page endpoints to their handlers inside Start's request scope, which the per-request database needs.
// Dynamic imports keep server-only modules out of the client bundle.
const dispatch = createMiddleware().server(async ({ request, next }) => {
  const { pathname } = new URL(request.url)

  if (pathname === '/api' || pathname.startsWith('/api/')) {
    const { app } = await import('@web/api')
    return app.fetch(request)
  }

  if (pathname === '/mcp') {
    const { handleMcpRequest } = await import('@web/api/mcp')
    return handleMcpRequest(request)
  }

  if (OAUTH_METADATA_PATHS.has(pathname)) {
    const { auth } = await import('@web/api/auth/server')
    return auth.handler(request)
  }

  return next()
})

export const startInstance = createStart(() => ({
  requestMiddleware: [
    // A custom start.ts replaces Start's default CSRF protection for server functions.
    createCsrfMiddleware({ filter: ({ handlerType }) => handlerType === 'serverFn' }),
    dispatch
  ]
}))
