import { gasPost } from '../utils/gas'
import type { Transaction } from '../../types'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    accountId: string
    type: 'income' | 'expense'
    amount: number
    category: string
    note?: string
    date: string
  }>(event)

  if (!body.accountId?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'accountId required' })
  }
  if (body.type !== 'income' && body.type !== 'expense') {
    throw createError({ statusCode: 400, statusMessage: 'type must be income or expense' })
  }
  if (typeof body.amount !== 'number' || !Number.isInteger(body.amount) || body.amount <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'amount must be a positive integer' })
  }
  if (!body.category?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'category required' })
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
    throw createError({ statusCode: 400, statusMessage: 'date must be YYYY-MM-DD' })
  }

  const result = await gasPost<Transaction>({
    action: 'createTransaction',
    accountId: body.accountId.trim(),
    type: body.type,
    amount: body.amount,
    category: body.category.trim(),
    note: (body.note ?? '').trim(),
    date: body.date,
  })

  if (!result.ok) {
    throw createError({ statusCode: 502, statusMessage: result.error ?? 'GAS error' })
  }
  return result
})
