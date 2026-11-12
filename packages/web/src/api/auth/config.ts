import { authOptions } from './server'

// Auth config for the Better Auth CLI (`bun run db:generate:auth`).
//
// The CLI needs only the auth options to generate the database schema.
// It does not need an auth instance.
//
// A call to `betterAuth()` starts plugins, which can access the database at startup.
// The CLI has no request context, so those database calls can fail.
//
// This file gives the CLI the same options without a call to `betterAuth()`.
// The plugin schemas remain available, but their startup hooks do not run.
//
// The app does not use this file. It uses `auth` from './server'.
export const auth = { options: authOptions }
