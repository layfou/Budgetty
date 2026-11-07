import { gasPost } from '../utils/gas'
import type { Account } from '../../types'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    name: string
    type: string
    openingBalance: number
  }>(event)

  if (!body.name?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'name required' })
  }
  if (!body.type?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'type required' })
  }
  if (typeof body.openingBalance !== 'number' || body.openingBalance < 0 || !Number.isInteger(body.openingBalance)) {
    throw createError({ statusCode: 400, statusMessage: 'openingBalance must be a non-negative integer' })
  }

  const result = await gasPost<Account>({
    action: 'createAccount',
    name: body.name.trim(),
    type: body.type.trim(),
    openingBalance: body.openingBalance,
  })

  if (!result.ok) {
    throw createError({ statusCode: 502, statusMessage: result.error ?? 'GAS error' })
  }
  return result
})
