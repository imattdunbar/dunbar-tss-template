import { os as baseOS } from '@orpc/server'
import { auth } from './auth'
import { apiErrors } from './errors'

export type ApiContext = {
  headers: Headers
  responseHeaders?: Headers
}

export type AuthenticatedContext = {
  session: typeof auth.$Infer.Session.session
  user: typeof auth.$Infer.Session.user
}

export const os = baseOS.$context<ApiContext>().errors(apiErrors)

export const authenticationMiddleware = os.middleware<AuthenticatedContext, unknown>(async ({ context, next, errors }) => {
  const session = await auth.api.getSession({ headers: context.headers })

  if (!session) {
    throw errors.UNAUTHORIZED()
  }

  return next({
    context: {
      session: session.session,
      user: session.user
    }
  })
})
