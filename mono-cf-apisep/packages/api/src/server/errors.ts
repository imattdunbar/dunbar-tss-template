import { COMMON_ERROR_STATUS_MAP } from '@orpc/client'
import {
  ORPCError,
  ValidationError,
  onError,
  type AnyORPCError,
  type DefaultInitialContext,
  type ErrorMap,
  type ProcedureClientOptions,
  type Schema
} from '@orpc/server'
import type { Context } from 'hono'
import { z } from 'zod'

const ValidationIssueSchema = z
  .object({
    field: z.string().optional(),
    message: z.string()
  })
  .meta({ id: 'ValidationIssue' })

const ValidationErrorDataSchema = z
  .object({
    issues: z.array(ValidationIssueSchema)
  })
  .meta({ id: 'ValidationErrorData' })

export const apiErrors = {
  INPUT_VALIDATION_FAILED: {
    message: 'Validation failed',
    data: ValidationErrorDataSchema
  },
  UNAUTHORIZED: {
    message: 'Authentication is required'
  },
  NOT_FOUND: {
    message: 'The requested resource was not found'
  },
  CONFLICT: {
    message: 'The request conflicts with the current resource state'
  }
}

export const apiErrorStatusMap = {
  ...COMMON_ERROR_STATUS_MAP,
  INPUT_VALIDATION_FAILED: 422,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  CONFLICT: 409
}

type ValidationIssue = z.infer<typeof ValidationIssueSchema>

type DebugErrorDetails = {
  name: string
  message: string
  stack?: string
  cause?: string
}

const formatPath = (path: ValidationError['issues'][number]['path']) => {
  let field = ''

  for (const part of path ?? []) {
    const key = typeof part === 'object' ? part.key : part

    if (typeof key === 'number') {
      field += `[${key}]`
    } else {
      field += field ? `.${String(key)}` : String(key)
    }
  }

  return field || undefined
}

const formatIssues = (issues: ValidationError['issues']): ValidationIssue[] =>
  issues.map((issue) => ({
    field: formatPath(issue.path),
    message: issue.message
  }))

const formatValidationMessage = (issues: ValidationIssue[]) =>
  `Invalid request: ${issues.map((issue) => (issue.field ? `${issue.field}: ${issue.message}` : issue.message)).join('; ')}`

const getUnexpectedCause = (error: unknown) =>
  error instanceof ORPCError && error.cause !== undefined ? error.cause : error

const getDebugDetails = (error: unknown): DebugErrorDetails => {
  const cause = getUnexpectedCause(error)

  if (!(cause instanceof Error)) {
    return {
      name: typeof cause,
      message: String(cause)
    }
  }

  let causeMessage: string | undefined

  if (cause.cause instanceof Error) {
    causeMessage = `${cause.cause.name}: ${cause.cause.message}`
  } else if (cause.cause !== undefined) {
    causeMessage = String(cause.cause)
  }

  return {
    name: cause.name,
    message: cause.message,
    stack: cause.stack,
    cause: causeMessage
  }
}

const createInternalError = (error: unknown) => {
  const cause = getUnexpectedCause(error)

  if (import.meta.env.DEV) {
    const details = getDebugDetails(error)

    return new ORPCError('INTERNAL_SERVER_ERROR', {
      message: details.message,
      data: details,
      cause
    })
  }

  return new ORPCError('INTERNAL_SERVER_ERROR', {
    message: 'Internal Server Error',
    cause
  })
}

const normalizeError = (error: unknown) => {
  if (error instanceof ORPCError && error.code === 'BAD_REQUEST' && error.cause instanceof ValidationError) {
    const issues = formatIssues(error.cause.issues)

    throw new ORPCError('INPUT_VALIDATION_FAILED', {
      message: formatValidationMessage(issues),
      data: { issues },
      cause: error.cause
    })
  }

  const isUnexpectedError = !(error instanceof ORPCError) || error.code === 'INTERNAL_SERVER_ERROR'

  if (!isUnexpectedError) return

  console.error(error)

  if (import.meta.env.DEV) {
    throw createInternalError(error)
  }

  if (error instanceof ORPCError && error.cause instanceof ValidationError) {
    throw new ORPCError('INTERNAL_SERVER_ERROR', {
      message: 'The server returned an invalid response',
      cause: error.cause
    })
  }
}

type ORPCErrorInterceptor = NonNullable<
  ProcedureClientOptions<
    DefaultInitialContext & object,
    Schema<unknown>,
    ErrorMap,
    AnyORPCError,
    object
  >['interceptors']
>[number]

export const orpcErrorInterceptor: ORPCErrorInterceptor = onError((error) => {
  return normalizeError(error)
})

export const onErrorHandler = (error: Error, c: Context) => {
  console.error(error)
  return c.json(createInternalError(error).toJSON(), 500)
}

export const onNotFoundHandler = (c: Context) =>
  c.json(
    new ORPCError('NOT_FOUND', {
      message: 'The requested API route was not found'
    }).toJSON(),
    404
  )
