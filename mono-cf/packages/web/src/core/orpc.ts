import { createApiClient, createApiQueryUtils } from '@dunbar/shared/api/client'
import { createRouterClient } from '@orpc/server'
import { createIsomorphicFn } from '@tanstack/react-start'
import { orpcErrorInterceptor } from '@/api/errors'
import { apiRouter } from '@/api/router'

const getApiClient = createIsomorphicFn()
  .server(() => {
    return createRouterClient(apiRouter, {
      interceptors: [orpcErrorInterceptor]
    })
  })
  .client(() => createApiClient())

export const orpc = createApiQueryUtils(getApiClient())
