import { Context } from 'hono'
import { z, ZodError } from 'zod'
import { ContentfulStatusCode } from 'hono/utils/http-status'

export class AppError extends Error {
  code: ContentfulStatusCode

  constructor(message: string, code: ContentfulStatusCode) {
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

    console.log('Zod Error')
    return new AppError(`Validation ==> ${allErrors}`, 400)
  }

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
      console.log('Standard Schema Error')
      return new AppError(`Validation ==> ${errors.join(' | ')}`, 400)
    }
  }

  // Already an AppError
  if (err instanceof AppError) {
    console.log('AppError')
    return err
  }

  // Handle regular Error objects
  if (err instanceof Error) {
    console.log('Regular Error')
    return new AppError(err.message, 500)
  }

  // Handle string
  if (typeof err === 'string') {
    console.log('Error string')
    return new AppError(err, 500)
  }

  // Fallback for anything else
  return new AppError('Unknown error', 500)
}

export const onErrorHandler = (err: Error, c: Context): Response | Promise<Response> => {
  const e = toAppError(err)
  return c.json({ error: e.message }, e.code)
}
