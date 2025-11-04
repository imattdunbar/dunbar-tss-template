import { getLocalDBUrl } from '@/db/config'
import { $ } from 'bun'

async function main() {
  const dbName = 'template-db' // get from wrangler.jsonc
  const url = getLocalDBUrl()

  await $`wrangler d1 export ${dbName} --remote --output=${url}`
}

await main()
