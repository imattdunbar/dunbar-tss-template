import { HeadContent, Scripts, createRootRouteWithContext } from '@tanstack/react-router'
import { RouterContext } from '@/router'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { defaultHead } from '@/utils/seo'

export const Route = createRootRouteWithContext<RouterContext>()({
  head: defaultHead,
  shellComponent: RootDocument
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        {import.meta.env.DEV && (
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
        )}
        <Scripts />
      </body>
    </html>
  )
}
