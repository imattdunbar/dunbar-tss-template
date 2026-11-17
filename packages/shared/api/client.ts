/**
 * Each consumer creates its own client and query utilities:
 *
 * const apiClient = createApiClient({ origin: 'https://api.example.com' })
 * const orpc = createQueryUtils(apiClient)
 *
 * The web package uses the router directly for server renders (web/src/api/client.ts).
 */

import type { InferClientOutputs } from '@orpc/client'
// Type-only: a value import here can pull server code into browser clients.
import type { ApiClient } from '@web/api/router'

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

// A shared export keeps consumers independent of the query adapter package.
export const createQueryUtils = createTanstackQueryUtils

export type { ApiClient }
export type ApiOutputs = InferClientOutputs<ApiClient>
