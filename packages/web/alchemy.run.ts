import * as Alchemy from 'alchemy'
import * as Cloudflare from '@alchemy.run/cloudflare'
import * as Planetscale from '@alchemy.run/planetscale'
import * as Command from 'alchemy/Command'
import * as Output from 'alchemy/Output'
import * as Config from 'effect/Config'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Redacted from 'effect/Redacted'

const PROJECT_NAME = 'dunbar-template'

export const Database = Cloudflare.Hyperdrive.Connection(
  'Database',
  Effect.gen(function* () {
    const stage = yield* Alchemy.Stage

    if (stage !== 'local' && stage !== 'dev' && stage !== 'prod') {
      return yield* Effect.die(new Error(`Unsupported database stage: ${stage}`))
    }

    const connection = yield* Effect.gen(function* () {
      if (stage === 'local') {
        const docker = yield* Command.Exec('LocalDatabase', {
          command: 'docker compose up -d --wait db',
          cwd: '../..',
          memo: false
        })

        const origin: Cloudflare.Hyperdrive.PublicOrigin = {
          scheme: 'postgres',
          host: '127.0.0.1',
          port: 5432,
          database: 'dunbar_local',
          user: 'dunbar',
          password: Redacted.make('dunbar')
        }

        return {
          origin: Output.asOutput(origin),
          dev: Output.asOutput({ ...origin, sslmode: 'disable' as const }),
          // The output dependency makes migrations wait for Docker readiness.
          migrationUrl: Output.map(docker.hash, () =>
            Redacted.make('postgresql://dunbar:dunbar@127.0.0.1:5432/dunbar_local?sslmode=disable')
          )
        }
      }

      const cluster = yield* Config.NonEmptyString('PLANETSCALE_CLUSTER').pipe(Effect.orDie)
      const database = stage === 'prod' ? 'dunbar_prod' : 'dunbar_dev'

      const applicationRole = yield* Planetscale.PostgresRole('ApplicationRole', {
        database: cluster,
        branch: 'main',
        inheritedRoles: ['pg_read_all_data', 'pg_write_all_data']
      })

      const migrationRole = yield* Planetscale.PostgresRole('MigrationRole', {
        database: cluster,
        branch: 'main',
        inheritedRoles: ['postgres']
      })

      return {
        origin: Output.map(applicationRole.origin, origin => ({ ...origin, database })),
        dev: Output.map(applicationRole.pooledOrigin, origin => ({
          ...origin,
          database,
          sslmode: 'verify-full' as const
        })),
        migrationUrl: Output.map(migrationRole.origin, origin => {
          const url = new URL(`postgresql://${origin.host}:${origin.port}/${database}`)
          url.username = origin.user
          url.password = Redacted.value(origin.password)
          url.searchParams.set('sslmode', 'verify-full')
          return Redacted.make(url.toString())
        })
      }
    })

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
      if (stage === 'local') return 'http://localhost:7777'
      if (stage === 'dev') return Cloudflare.Worker.URL

      return yield* Config.NonEmptyString('BETTER_AUTH_URL').pipe(Effect.orDie)
    })

    return {
      name,
      main: './src/entry.ts',
      compatibility: { flags: ['nodejs_compat'] },
      dev: {
        host: '0.0.0.0',
        port: 7777,
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

const providers = Layer.unwrap(
  Effect.gen(function* () {
    const stage = yield* Alchemy.Stage

    if (stage === 'local') return Cloudflare.providers()

    return Layer.mergeAll(Cloudflare.providers(), Planetscale.providers())
  })
)

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
  {
    providers,
    state
  },
  Effect.gen(function* () {
    const stage = yield* Alchemy.Stage
    const website = yield* Website

    return {
      stage,
      url: website.url
    }
  })
)
