import { z } from 'zod'
import { auth } from '@web/api/auth/server'

// Renew a token when less than this time remains before it expires.
const REFRESH_BEFORE_MS = 7 * 24 * 60 * 60 * 1000

const jwtPayloadSchema = z.object({
  sub: z.string(),
  email: z.string(),
  name: z.string(),
  exp: z.number()
})

export type JwtPayload = z.infer<typeof jwtPayloadSchema>

// verifyJWT checks the signature, expiry, issuer, and audience.
export async function verifyNativeJwt(token: string) {
  const result = await auth.api.verifyJWT({ body: { token } })
  const parsed = jwtPayloadSchema.safeParse(result.payload)

  return parsed.success ? parsed.data : null
}

export async function refreshNativeJwt(payload: JwtPayload) {
  if (payload.exp * 1000 - Date.now() > REFRESH_BEFORE_MS) return

  const result = await auth.api.signJWT({
    body: { payload: { sub: payload.sub, email: payload.email, name: payload.name } }
  })

  return result.token
}
