import { UIDemo } from '@dunbar/ui-template/demo'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/demo')({
  component: DemoPage
})

function DemoPage() {
  const [showError, setShowError] = useState(false)
  const navigate = useNavigate()

  if (showError) {
    throw new Error('Demo error: the error preview button triggered this page.')
  }

  return (
    <UIDemo
      onPreviewError={() => setShowError(true)}
      onPreviewNotFound={() => {
        void navigate({ href: `/not-found-${crypto.randomUUID()}` })
      }}
    />
  )
}
