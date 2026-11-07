import { gasGet } from '../utils/gas'
import type { Transaction } from '../../types'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const accountId = query.accountId as string
  const mode = (query.mode as string) || 'daily'
  const date = (query.date as string) || ''

  if (!accountId) {
    throw createError({ statusCode: 400, statusMessage: 'accountId required' })
  }

  const params: Record<string, string> = { action: 'getTransactions', accountId, mode }
  if (date) params.date = date

  const result = await gasGet<Transaction[]>(params)
  if (!result.ok) {
    throw createError({ statusCode: 502, statusMessage: result.error ?? 'GAS error' })
  }
  return result
})
