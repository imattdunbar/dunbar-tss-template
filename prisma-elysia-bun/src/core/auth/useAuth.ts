import { QueryClient, queryOptions, useQuery } from '@tanstack/react-query'
import { auth } from '@/core/auth/server'
import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { redirect, useRouteContext, useRouter } from '@tanstack/react-router'
import { authClient } from '@/core/auth/client'

export const getUserSession = createServerFn({ method: 'POST' }).handler(async () => {
  return await auth.api.getSession({
    headers: getRequest().headers
  })
})

export const requireUserBeforeLoad = async (queryClient: QueryClient) => {
  const response = await queryClient.ensureQueryData(AuthQueryOptions())
  if (!response) {
    console.log('invalid user, redirecting')
    throw redirect({ to: '/' })
  }
  return response
}

const queryKey = ['user']

export const AuthQueryOptions = () => {
  return queryOptions({
    queryKey,
    queryFn: async () => {
      return await getUserSession()
    },
    placeholderData: null,
    initialData: null
  })
}

export const useAuth = () => {
  const context = useRouteContext({ from: '__root__' })
  const router = useRouter()

  const query = useQuery(AuthQueryOptions())
  const { data, ...rest } = query

  return {
    user: data?.user,
    session: data?.session,
    signOut: async () => {
      await authClient.signOut({
        fetchOptions: {
          onResponse: async () => {
            await authClient.signOut({
              fetchOptions: {
                onResponse: async () => {
                  // Set user to null for immediate feedback
                  context.queryClient.setQueryData(queryKey, null)
                  // Invalidate the router for auth to run in beforeLoad again
                  await router.invalidate()
                }
              }
            })
          }
        }
      })
    },
    ...rest
  }
}
