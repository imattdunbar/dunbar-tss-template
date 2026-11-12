import { requireMcpAuth } from '@better-auth/mcp'
import { createMcpHandler, McpServer } from '@modelcontextprotocol/server'
import { McpRegistrar } from '@orpc/mcp'
import { ORPCError } from '@orpc/server'
import { ZodToJsonSchemaConverter } from '@orpc/zod'
import { authenticateOAuth, authenticationSchema } from '@web/api/auth/authenticate'
import { auth, MCP_RESOURCE, MCP_SCOPES } from '@web/api/auth/server'
import { createApiHandlerErrorInterceptor } from '@web/api/errors'
import type { ApiContext } from '@web/api/procedures'
import { apiRouter } from '@web/api/router'

// Agents get only the procedures listed here; new API procedures stay private by default.
const mcpRouter = {
  me: apiRouter.me,
  posts: { list: apiRouter.posts.list }
}

const registrar = new McpRegistrar(mcpRouter, {
  converters: [new ZodToJsonSchemaConverter()],
  interceptors: [createApiHandlerErrorInterceptor<ApiContext>(import.meta.env.DEV)]
})

const mcpHandler = createMcpHandler(async ({ authInfo }) => {
  const server = new McpServer({ name: 'dunbar', version: '1.0.0' })
  const caller = authenticationSchema.parse(authInfo?.extra?.auth)
  await registrar.register(server, { context: { headers: new Headers(), auth: caller } })
  return server
})

export const handleMcpRequest = requireMcpAuth(
  auth,
  async (request, claims) => {
    const caller = claims.sub ? await authenticateOAuth(claims.sub) : null
    if (!caller) throw new ORPCError('UNAUTHORIZED', { message: 'Unknown user' })

    return mcpHandler.fetch(request, {
      authInfo: {
        token: '',
        clientId: String(claims.azp),
        scopes: String(claims.scope ?? '').split(' '),
        extra: { auth: caller }
      }
    })
  },
  {
    resource: MCP_RESOURCE,
    requiredScopes: MCP_SCOPES,
    // Clients need offline_access to obtain refresh tokens, not just short-lived access tokens.
    challengeScopes: [...MCP_SCOPES, 'offline_access'],
    // Better Auth 1.7.17 accepts a function at runtime despite its URL-only public type.
    // Keep JWKS reads in-process; a public self-fetch adds a deployment constraint.
    jwksUrl: (() => auth.api.getJwks()) as unknown as string
  }
)
