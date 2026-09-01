import { createApiClient, createApiQueryUtils } from '@dunbar/shared/api/client'
import { apiRouter } from '@dunbar/api/server/router'
import { createRouterClient } from '@orpc/server'
import { createIsomorphicFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { orpcErrorInterceptor } from '@dunbar/api/server/errors'

const getApiClient = createIsomorphicFn()
  .server(() => {
    return createRouterClient(apiRouter, {
      context: async () => ({
        headers: getRequestHeaders()
      }),
      interceptors: [orpcErrorInterceptor]
    })
  })
  .client(() => createApiClient())

export const orpc = createApiQueryUtils(getApiClient())
