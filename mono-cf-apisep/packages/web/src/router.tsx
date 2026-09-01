import { createRouter, Navigate } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { QueryClient } from '@tanstack/react-query'

import { routeTree } from '@/routeTree.gen'

export type RouterContext = {
  queryClient: QueryClient
}

export const getRouter = () => {
  const queryClient = new QueryClient()
  const router = createRouter({
    routeTree,
    context: { queryClient },
    defaultPreload: 'intent',
    scrollRestoration: true,
    notFoundMode: 'root',
    defaultNotFoundComponent: () => Navigate({ to: '/' }),
    defaultErrorComponent: () => Navigate({ to: '/' })
  })

  setupRouterSsrQueryIntegration({ router, queryClient })

  return router
}
