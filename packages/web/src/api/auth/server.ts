import { betterAuth } from 'better-auth'
import { jwt } from 'better-auth/plugins/jwt'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { apiKey } from '@better-auth/api-key'
import { drizzleAdapter } from '@better-auth/drizzle-adapter/relations-v2'
import { mcp } from '@better-auth/mcp'
import { env } from '@web/cloudflare/env'
import { db, schema } from '@web/db/client'

// The middleware uses this prefix to tell API keys from JWTs in a bearer header.
export const API_KEY_PREFIX = 'dt_'
export const JWT_AUDIENCE = 'dunbar-native'
// The auth schema CLI replaces Worker bindings with proxy functions, not URL strings.
const baseURL = typeof env.BETTER_AUTH_URL === 'string' ? env.BETTER_AUTH_URL : 'http://localhost:7777'
export const MCP_RESOURCE = new URL('/mcp', baseURL).href
export const MCP_SCOPES = ['mcp:tools']

export const auth = betterAuth({
  // Alchemy binds these to the Worker; process.env does not contain them in workerd.
  baseURL,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema
  }),
  // The startup schema check reads `db` outside a request, where the per-request database is unavailable.
  advanced: { database: { validateSchema: false } },
  emailAndPassword: {
    enabled: true
  },
  plugins: [
    // GET /api/auth/token issues a JWT for the current browser session.
    jwt({
      jwt: {
        audience: JWT_AUDIENCE,
        expirationTime: '60d',
        definePayload: ({ user }) => ({ email: user.email, name: user.name })
      }
    }),
    apiKey({
      defaultPrefix: API_KEY_PREFIX,
      // The default allows 10 requests per key per day, too low for API clients.
      rateLimit: { enabled: false }
    }),
    mcp({
      loginPage: '/test-auth',
      consentPage: '/consent',
      resource: MCP_RESOURCE,
      scopes: [...MCP_SCOPES, 'offline_access'],
      // URL-only clients register themselves without a pre-issued client ID.
      allowDynamicClientRegistration: true,
      allowUnauthenticatedClientRegistration: true,
      clientRegistrationDefaultApplicationType: 'infer',
      clientRegistrationDefaultScopes: [...MCP_SCOPES, 'offline_access']
    }),
    tanstackStartCookies()
  ]
})
