import { oc } from '@orpc/contract'
import { openapi } from '@orpc/openapi'
import { z } from 'zod'
import { apiErrors } from './errors'
import {
  CreateItemInputSchema,
  ErrorExampleResultSchema,
  ItemSchema,
  ValidationErrorExampleInputSchema
} from './schemas'

const contract = oc.errors(apiErrors)

export const apiContract = contract.router({
  items: {
    list: oc
      .meta(
        openapi({
          method: 'GET',
          path: '/items',
          operationId: 'listItems',
          summary: 'List items',
          tags: ['Items']
        })
      )
      .output(z.array(ItemSchema)),
    create: oc
      .meta(
        openapi({
          method: 'POST',
          path: '/items',
          operationId: 'createItem',
          summary: 'Create an item',
          successStatus: 201,
          tags: ['Items']
        })
      )
      .input(CreateItemInputSchema)
      .output(ItemSchema)
  },
  examples: {
    errors: {
      validation: oc
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
        .output(ErrorExampleResultSchema),
      notFound: oc
        .meta(
          openapi({
            method: 'GET',
            path: '/examples/errors/not-found',
            operationId: 'triggerNotFoundError',
            summary: 'Trigger a not found error',
            tags: ['Error Examples']
          })
        )
        .output(ErrorExampleResultSchema),
      conflict: oc
        .meta(
          openapi({
            method: 'POST',
            path: '/examples/errors/conflict',
            operationId: 'triggerConflictError',
            summary: 'Trigger a conflict error',
            tags: ['Error Examples']
          })
        )
        .output(ErrorExampleResultSchema),
      internal: oc
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
    }
  }
})
