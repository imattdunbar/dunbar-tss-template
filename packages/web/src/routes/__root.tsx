import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import type { RouterContext } from '@/router'
import stylesheet from '@dunbar/ui-template/globals.css?url'

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Dunbar Template' }
    ],
    links: [{ rel: 'stylesheet', href: stylesheet }]
  }),
  component: Outlet,
  shellComponent: RootDocument
})

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="isolate min-h-svh">{children}</div>
        <Scripts />
      </body>
    </html>
  )
}
