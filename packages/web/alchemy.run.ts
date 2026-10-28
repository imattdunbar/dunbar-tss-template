import * as Alchemy from 'alchemy'
import * as Command from 'alchemy/Command'
import * as Effect from 'effect/Effect'

export default Alchemy.Stack(
  'Dunbar',
  {
    providers: Command.providers(),
    state: Alchemy.localState()
  },
  Effect.gen(function* () {
    const web = yield* Command.Dev('Web', {
      command: 'bun run dev:vite'
    })

    return { url: web.url }
  })
)
