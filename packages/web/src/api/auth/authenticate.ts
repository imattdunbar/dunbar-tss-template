import { z } from 'zod'
import { API_KEY_PREFIX, auth } from '@web/api/auth/server'
import { refreshNativeJwt, verifyNativeJwt } from '@web/api/auth/jwt'
import { db } from '@web/db/client'

// The single source for the caller shape: procedures validate output with it, and the type comes from it.
export const authenticationSchema = z.object({
  userId: z.string(),
  email: z.string(),
  type: z.enum(['session', 'api-key', 'jwt', 'oauth'])
})

export type Authentication = z.infer<typeof authenticationSchema>
type AuthenticationType = Authentication['type']

/** The verified caller, plus a renewed JWT when the old one nears expiry. */
export type AuthResult = {
  auth: Authentication
  refreshedToken?: string
}

type Credential = { type: 'api-key'; key: string } | { type: 'jwt'; token: string } | { type: 'session' }

// A request uses one credential. An explicit key or token never falls back to the
// cookie session, so a bad key cannot pass because a browser session also exists.
function readCredential(headers: Headers): Credential {
  const apiKey = headers.get('x-api-key')
  if (apiKey) return { type: 'api-key', key: apiKey }

  const bearer = headers.get('authorization')?.match(/^Bearer (.+)$/i)?.[1]
  if (!bearer) return { type: 'session' }

  // CLI and script clients often send keys as bearer tokens; the prefix tells them apart.
  if (bearer.startsWith(API_KEY_PREFIX)) return { type: 'api-key', key: bearer }
  return { type: 'jwt', token: bearer }
}

// Keys and tokens outlive account deletion, so confirm that the user still exists.
async function loadUser(userId: string, type: AuthenticationType): Promise<Authentication | null> {
  const user = await db.query.user.findFirst({ where: { id: userId } })
  if (!user) return null

  return { userId: user.id, email: user.email, type }
}

/** Resolves the subject of a verified OAuth access token to a current user. */
export function authenticateOAuth(userId: string) {
  return loadUser(userId, 'oauth')
}

async function authenticateApiKey(headers: Headers, key: string): Promise<AuthResult | null> {
  const result = await auth.api.verifyApiKey({ headers, body: { key } })
  if (!result.valid || !result.key) return null

  const user = await loadUser(result.key.referenceId, 'api-key')
  if (!user) return null

  return { auth: user }
}

async function authenticateJwt(token: string): Promise<AuthResult | null> {
  const payload = await verifyNativeJwt(token)
  if (!payload) return null

  const user = await loadUser(payload.sub, 'jwt')
  if (!user) return null

  return { auth: user, refreshedToken: await refreshNativeJwt(payload) }
}

async function authenticateSession(headers: Headers): Promise<AuthResult | null> {
  // getSession reads the session store, which already confirms that the user exists.
  const session = await auth.api.getSession({ headers })
  if (!session) return null

  return { auth: { userId: session.user.id, email: session.user.email, type: 'session' } }
}

/** Resolves the request's one credential to a verified caller, or null. */
export function authenticate(headers: Headers): Promise<AuthResult | null> {
  const credential = readCredential(headers)

  if (credential.type === 'api-key') return authenticateApiKey(headers, credential.key)
  if (credential.type === 'jwt') return authenticateJwt(credential.token)
  return authenticateSession(headers)
}
