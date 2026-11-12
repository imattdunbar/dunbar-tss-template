import type { InferClientOutputs } from '@orpc/client'
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

export const createApiQueryUtils = (client: ApiClient) => createTanstackQueryUtils(client)

export type { ApiClient }
export type ApiOutputs = InferClientOutputs<ApiClient>
