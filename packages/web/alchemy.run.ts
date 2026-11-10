import * as Alchemy from 'alchemy'
import * as Cloudflare from '@alchemy.run/cloudflare'
import * as Config from 'effect/Config'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

const PROJECT_NAME = 'dunbar-template'

export const Database = Cloudflare.D1.Database(
  'Database',
  Alchemy.Stage.pipe(
    Effect.map((stage) => ({
      name: stage === 'prod' ? `${PROJECT_NAME}-db` : `${PROJECT_NAME}-db-${stage}`,
      migrations: './src/db/migrations'
    }))
  )
)

// Generated once per stage and kept in state, so sessions survive restarts and deploys.
const betterAuthSecret = Alchemy.makeRandom('BetterAuthSecret')

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
        DB: Database,
        BETTER_AUTH_SECRET: betterAuthSecret,
        // Deployed stages have no fixed domain in this template; supply it at deploy time.
        BETTER_AUTH_URL: stage === 'local' ? 'http://localhost:7777' : Config.NonEmptyString('BETTER_AUTH_URL')
      }
    }))
  )
)

export type WebsiteEnv = Cloudflare.InferEnv<typeof Website>

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
    providers: Cloudflare.providers(),
    state
  },
  Effect.gen(function* () {
    const database = yield* Database
    const website = yield* Website

    return {
      databaseName: database.databaseName,
      url: website.url
    }
  })
)
