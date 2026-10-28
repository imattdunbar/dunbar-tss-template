import {
  COMMON_ERROR_STATUS_MAP,
  ORPCError,
  ValidationError,
  onError,
  type Context,
  type ErrorMap,
  type ProcedureClientInterceptor,
  type Schema
} from '@orpc/server'
import type { StandardHandlerInterceptor } from '@orpc/server/standard'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'

const debugErrorSchema = z.object({
  name: z.string(),
  message: z.string(),
  stack: z.string().optional()
})

export const apiErrors = {
  INPUT_VALIDATION_FAILED: { message: 'Invalid request' },
  NOT_FOUND: { message: 'The requested resource was not found' },
  UNAUTHORIZED: { message: 'Authentication is required' },
  FORBIDDEN: { message: 'Access is denied' },
  CONFLICT: { message: 'The request conflicts with the current resource state' },
  INTERNAL_SERVER_ERROR: {
    message: 'Internal Server Error',
    data: debugErrorSchema.optional()
  }
}

export const apiErrorStatusMap: Record<string, number> = {
  ...COMMON_ERROR_STATUS_MAP,
  INPUT_VALIDATION_FAILED: 422
}

// A procedure error can cross both the client and HTTP interceptors.
const normalizedErrors = new WeakSet<Error>()

// All API boundaries use this policy before their transport serializes an error.
export function normalizeApiError(error: unknown, development = false) {
  if (error instanceof ORPCError && normalizedErrors.has(error)) return error

  if (error instanceof ORPCError && error.code === 'BAD_REQUEST' && error.cause instanceof ValidationError) {
    const normalized = new ORPCError('INPUT_VALIDATION_FAILED', {
      message: error.cause.issues.map(({ message }) => message).join(', '),
      cause: error.cause
    })

    normalizedErrors.add(normalized)
    return normalized
  }

  if (error instanceof HTTPException && error.status < 500) {
    const code = Object.entries(apiErrorStatusMap).find(([, status]) => status === error.status)?.[0] ?? 'BAD_REQUEST'
    return new ORPCError(code, { message: error.message || undefined, cause: error })
  }

  if (error instanceof ORPCError && error.code !== 'INTERNAL_SERVER_ERROR') return error

  const cause = error instanceof ORPCError ? (error.cause ?? error) : error
  console.error(cause)

  const details =
    cause instanceof Error
      ? { name: cause.name, message: cause.message, stack: cause.stack }
      : { name: typeof cause, message: String(cause) }
  const normalized = new ORPCError('INTERNAL_SERVER_ERROR', {
    message: development ? details.message : 'Internal Server Error',
    data: development ? details : undefined,
    cause
  })

  normalizedErrors.add(normalized)
  return normalized
}

export function createApiErrorInterceptor(
  development = false
): ProcedureClientInterceptor<Context, Schema<unknown>, ErrorMap> {
  return onError((error) => {
    throw normalizeApiError(error, development)
  })
}

export function createApiHandlerErrorInterceptor<TContext extends Context>(
  development = false
): StandardHandlerInterceptor<TContext> {
  return async ({ next, decodeInput, ...options }) => {
    try {
      return await next({
        ...options,
        decodeInput: async () => {
          try {
            return await decodeInput()
          } catch (error) {
            // Malformed transport input is a client error, not a procedure failure.
            if (error instanceof ORPCError) throw error
            throw new ORPCError('BAD_REQUEST', { message: 'Malformed API request', cause: error })
          }
        }
      })
    } catch (error) {
      throw normalizeApiError(error, development)
    }
  }
}

export function createApiErrorResponse(error: unknown, development = false) {
  const normalized = normalizeApiError(error, development)

  return Response.json(normalized.toJSON(), {
    status: apiErrorStatusMap[normalized.code] ?? 400
  })
}
