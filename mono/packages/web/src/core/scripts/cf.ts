import { $ } from 'bun'
import { z } from 'zod'

const args = process.argv.slice(2)

async function types() {
  console.log('Generating Cloudflare types...')
  await $`bun run wrangler types  --env-interface=CloudflareEnv`
}

async function main() {
  const schema = z.enum([
    'types', // Generate cloudflare types
    'deploy', // Apply migrations & deploy
    'sync-secrets' // Sync environment secrets to Cloudflare Secrets
  ])

  const cmd = schema.safeParse(args[0]).data

  if (!cmd) {
    console.log('\nInvalid db command\n')
    console.log(`Valid options:\n${schema.options.join('\n')}`)
    return
  }

  if (cmd === 'types') {
    await types()
  } else if (cmd === 'deploy') {
    // await deploy()
  } else if (cmd === 'sync-secrets') {
    // await syncSecrets()
  } else {
    console.log('Failed to match command', cmd)
  }
}

await main()
