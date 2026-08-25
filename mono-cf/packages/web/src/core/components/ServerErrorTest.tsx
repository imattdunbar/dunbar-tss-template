import { Button } from '@dunbar/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@dunbar/ui/components/card'
import { useMutation } from '@tanstack/react-query'
import { ORPCError } from '@orpc/server'
import { createServerFn } from '@tanstack/react-start'
import { orpc } from '@/core/orpc'

const triggerServerError = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    await orpc.examples.errors.internal.call()

    return {
      success: true as const,
      error: null
    }
  } catch (error) {
    if (!(error instanceof ORPCError)) {
      throw error
    }

    return {
      success: false as const,
      error: error.toJSON()
    }
  }
})

export function ServerErrorTest() {
  const serverError = useMutation({
    mutationFn: () => triggerServerError()
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Server oRPC error</CardTitle>
        <CardDescription>
          Calls oRPC through a TanStack Start server function and the direct server interceptor.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Button
          disabled={serverError.isPending}
          onClick={() => serverError.mutate()}
          type="button"
          variant="destructive"
        >
          {serverError.isPending ? 'Triggering...' : 'Trigger server error'}
        </Button>

        {serverError.data ? (
          <pre className="bg-muted overflow-x-auto rounded-lg p-4 text-xs">
            {JSON.stringify(serverError.data, null, 2)}
          </pre>
        ) : null}

        {serverError.error ? <p className="text-destructive text-sm">{serverError.error.message}</p> : null}
      </CardContent>
    </Card>
  )
}
