import type { ErrorHandler } from 'elysia'
import { StatusMap } from 'elysia'
import { ZodError } from 'zod'

type ValidStatusCode = keyof StatusMap | StatusMap[keyof StatusMap]

export class AppError extends Error {
  code: ValidStatusCode

  constructor(message: string, code: ValidStatusCode) {
    super(message)
    this.code = code
  }
}

export function toAppError(err: any): AppError {
  // Handle ZodError
  if (err instanceof ZodError) {
    const allErrors = err.issues
      .map((issue) => {
        const pathStr = issue.path.join('.')
        return pathStr ? `${pathStr}: ${issue.message}` : issue.message
      })
      .join(' | ')
    return new AppError(`Validation ==> ${allErrors}`, 400)
  }

  // Handle Elysia validator issues
  if (err.elysiaErrors) {
    return new AppError(
      `Validation ==> ${err.elysiaErrors
        .map((ee: any) => {
          return `${ee.path}: ${ee.message}`
        })
        .join(' | ')}`,
      400
    )
  }

  // Might not need this since it's for Hono, Elysia handled above
  // Handle StandardSchema issues array
  if (Array.isArray(err)) {
    const errors: string[] = []
    for (const item of err) {
      // Check if it's a valid StandardSchema issue
      if (typeof item === 'object' && item !== null && 'message' in item && typeof item.message === 'string') {
        const pathStr = item.path?.map((p: any) => (typeof p === 'object' ? p.key : p)).join('.') || ''
        errors.push(pathStr ? `${pathStr}: ${item.message}` : item.message)
      }
    }
    if (errors.length > 0) {
      return new AppError(`Validation ==> ${errors.join(' | ')}`, 400)
    }
  }

  // Already an AppError
  if (err instanceof AppError) {
    return err
  }

  // Handle regular Error objects
  if (err instanceof Error) {
    return new AppError(err.message, 400)
  }

  // Handle string
  if (typeof err === 'string') {
    return new AppError(err, 500)
  }

  // Fallback for anything else
  return new AppError('Unknown error', 500)
}

export const onErrorHandler: ErrorHandler = ({ code, error, set }) => {
  let errorToPass: any = error

  if (code === 'VALIDATION') {
    errorToPass = {
      elysiaErrors: error.all.map((err: any) => {
        return {
          path: err.path,
          message: err.message
        }
      })
    }
  }

  const e = toAppError(errorToPass)
  set.status = e.code
  return { error: e.message }
}
