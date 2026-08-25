import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { Button } from '@dunbar/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@dunbar/ui/components/card'
import { Input } from '@dunbar/ui/components/input'
import { useState, type SubmitEvent } from 'react'
import { ServerErrorTest } from '@/core/components/ServerErrorTest'
import { orpc } from '@/core/orpc'

export const Route = createFileRoute('/')({
  loader: ({ context }) => {
    // Route lifecycle code accesses this environment's QueryClient through router context.
    const { queryClient } = context

    // query() with static stale time replaces the deprecated ensureQueryData() behavior.
    const itemOptions = orpc.items.list.queryOptions({ staleTime: 'static' })

    return queryClient.query(itemOptions)
  },
  component: App
})

function App() {
  // Components access the same environment-specific QueryClient through its provider.
  const queryClient = useQueryClient()

  const items = useSuspenseQuery(orpc.items.list.queryOptions())

  const [name, setName] = useState('')

  const createItem = useMutation(
    orpc.items.create.mutationOptions({
      onSuccess: async () => {
        setName('')
        await queryClient.invalidateQueries({ queryKey: orpc.items.list.key() })
      }
    })
  )

  const submit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = name.trim()
    if (!value) return

    createItem.mutate({ name: value })
  }

  return (
    <main className="bg-background text-foreground min-h-dvh px-5 py-16">
      <div className="mx-auto grid w-full max-w-2xl gap-8">
        <header className="grid gap-3">
          <p className="text-primary text-sm font-medium">Dunbar Cloudflare Template</p>
          <h1 className="text-4xl font-semibold tracking-tight">TanStack Start, D1, and oRPC.</h1>
          <p className="text-muted-foreground max-w-xl leading-7">
            This small item list proves the full path from React through oRPC and Hono to a Cloudflare D1 database.
          </p>
          <nav className="flex gap-4 text-sm">
            <a className="text-primary hover:underline" href="/api/docs">
              API docs
            </a>
            <a className="text-primary hover:underline" href="/api/openapi.json">
              OpenAPI specification
            </a>
          </nav>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Create an item</CardTitle>
            <CardDescription>Items are stored in the local D1 database during development.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex gap-2" onSubmit={submit}>
              <Input
                aria-label="Item name"
                maxLength={100}
                onChange={(event) => setName(event.target.value)}
                placeholder="Item name"
                value={name}
              />
              <Button disabled={createItem.isPending || !name.trim()} type="submit">
                {createItem.isPending ? 'Creating...' : 'Create'}
              </Button>
            </form>
            {createItem.error ? <p className="text-destructive mt-3 text-sm">{createItem.error.message}</p> : null}
          </CardContent>
        </Card>

        <ServerErrorTest />

        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
            <CardDescription>{items.data.length} stored items</CardDescription>
          </CardHeader>
          <CardContent>
            {items.data.length ? (
              <ul className="divide-border divide-y">
                {items.data.map((item) => (
                  <li className="flex items-center justify-between py-3" key={item.id}>
                    <span>{item.name}</span>
                    <span className="text-muted-foreground font-mono text-xs">{item.id.slice(0, 8)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">Create the first item.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
