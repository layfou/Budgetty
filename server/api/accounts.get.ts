import { gasGet } from '../utils/gas'
import type { Account } from '../../types'

export default defineEventHandler(async () => {
  const result = await gasGet<Account[]>({ action: 'getAccounts' })
  if (!result.ok) {
    throw createError({ statusCode: 502, statusMessage: result.error ?? 'GAS error' })
  }
  return result
})
