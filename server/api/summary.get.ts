import { gasGet } from '../utils/gas'
import type { Summary } from '../../types'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const mode = (query.mode as string) || 'daily'
  const date = (query.date as string) || ''

  const params: Record<string, string> = { action: 'getSummary', mode }
  if (date) params.date = date

  const result = await gasGet<Summary[]>(params)
  if (!result.ok) {
    throw createError({ statusCode: 502, statusMessage: result.error ?? 'GAS error' })
  }
  return result
})
