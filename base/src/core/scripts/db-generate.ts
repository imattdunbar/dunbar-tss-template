import { $ } from 'bun'

async function main() {
  // Generally used to do some local setup for the database.
  // Also to automate the generation of better-auth schema if applicable. See cloudflare template.

  await $`echo "Hello World"`
}

await main()
