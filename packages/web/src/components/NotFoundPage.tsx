import { buttonVariants } from '@dunbar/ui-template/components/button'
import { Link } from '@tanstack/react-router'

export function NotFoundPage() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <div className="grid w-full max-w-lg gap-6 text-center">
        <div className="grid gap-3">
          <p className="text-muted-foreground text-sm font-medium">404 — Page not found</p>
          <h1 className="text-3xl font-semibold tracking-tight">This page does not exist</h1>
          <p className="text-muted-foreground">Check the address, or return to the home page.</p>
        </div>
        <div className="flex justify-center">
          <Link to="/" className={buttonVariants()}>
            Go home
          </Link>
        </div>
      </div>
    </main>
  )
}
