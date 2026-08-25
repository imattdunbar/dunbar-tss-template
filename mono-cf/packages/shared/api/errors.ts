import { COMMON_ERROR_STATUS_MAP } from '@orpc/client'
import { z } from 'zod'

export const ValidationIssueSchema = z
  .object({
    field: z.string().optional(),
    message: z.string()
  })
  .meta({ id: 'ValidationIssue' })

export const ValidationErrorDataSchema = z
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
