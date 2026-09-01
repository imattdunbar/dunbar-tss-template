import { openapi } from '@orpc/openapi'
import { z } from 'zod'
import { authenticationMiddleware, os } from './middleware'

const route = os.use(authenticationMiddleware)

export default route
  .meta(
    openapi({
      method: 'GET',
      path: '/identity',
      operationId: 'getIdentity',
      summary: 'Get the current identity',
      tags: ['Identity']
    })
  )
  .output(
    z.object({
      id: z.string(),
      name: z.string(),
      email: z.email(),
      image: z.string().nullable().optional()
    })
  )
  .handler(async ({ context }) => context.user)
