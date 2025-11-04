import { $ } from 'bun'

async function main() {
  // Ensure wrangler local database exists
  await $`bun run wrangler d1 execute DB --local --command 'SELECT 1'`

  // Ensure tmp/db.sqlite exists for logic in @/db/client.ts
  await Bun.write('./tmp/db.sqlite', '')

  // Run better-auth schema generation
  await $`BETTER_AUTH_CLI=1 bunx @better-auth/cli generate --config ./src/core/auth/server.ts --output ./src/db/auth-schema.ts -y`

  // Format
  await $`bun run prettier --write src --log-level silent`

  // Finally, actually generate the schema migration
  await $`bun run drizzle-kit generate --config src/db/config.ts`
}

await main()
