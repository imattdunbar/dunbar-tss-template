import { betterAuth } from 'better-auth'
import { reactStartCookies } from 'better-auth/react-start'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'

import { db } from '@/db/client'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite'
  }),
  plugins: [reactStartCookies()]
})
