import { TanStackDevtools } from '@tanstack/react-devtools'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'

const Devtools = () => {
  if (!import.meta.env.DEV) return null

  return (
    <TanStackDevtools
      config={{ hideUntilHover: true }}
      plugins={[
        {
          name: 'TanStack Query',
          render: <ReactQueryDevtoolsPanel />
        },
        {
          name: 'TanStack Router',
          render: <TanStackRouterDevtoolsPanel />
        }
      ]}
    />
  )
}

export default Devtools
