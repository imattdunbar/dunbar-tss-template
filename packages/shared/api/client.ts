// Import only the type and specifically from that file in the workspace that only has the type defined.
// We specifically setup the API clients in this file so that it can utilize this type, and then going forward
// any package in the repo can use the "shared" API client - key being all the core logic, handlers, etc. stays in the web
// package where all those dependencies live. While we just consume a clean, dependency free type.
import type { ApiClient } from './generated/api-client'

import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import { createTanstackQueryUtils } from '@orpc/tanstack-query'

type ClientOptions = {
  origin?: string
  fetch?: typeof globalThis.fetch
  headers?: () => HeadersInit | Promise<HeadersInit>
}

export function createApiClient(options: ClientOptions = {}): ApiClient {
  return createORPCClient(
    new RPCLink({
      url: '/api/rpc',
      origin: options.origin,
      fetch: options.fetch,
      headers: async () => new Headers(await options.headers?.())
    })
  )
}

export const createApiQueryUtils = (client: ApiClient) => createTanstackQueryUtils(client)

// Export the type for all packages to use
export type { ApiClient } from './generated/api-client'
