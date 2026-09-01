import * as Alchemy from 'alchemy'
import * as Cloudflare from 'alchemy/Cloudflare'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

const PROJECT_NAME = 'dunbar-template'

export const Database = Cloudflare.D1.Database(
  'Database',
  Alchemy.Stage.pipe(
    Effect.map((stage) => ({
      name: stage === 'prod' ? `${PROJECT_NAME}-db` : `${PROJECT_NAME}-db-${stage}`,
      migrationsDir: './src/db/migrations'
    }))
  )
)

export const Website = Cloudflare.Website.Vite(
  'Website',
  Alchemy.Stage.pipe(
    Effect.map((stage) => ({
      name: stage === 'prod' ? PROJECT_NAME : `${PROJECT_NAME}-${stage}`,
      main: './src/entry.ts',
      dev: {
        host: '0.0.0.0',
        port: 7777,
        strictPort: true
      },
      env: {
        DB: Database
      }
    }))
  )
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
