import { Button, buttonVariants } from '@dunbar/ui-template/components/button'
import { Link, useRouter, type ErrorComponentProps } from '@tanstack/react-router'

export function ErrorPage({ error, reset }: ErrorComponentProps) {
  const router = useRouter()

  function retry() {
    reset()
    void router.invalidate()
  }

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <div className="grid w-full max-w-lg gap-6 text-center">
        <div className="grid gap-3">
          <p className="text-muted-foreground text-sm font-medium">Unexpected error</p>
          <h1 className="text-3xl font-semibold tracking-tight">Something went wrong</h1>
          <p className="text-muted-foreground">This page could not load. Try again, or return to the home page.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={retry}>Try again</Button>
          <Link to="/" className={buttonVariants({ variant: 'outline' })}>
            Go home
          </Link>
        </div>
        {import.meta.env.DEV && (
          <details className="rounded-lg border p-4 text-left text-sm">
            <summary className="cursor-pointer font-medium">Error details</summary>
            <pre className="text-muted-foreground mt-3 overflow-auto break-words whitespace-pre-wrap">
              {error instanceof Error ? error.message : 'An unexpected error occurred.'}
            </pre>
          </details>
        )}
      </div>
    </main>
  )
}
