import Bun from 'bun'

const cwd = import.meta.dir

const types = Bun.spawn([process.execPath, '--no-orphans', 'run', '--silent', 'dev:types'], {
  cwd,
  stdin: 'ignore',
  stdout: 'ignore',
  stderr: 'ignore'
  // stdout: 'inherit',
  // stderr: 'inherit'
})

const web = Bun.spawn([process.execPath, '--no-orphans', 'run', '--silent', 'dev:web'], {
  cwd,
  stdin: 'inherit',
  stdout: 'inherit',
  stderr: 'inherit'
})

function stop() {
  types.kill()
  web.kill()
}

process.once('SIGINT', stop)
process.once('SIGTERM', stop)

const exitCode = await Promise.race([types.exited, web.exited])

stop()
await Promise.all([types.exited, web.exited])
process.exitCode = exitCode
