import { z } from 'zod'

export const ItemSchema = z
  .object({
    id: z.uuid(),
    name: z.string(),
    createdAt: z.number().int()
  })
  .meta({ id: 'Item' })

export const CreateItemInputSchema = z
  .object({
    name: z.string().max(100, 'Item names cannot exceed 100 characters.').regex(/\S/, 'Enter an item name.')
  })
  .meta({ id: 'CreateItemInput' })

export const ErrorExampleResultSchema = z
  .object({
    success: z.literal(true)
  })
  .meta({ id: 'ErrorExampleResult' })

export const ErrorExampleProfileSchema = z
  .object({
    displayName: z.string().min(3, 'Enter at least 3 characters.')
  })
  .meta({ id: 'ErrorExampleProfile' })

export const ValidationErrorExampleInputSchema = z
  .object({
    email: z.email('Enter a valid email address.'),
    age: z.number().int('Enter a whole number.').min(18, 'Age must be at least 18.'),
    profile: ErrorExampleProfileSchema,
    tags: z.array(z.string().min(2, 'Enter at least 2 characters.')).min(1, 'Add at least one tag.')
  })
  .meta({ id: 'ValidationErrorExampleInput' })
