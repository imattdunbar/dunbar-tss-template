import * as Alchemy from 'alchemy'
import * as Cloudflare from '@alchemy.run/cloudflare'
import * as Planetscale from '@alchemy.run/planetscale'
import * as Command from 'alchemy/Command'
import * as Output from 'alchemy/Output'
import * as Config from 'effect/Config'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Redacted from 'effect/Redacted'

// Template settings. Keep LOCAL_DB aligned with docker-compose.yml.
const PROJECT_NAME = 'dunbar-template'
const DEV_PORT = 7777
const DEV_DB_NAME = 'dunbar_dev'
const PROD_DB_NAME = 'dunbar_prod'
const PLANETSCALE_BRANCH = 'main'
const LOCAL_DB = {
  host: '127.0.0.1',
  port: 5432,
  database: 'dunbar_local',
  user: 'dunbar',
  password: 'dunbar'
}

// URL setters encode credentials; string interpolation does not.
const postgresUrl = (db: typeof LOCAL_DB, sslmode: 'disable' | 'verify-full') => {
  const url = new URL(`postgresql://${db.host}:${db.port}/${db.database}`)
  url.username = db.user
  url.password = db.password
  url.searchParams.set('sslmode', sslmode)
  return Redacted.make(url.toString())
}

const localConnection = Effect.gen(function* () {
  const docker = yield* Command.Exec('LocalDatabase', {
    command: 'docker compose up -d --wait db',
    cwd: '../..',
    memo: false
  })

  const origin: Cloudflare.Hyperdrive.PublicOrigin = {
    ...LOCAL_DB,
    scheme: 'postgres',
    password: Redacted.make(LOCAL_DB.password)
  }

  return {
    origin: Output.asOutput(origin),
    dev: Output.asOutput({ ...origin, sslmode: 'disable' as const }),
    // The output dependency makes migrations wait for Docker readiness.
    migrationUrl: Output.map(docker.hash, () => postgresUrl(LOCAL_DB, 'disable'))
  }
})

const remoteConnection = (stage: 'dev' | 'prod') =>
  Effect.gen(function* () {
    const cluster = yield* Config.NonEmptyString('PLANETSCALE_CLUSTER').pipe(Effect.orDie)
    const database = stage === 'prod' ? PROD_DB_NAME : DEV_DB_NAME

    const applicationRole = yield* Planetscale.PostgresRole('ApplicationRole', {
      database: cluster,
      branch: PLANETSCALE_BRANCH,
      inheritedRoles: ['pg_read_all_data', 'pg_write_all_data']
    })

    const migrationRole = yield* Planetscale.PostgresRole('MigrationRole', {
      database: cluster,
      branch: PLANETSCALE_BRANCH,
      inheritedRoles: ['postgres']
    })

    return {
      origin: Output.map(applicationRole.origin, origin => ({ ...origin, database })),
      dev: Output.map(applicationRole.pooledOrigin, origin => ({
        ...origin,
        database,
        sslmode: 'verify-full' as const
      })),
      migrationUrl: Output.map(migrationRole.origin, origin =>
        postgresUrl(
          { ...origin, database, password: Redacted.value(origin.password) },
          'verify-full'
        )
      )
    }
  })

export const Database = Cloudflare.Hyperdrive.Connection(
  'Database',
  Effect.gen(function* () {
    const stage = yield* Alchemy.Stage

    if (stage !== 'local' && stage !== 'dev' && stage !== 'prod') {
      return yield* Effect.die(new Error(`Unsupported database stage: ${stage}`))
    }

    const connection = stage === 'local' ? yield* localConnection : yield* remoteConnection(stage)

    const migrations = yield* Command.Exec('DatabaseMigrations', {
      command: 'bun run db:migrate',
      env: { DATABASE_URL: connection.migrationUrl },
      // A local data reset must restore the schema even if Alchemy state remains.
      memo: false
    })

    return {
      // The Website must not start or deploy before migrations complete.
      origin: Output.map(Output.all(connection.origin, migrations.hash), ([origin]) => origin),
      dev: connection.dev,
      caching: { disabled: true },
      originConnectionLimit: 5
    }
  })
)

// Generated once per stage and kept in state, so sessions survive restarts and deploys.
const betterAuthSecret = Alchemy.makeRandom('BetterAuthSecret')

export const Website = Cloudflare.Website.Vite(
  'Website',
  Effect.gen(function* () {
    const stage = yield* Alchemy.Stage
    const name = stage === 'prod' ? PROJECT_NAME : `${PROJECT_NAME}-${stage}`
    const betterAuthUrl = yield* Effect.gen(function* () {
      if (stage === 'local') return `http://localhost:${DEV_PORT}`
      if (stage === 'dev') return Cloudflare.Worker.URL

      return yield* Config.NonEmptyString('BETTER_AUTH_URL').pipe(Effect.orDie)
    })

    return {
      name,
      // Custom Worker entry: routes endpoints through Hono and exports Cloudflare binding classes.
      main: './src/entry.ts',
      compatibility: { flags: ['nodejs_compat'] },
      dev: {
        host: '0.0.0.0',
        port: DEV_PORT,
        strictPort: true
      },
      env: {
        HYPERDRIVE: Database,
        BETTER_AUTH_SECRET: betterAuthSecret,
        BETTER_AUTH_URL: betterAuthUrl
      }
    }
  })
)

export type WebsiteEnv = Cloudflare.InferEnv<typeof Website>

const providers = Layer.mergeAll(Cloudflare.providers(), Planetscale.providers())

const state = Layer.unwrap(
  Effect.gen(function* () {
    const stage = yield* Alchemy.Stage

    // Local development must not bootstrap the remote state backend.
    if (stage === 'local') return Alchemy.localState()

    return Cloudflare.state()
  })
)

export default Alchemy.Stack(
  PROJECT_NAME,
  { providers, state },
  Effect.gen(function* () {
    const stage = yield* Alchemy.Stage
    const website = yield* Website

    return {
      stage,
      url: website.url
    }
  })
)
