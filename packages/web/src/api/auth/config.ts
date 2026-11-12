import { authOptions } from './server'

// Auth config for the Better Auth CLI (`bun run db:generate:auth`).
//
// The CLI needs only the auth options to generate the database schema.
// It does not need a working auth instance.
//
// A call to `betterAuth()` starts every plugin, and some plugins read the database at startup.
// For example, the MCP plugin saves its resource to the database.
// In this app, database access works only inside a request, so the CLI logs an error.
//
// This file gives the CLI the options without a call to `betterAuth()`.
// No plugin starts, so the CLI cannot read or write the database.
//
// The app does not use this file. It uses `auth` from `./server`.
export const auth = { options: authOptions }
