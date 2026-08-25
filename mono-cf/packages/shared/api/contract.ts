import { oc } from '@orpc/contract'
import { openapi } from '@orpc/openapi'
import { z } from 'zod'
import { ItemCreateSchema, ItemSchema } from '../db/schema'

export const apiContract = {
  items: {
    list: oc
      .meta(
        openapi({
          method: 'GET',
          path: '/items',
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
          summary: 'Create an item',
          successStatus: 201,
          tags: ['Items']
        })
      )
      .input(ItemCreateSchema)
      .output(ItemSchema)
  }
}
