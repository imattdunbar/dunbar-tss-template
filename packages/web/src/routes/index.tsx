import { buttonVariants } from '@dunbar/ui-template/components/button'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home
})

function Home() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">Dunbar Template</h1>
      <Link to="/demo" className={buttonVariants()}>
        Component workshop
      </Link>
    </main>
  )
}
