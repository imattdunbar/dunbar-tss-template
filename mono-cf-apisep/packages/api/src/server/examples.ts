import { openapi } from '@orpc/openapi'
import { z } from 'zod'
import { os } from './middleware'

const ErrorExampleResultSchema = z
  .object({
    success: z.literal(true)
  })
  .meta({ id: 'ErrorExampleResult' })

const ValidationErrorExampleInputSchema = z
  .object({
    email: z.email('Enter a valid email address.'),
    age: z.number().int('Enter a whole number.').min(18, 'Age must be at least 18.'),
    profile: z.object({
      displayName: z.string().min(3, 'Enter at least 3 characters.')
    }),
    tags: z.array(z.string().min(2, 'Enter at least 2 characters.')).min(1, 'Add at least one tag.')
  })
  .meta({ id: 'ValidationErrorExampleInput' })

const route = os

export default {
  errors: {
    validation: route
      .meta(
        openapi({
          method: 'POST',
          path: '/examples/errors/validation',
          operationId: 'triggerValidationError',
          summary: 'Trigger an input validation error',
          tags: ['Error Examples']
        })
      )
      .input(ValidationErrorExampleInputSchema)
      .output(ErrorExampleResultSchema)
      .handler(() => ({ success: true as const })),
    notFound: route
      .meta(
        openapi({
          method: 'GET',
          path: '/examples/errors/not-found',
          operationId: 'triggerNotFoundError',
          summary: 'Trigger a not found error',
          tags: ['Error Examples']
        })
      )
      .output(ErrorExampleResultSchema)
      .handler(({ errors }) => {
        throw errors.NOT_FOUND()
      }),
    conflict: route
      .meta(
        openapi({
          method: 'POST',
          path: '/examples/errors/conflict',
          operationId: 'triggerConflictError',
          summary: 'Trigger a conflict error',
          tags: ['Error Examples']
        })
      )
      .output(ErrorExampleResultSchema)
      .handler(({ errors }) => {
        throw errors.CONFLICT()
      }),
    internal: route
      .meta(
        openapi({
          method: 'GET',
          path: '/examples/errors/internal',
          operationId: 'triggerInternalError',
          summary: 'Trigger an internal server error',
          tags: ['Error Examples']
        })
      )
      .output(ErrorExampleResultSchema)
      .handler(() => {
        throw new Error('Example internal failure', {
          cause: new Error('Example root cause')
        })
      })
  }
}
