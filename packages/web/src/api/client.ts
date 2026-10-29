import { createApiClient, createApiQueryUtils, type ApiClient } from '@dunbar/shared-template/api/client'
import { createRouterClient } from '@orpc/server'
import { createIsomorphicFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { createApiErrorInterceptor } from '@web/api/errors'
import { apiRouter } from '@web/api/router'

const getApiClient = createIsomorphicFn()
  .server((): ApiClient =>
    createRouterClient(apiRouter, {
      // Resolve headers for each call, not once when the module loads.
      context: () => ({ headers: getRequestHeaders() }),
      interceptors: [createApiErrorInterceptor(import.meta.env.DEV)]
    })
  )
  .client(() => createApiClient())

export const apiClient = getApiClient()
export const orpc = createApiQueryUtils(apiClient)
