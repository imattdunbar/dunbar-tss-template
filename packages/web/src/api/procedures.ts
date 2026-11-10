import { os } from '@orpc/server'
import type { ResponseHeadersHandlerPluginContext } from '@orpc/server/plugins'
import { authenticate, type Authentication, type AuthResult } from '@web/api/auth/authenticate'
import { apiErrors } from '@web/api/errors'

/**
 * Context for every procedure.
 * - headers: passed by the Hono handlers in api/index.ts and the server client in api/client.ts.
 * - resHeaders: added by ResponseHeadersHandlerPlugin in api/index.ts.
 */
export type ApiContext = ResponseHeadersHandlerPluginContext & {
  headers: Headers
  // Only server code sets this after credential verification; HTTP input cannot set it.
  auth?: Authentication
}

/** Context for authed procedure handlers: ApiContext plus the verified caller. */
export type AuthedContext = ApiContext & {
  auth: Authentication
}

const base = os.$context<ApiContext>().errors(apiErrors)

/** No authentication. */
const publicProcedure = base

/** Rejects with UNAUTHORIZED unless a session, JWT, or API key verifies. */
const authedProcedure = base.use(async opts => {
  const result: AuthResult | null = opts.context.auth
    ? { auth: opts.context.auth }
    : await authenticate(opts.context.headers)
  if (!result) throw opts.errors.UNAUTHORIZED()

  // Native clients replace their stored token when this header appears.
  if (result.refreshedToken) opts.context.resHeaders?.set('refreshed', result.refreshedToken)

  // The annotation states the contract: this is what authed procedures add to ApiContext.
  const added: Pick<AuthedContext, 'auth'> = { auth: result.auth }
  return opts.next({ context: added })
})

export default {
  public: publicProcedure,
  authed: authedProcedure
}
