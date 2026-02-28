import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: App
})

function App() {
  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-4 bg-black text-3xl font-bold text-orange-400">
      Cloudflare Template
    </div>
  )
}
