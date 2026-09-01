import * as Alchemy from 'alchemy'
import * as Cloudflare from 'alchemy/Cloudflare'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

const PROJECT_NAME = 'dunbar-template'

const stageConfig = Alchemy.Stack.use((stack) =>
  Effect.succeed({
    name: stack.stage === 'prod' ? PROJECT_NAME : `${PROJECT_NAME}-${stack.stage}`,
    authUrl: stack.stage === 'local' ? 'http://localhost:7777' : undefined
  })
)

const betterAuthSecret = Alchemy.makeRandom('BetterAuthSecret')

export const Database = Cloudflare.D1.Database(
  'Database',
  Alchemy.Stage.pipe(
    Effect.map((stage) => ({
      name: stage === 'prod' ? `${PROJECT_NAME}-db` : `${PROJECT_NAME}-db-${stage}`,
      migrationsDir: './src/server/db/migrations'
    }))
  )
)

export const Website = Cloudflare.Website.Vite(
  'Website',
  Effect.map(stageConfig, ({ name, authUrl }) => ({
    name,
    rootDir: '../web',
    main: './src/entry.ts',
    dev: {
      host: '0.0.0.0',
      port: 7777,
      strictPort: true
    },
    compatibility: {
      date: '2026-07-11',
      flags: ['nodejs_compat']
    },
    env: {
      DB: Database,
      BETTER_AUTH_SECRET: betterAuthSecret,
      BETTER_AUTH_URL: authUrl ?? Cloudflare.Worker.URL
    }
  }))
)

export type WebsiteEnv = Cloudflare.InferEnv<typeof Website>

const state = Layer.unwrap(
  Effect.gen(function* () {
    const stage = yield* Alchemy.Stage

    // Use localState for local dev environment, otherwise key state will be stored remotely even for local environments
    if (stage === 'local') return Alchemy.localState()

    return Cloudflare.state()
  })
)

export default Alchemy.Stack(
  PROJECT_NAME,
  {
    providers: Cloudflare.providers(),
    state
  },
  Effect.gen(function* () {
    const database = yield* Database
    const website = yield* Website

    return {
      databaseName: database.databaseName,
      url: website.url.as<string>()
    }
  })
)
