import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: App
})

function App() {
  return (
    <div className="flex h-dvh flex-col items-center justify-center bg-black text-3xl font-bold text-white">
      Base Template
    </div>
  )
}
