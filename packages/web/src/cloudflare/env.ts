/// <reference types="@cloudflare/workers-types" />
import type { WebsiteEnv } from '../../alchemy.run'

// Use Alchemy's inferred bindings as Cloudflare's native Env type.
// This declaration affects types only; it creates no runtime object.
declare global {
  namespace Cloudflare {
    interface Env extends WebsiteEnv {}
  }
}

// Keep Cloudflare's live export instead of a snapshot or a custom proxy.
export { env } from 'cloudflare:workers'
