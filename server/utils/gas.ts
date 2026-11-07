import type { GasResponse } from '../../types'

/**
 * Internal helper: proxy a GET request to GAS.
 * Called only from server/api/* routes – never from the browser.
 */
export async function gasGet<T>(params: Record<string, string>): Promise<GasResponse<T>> {
  const config = useRuntimeConfig()
  const url = new URL(config.gasUrl)

  url.searchParams.set('token', config.apiToken)
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v)
  }

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    // follow GAS redirects (it uses 302 to the final exec URL)
    redirect: 'follow',
  })

  if (!res.ok) {
    return { ok: false, error: `GAS HTTP ${res.status}` }
  }
  return res.json() as Promise<GasResponse<T>>
}

/**
 * Internal helper: proxy a POST request to GAS.
 * Sends body as text/plain to avoid CORS preflight.
 */
export async function gasPost<T>(body: Record<string, unknown>): Promise<GasResponse<T>> {
  const config = useRuntimeConfig()
  const url = config.gasUrl

  const res = await fetch(url, {
    method: 'POST',
    // text/plain avoids OPTIONS preflight — Apps Script doesn't handle it
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ ...body, token: config.apiToken }),
    redirect: 'follow',
  })

  if (!res.ok) {
    return { ok: false, error: `GAS HTTP ${res.status}` }
  }
  return res.json() as Promise<GasResponse<T>>
}
