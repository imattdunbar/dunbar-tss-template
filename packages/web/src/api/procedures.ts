import { os } from '@orpc/server'
import type { ResponseHeadersHandlerPluginContext } from '@orpc/server/plugins'
import { apiErrors } from '@web/api/errors'

/**
 * Context for every procedure.
 * - headers: passed by the Hono handlers in api/index.ts and the server client in api/client.ts.
 * - resHeaders: added by ResponseHeadersHandlerPlugin in api/index.ts.
 */
export type ApiContext = ResponseHeadersHandlerPluginContext & {
  headers: Headers
}

const base = os.$context<ApiContext>().errors(apiErrors)

/** No authentication. */
const publicProcedure = base

export default {
  public: publicProcedure
}
