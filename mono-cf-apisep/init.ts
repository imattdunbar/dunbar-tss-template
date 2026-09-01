import { rm } from 'node:fs/promises'
import { basename, join } from 'node:path'

type PackageJson = {
  name?: string
  scripts?: Record<string, string>
}

const root = import.meta.dir
const initPath = join(root, 'init.ts')
const packagePath = join(root, 'package.json')
const projectName = basename(root)

const fail = (message: string): never => {
  console.error(message)
  process.exit(1)
}

if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(projectName)) {
  fail('The project directory must use lowercase letters, numbers, and single hyphens.')
}

if (projectName.length > 54) {
  fail('The project directory name must contain 54 characters or fewer.')
}

const packageJson = (await Bun.file(packagePath).json()) as PackageJson

if (packageJson.name !== 'dunbar-mono-cf-template' && packageJson.name !== projectName) {
  fail(`Unexpected root package name: ${packageJson.name}`)
}

packageJson.name = projectName

await Bun.write(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`)

const patterns = [
  'packages/*/package.json',
  'packages/api/**/*.ts',
  'packages/ui/tsconfig.json',
  'packages/ui/components.json',
  'packages/ui/src/**/*.{ts,tsx}',
  'packages/web/src/**/*.{ts,tsx}',
  'packages/shared/api/**/*.ts'
]

const replacements: Array<[string, string]> = [
  ['@dunbar/', `@${projectName}/`],
  ["const PROJECT_NAME = 'dunbar-template'", `const PROJECT_NAME = '${projectName}'`],
  ['Dunbar Cloudflare Template', projectName],
  ['Dunbar Template API', `${projectName} API`],
  ['Dunbar Template', projectName]
]

const files = new Set<string>()

for (const pattern of patterns) {
  const glob = new Bun.Glob(pattern)

  for await (const file of glob.scan({ cwd: root, onlyFiles: true })) {
    files.add(file)
  }
}

const changedFiles: string[] = []

for (const file of files) {
  const path = join(root, file)
  const current = await Bun.file(path).text()

  let updated = current

  for (const [from, to] of replacements) {
    updated = updated.replaceAll(from, to)
  }

  if (updated === current) {
    continue
  }

  await Bun.write(path, updated)
  changedFiles.push(file)
}

console.log(`Project: ${projectName}`)
console.log(`Package scope: @${projectName}`)
console.log(`Production Worker: ${projectName}`)
console.log(`Development Worker: ${projectName}-dev`)
console.log(`Production database: ${projectName}-db`)
console.log(`Development database: ${projectName}-db-dev`)
console.log(`Updated ${changedFiles.length} files.`)
console.log('Updating bun.lock...')

const install = Bun.spawn([process.execPath, 'install'], {
  cwd: root,
  stdin: 'inherit',
  stdout: 'inherit',
  stderr: 'inherit'
})

const exitCode = await install.exited

if (exitCode !== 0) {
  fail('Project names changed, but bun install failed. Run bun init-project again.')
}

const finalPackageJson = (await Bun.file(packagePath).json()) as PackageJson

if (finalPackageJson.scripts) {
  delete finalPackageJson.scripts['init-project']
}

await Bun.write(packagePath, `${JSON.stringify(finalPackageJson, null, 2)}\n`)
await rm(initPath)

console.log('Project initialization complete.')
