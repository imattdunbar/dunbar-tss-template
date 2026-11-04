import { Button, buttonVariants } from '@dunbar/ui-template/components/button'
import { Input } from '@dunbar/ui-template/components/input'
import { Label } from '@dunbar/ui-template/components/label'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import { authClient } from '@web/api/auth/client'

export const Route = createFileRoute('/test-auth')({
  component: TestAuthPage
})

function TestAuthPage() {
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [credentials, setCredentials] = useState<{ jwt?: string; apiKey?: string }>({})
  const { data: session, isPending, error: sessionError } = authClient.useSession()
  const isSignUp = mode === 'sign-up'
  const submitLabel = isSignUp ? 'Sign up' : 'Sign in'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return

    const form = event.currentTarget
    const fields = new FormData(form)
    const email = String(fields.get('email') ?? '').trim()
    const password = String(fields.get('password') ?? '')
    setBusy(true)
    setError(null)

    try {
      const result = isSignUp
        ? await authClient.signUp.email({
            name: String(fields.get('name') ?? '').trim(),
            email,
            password
          })
        : await authClient.signIn.email({ email, password })

      if (result.error) {
        setError(result.error.message ?? 'Authentication failed. Please try again.')
        return
      }

      form.reset()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The request failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  // Credentials for native and script clients. Each one exists only in this page's state.
  async function handleCreateCredential(type: 'jwt' | 'api-key') {
    if (busy) return
    setBusy(true)
    setError(null)

    try {
      if (type === 'jwt') {
        const result = await authClient.token()
        if (result.error) setError(result.error.message ?? 'Token creation failed. Please try again.')
        else setCredentials((current) => ({ ...current, jwt: result.data.token }))
        return
      }

      const result = await authClient.apiKey.create({ name: 'Test auth page' })
      if (result.error) setError(result.error.message ?? 'API key creation failed. Please try again.')
      // The server stores only a hash, so this is the one time the full key is available.
      else setCredentials((current) => ({ ...current, apiKey: result.data.key }))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The request failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  async function handleSignOut() {
    if (busy) return
    setBusy(true)
    setError(null)

    try {
      const result = await authClient.signOut()
      if (result.error) setError(result.error.message ?? 'Sign-out failed. Please try again.')
      else setCredentials({})
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The request failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto grid w-full max-w-2xl gap-8 px-6 py-12">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="grid gap-2">
          <h1 className="text-2xl font-semibold">Test auth</h1>
          <p className="text-muted-foreground text-sm">Email and password authentication backed by PostgreSQL.</p>
        </div>
        <Link to="/" className={buttonVariants({ variant: 'outline' })}>
          Home
        </Link>
      </header>

      {!isPending && !session && (
        <form method="post" onSubmit={handleSubmit} className="grid gap-4 rounded-xl border p-5">
          <h2 className="text-lg font-semibold">{isSignUp ? 'Create an account' : 'Sign in'}</h2>
          <fieldset disabled={busy} className="grid gap-4">
            {isSignUp && (
              <div className="grid gap-2">
                <Label htmlFor="auth-name">Name</Label>
                <Input id="auth-name" name="name" autoComplete="name" maxLength={200} required />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="auth-email">Email</Label>
              <Input id="auth-email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="auth-password">Password</Label>
              <Input
                id="auth-password"
                name="password"
                type="password"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                minLength={isSignUp ? 8 : undefined}
                maxLength={128}
                required
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="submit">{busy ? 'Please wait…' : submitLabel}</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setMode(isSignUp ? 'sign-in' : 'sign-up')
                  setError(null)
                }}
              >
                {isSignUp ? 'Use an account' : 'Create an account'}
              </Button>
            </div>
          </fieldset>
        </form>
      )}

      {(error || sessionError) && (
        <p role="alert" className="text-destructive text-sm">
          {error ?? sessionError?.message}
        </p>
      )}

      <section className="grid gap-4 rounded-xl border p-5" aria-labelledby="auth-user-title" aria-live="polite">
        <h2 id="auth-user-title" className="text-lg font-semibold">
          Current user
        </h2>
        {isPending && <p className="text-muted-foreground text-sm">Please wait…</p>}
        {!isPending && session && (
          <>
            <pre className="bg-muted overflow-x-auto rounded-lg p-4 text-sm break-words whitespace-pre-wrap">
              {JSON.stringify(
                {
                  id: session.user.id,
                  name: session.user.name,
                  email: session.user.email,
                  emailVerified: session.user.emailVerified,
                  createdAt: session.user.createdAt,
                  updatedAt: session.user.updatedAt
                },
                null,
                2
              )}
            </pre>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" disabled={busy} onClick={() => handleCreateCredential('jwt')}>
                Create JWT
              </Button>
              <Button type="button" variant="outline" disabled={busy} onClick={() => handleCreateCredential('api-key')}>
                Create API key
              </Button>
              <Button type="button" variant="outline" disabled={busy} onClick={handleSignOut}>
                {busy ? 'Please wait…' : 'Sign out'}
              </Button>
            </div>
            {(credentials.jwt || credentials.apiKey) && (
              <div className="grid gap-2">
                <p className="text-muted-foreground text-sm">
                  Send a JWT or API key as <code>Authorization: Bearer …</code> to <code>GET /api/me</code>. An API key
                  also works in an <code>x-api-key</code> header. Copy the API key now; it is not shown again.
                </p>
                <pre className="bg-muted overflow-x-auto rounded-lg p-4 text-sm break-all whitespace-pre-wrap">
                  {JSON.stringify(credentials, null, 2)}
                </pre>
              </div>
            )}
          </>
        )}
        {!isPending && !session && <p className="text-muted-foreground text-sm">You are not signed in.</p>}
      </section>
    </main>
  )
}
