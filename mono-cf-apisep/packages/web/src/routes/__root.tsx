import { HeadContent, Scripts, createRootRouteWithContext } from '@tanstack/react-router'
import type { RouterContext } from '@/router'
import { defaultHead } from '@/core/utils/seo'
import Devtools from '@/core/components/Devtools'

export const Route = createRootRouteWithContext<RouterContext>()({
  head: defaultHead,
  shellComponent: RootDocument
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
        <Devtools />
      </body>
    </html>
  )
}
