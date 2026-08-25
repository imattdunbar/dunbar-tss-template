import { createApiClient, createApiQueryUtils, type ApiClient } from '@dunbar/shared/api/client'
import { createRouterClient } from '@orpc/server'
import { createIsomorphicFn } from '@tanstack/react-start'
import { apiRouter } from '@/api/router'

const getApiClient = createIsomorphicFn()
  .server((): ApiClient => createRouterClient(apiRouter))
  .client(() => createApiClient())

export const orpc = createApiQueryUtils(getApiClient())
