import { Button } from '@dunbar/ui-template/components/button'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { authClient } from '@web/api/auth/client'

export const Route = createFileRoute('/consent')({
  validateSearch: (search: Record<string, unknown>) => ({
    client_id: typeof search.client_id === 'string' ? search.client_id : '',
    scope: typeof search.scope === 'string' ? search.scope : '',
    redirect_uri: typeof search.redirect_uri === 'string' ? search.redirect_uri : ''
  }),
  component: ConsentPage
})

function ConsentPage() {
  const { client_id, scope, redirect_uri } = Route.useSearch()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const redirectUrl = URL.parse(redirect_uri)

  async function submit(accept: boolean) {
    if (busy) return
    setBusy(true)
    setError(null)

    try {
      const result = await authClient.oauth2.consent({ accept })
      if (result.error) setError(result.error.message ?? 'Authorization failed. Please try again.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The request failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto grid w-full max-w-2xl gap-6 px-6 py-12">
      <header className="grid gap-2">
        <h1 className="text-2xl font-semibold">Authorize an agent</h1>
        <p className="text-muted-foreground text-sm">Approve access to your account through MCP.</p>
      </header>
      <section className="grid gap-4 rounded-xl border p-5">
        <p className="text-sm">
          Client ID: <span className="font-mono break-all">{client_id}</span>
        </p>
        <p className="text-sm">
          Return host: <span className="font-mono">{redirectUrl?.host ?? 'Invalid URL'}</span>
        </p>
        <p className="text-muted-foreground text-sm">
          Client details come from the client, not from a trusted administrator.
        </p>
        <h2 className="font-semibold">Requested access</h2>
        <ul className="list-inside list-disc text-sm">
          {scope
            .split(' ')
            .filter(Boolean)
            .map(item => (
              <li key={item}>{item}</li>
            ))}
        </ul>
        {error && (
          <p role="alert" className="text-destructive text-sm">
            {error}
          </p>
        )}
        <div className="flex gap-2">
          <Button disabled={busy || !client_id || !redirectUrl} onClick={() => submit(true)}>
            Allow
          </Button>
          <Button disabled={busy} variant="outline" onClick={() => submit(false)}>
            Deny
          </Button>
        </div>
      </section>
    </main>
  )
}
