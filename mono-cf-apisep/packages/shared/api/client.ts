import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import { createTanstackQueryUtils } from '@orpc/tanstack-query'

import type { ApiClient } from '@dunbar/api/client/orpc.client'
export type { ApiClient, ApiInputs, ApiOutputs } from '@dunbar/api/client/orpc.client'

type ClientOptions = {
  origin?: string
  headers?: () => Headers | Promise<Headers>
}

export const createApiClient = (options: ClientOptions = {}): ApiClient => {
  const link = new RPCLink({
    url: '/api/rpc',
    origin: options.origin,
    headers: options.headers
  })

  return createORPCClient(link)
}

export const createApiQueryUtils = (client: ApiClient) => createTanstackQueryUtils(client)
