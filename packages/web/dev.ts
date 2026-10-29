import { spawn, which } from 'bun'
import { join } from 'node:path'

const cwd = import.meta.dir
const node = which('node')

if (!node) {
  throw new Error('Alchemy dev requires a supported Node.js version on PATH.')
}

const env = { ...process.env }

// The Alchemy beta.84 Bun path selects a Vite child loader absent from the published package.
// Clear Bun's launcher metadata so Alchemy keeps its published Node entry.
delete env.npm_execpath
delete env.npm_config_user_agent

const child = spawn(
  [
    node,
    join(cwd, 'node_modules/alchemy/bin/cli.js'),
    'dev',
    'alchemy.run.ts',
    '--stage',
    'local',
    ...process.argv.slice(2)
  ],
  {
    cwd,
    env,
    stdin: 'inherit',
    stdout: 'inherit',
    stderr: 'inherit'
  }
)

process.once('SIGINT', () => {
  child.kill('SIGINT')
})

process.once('SIGTERM', () => {
  child.kill('SIGTERM')
})

process.exitCode = await child.exited
