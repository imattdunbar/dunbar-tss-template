import { createAuthClient } from 'better-auth/react'
import { jwtClient } from 'better-auth/client/plugins'
import { apiKeyClient } from '@better-auth/api-key/client'
import { oauthProviderClient } from '@better-auth/oauth-provider/client'

export const authClient = createAuthClient({
  plugins: [jwtClient(), apiKeyClient(), oauthProviderClient()]
})
