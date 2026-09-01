/// <reference types="@cloudflare/workers-types" />

import type { WebsiteEnv } from '../../alchemy.run'

export const env = await import('cloudflare:workers')
  .then(({ env }) => env as WebsiteEnv)
  .catch(() => process.env as unknown as WebsiteEnv)
