import type { InferClientInputs, InferClientOutputs } from '@orpc/client'
import type { RouterClient } from '@orpc/server'
import type { apiRouter } from '../server/router'

export type ApiClient = RouterClient<typeof apiRouter>
export type ApiInputs = InferClientInputs<ApiClient>
export type ApiOutputs = InferClientOutputs<ApiClient>
