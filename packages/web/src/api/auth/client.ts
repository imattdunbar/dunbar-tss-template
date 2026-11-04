import { createAuthClient } from 'better-auth/react'
import { jwtClient } from 'better-auth/client/plugins'
import { apiKeyClient } from '@better-auth/api-key/client'

export const authClient = createAuthClient({
  plugins: [jwtClient(), apiKeyClient()]
})
