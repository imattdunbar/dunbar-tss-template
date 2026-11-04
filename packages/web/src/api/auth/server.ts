import { betterAuth } from 'better-auth'
import { jwt } from 'better-auth/plugins/jwt'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { apiKey } from '@better-auth/api-key'
import { drizzleAdapter } from '@better-auth/drizzle-adapter/relations-v2'
import { env } from '@web/cloudflare/env'
import { db, schema } from '@web/db/client'

// The middleware uses this prefix to tell API keys from JWTs in a bearer header.
export const API_KEY_PREFIX = 'dt_'
export const JWT_AUDIENCE = 'dunbar-native'

export const auth = betterAuth({
  // Alchemy binds these to the Worker; process.env does not contain them in workerd.
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema
  }),
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
    tanstackStartCookies()
  ]
})
