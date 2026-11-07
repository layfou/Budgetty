import type { Summary, Transaction, AmountMode, PeriodMode, GasResponse } from '~/types'
import { todayPP, thisMonthPP } from '~/utils/date'

// ── Shared state (useState = SSR-safe, replaces Pinia) ────────

export const useSummaries = () => useState<Summary[]>('summaries', () => [])
export const useAmountMode = () => useState<AmountMode>('amountMode', () => 'balance')
export const usePeriodMode = () => useState<PeriodMode>('periodMode', () => 'daily')
export const usePeriodDate = () => useState<string>('periodDate', () => todayPP())
export const useSummaryLoading = () => useState<boolean>('summaryLoading', () => false)
export const useSummaryError = () => useState<string | null>('summaryError', () => null)

// ── Toast state ───────────────────────────────────────────────

interface Toast {
  id: number
  message: string
  type: 'error' | 'success'
}
let toastId = 0
export const useToasts = () => useState<Toast[]>('toasts', () => [])

export function useToast() {
  const toasts = useToasts()

  function push(message: string, type: Toast['type'] = 'error') {
    const id = ++toastId
    toasts.value.push({ id, message, type })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, 4000)
  }

  return { push }
}

// ── Main budget composable ────────────────────────────────────

export function useBudget() {
  const summaries = useSummaries()
  const amountMode = useAmountMode()
  const periodMode = usePeriodMode()
  const periodDate = usePeriodDate()
  const loading = useSummaryLoading()
  const error = useSummaryError()
  const { push: pushToast } = useToast()

  // ── Fetch summary ─────────────────────────────────────────

  async function fetchSummary() {
    loading.value = true
    error.value = null
    try {
      const params: Record<string, string> = { mode: periodMode.value }
      if (periodDate.value) params.date = periodDate.value

      const res = await $fetch<GasResponse<Summary[]>>('/api/summary', { params })
      if (!res.ok) throw new Error(res.error ?? 'Unknown error')
      summaries.value = res.data ?? []
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load summaries'
      error.value = msg
      pushToast(msg)
    } finally {
      loading.value = false
    }
  }

  // ── Period / mode changes ─────────────────────────────────

  function setPeriodMode(mode: PeriodMode) {
    periodMode.value = mode
    // Reset date to today/this-month when switching modes
    periodDate.value = mode === 'daily' ? todayPP() : thisMonthPP()
    fetchSummary()
  }

  function setPeriodDate(date: string) {
    periodDate.value = date
    fetchSummary()
  }

  function setAmountMode(mode: AmountMode) {
    amountMode.value = mode
    // No refetch needed – summaries already contain balance, income, expense
  }

  // ── Create account ────────────────────────────────────────

  async function createAccount(payload: {
    name: string
    type: string
    openingBalance: number
  }): Promise<boolean> {
    try {
      const res = await $fetch<GasResponse>('/api/accounts', {
        method: 'POST',
        body: payload,
      })
      if (!res.ok) throw new Error(res.error ?? 'Unknown error')
      pushToast('Account created!', 'success')
      await fetchSummary()
      return true
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to create account'
      pushToast(msg)
      return false
    }
  }

  // ── Create transaction ────────────────────────────────────

  async function createTransaction(payload: {
    accountId: string
    type: 'income' | 'expense'
    amount: number
    category: string
    note?: string
    date: string
  }): Promise<boolean> {
    try {
      const res = await $fetch<GasResponse>('/api/transactions', {
        method: 'POST',
        body: payload,
      })
      if (!res.ok) throw new Error(res.error ?? 'Unknown error')
      pushToast('Transaction saved!', 'success')
      await fetchSummary()
      return true
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to save transaction'
      pushToast(msg)
      return false
    }
  }

  // ── Fetch transactions for one account ────────────────────

  async function fetchTransactions(accountId: string): Promise<Transaction[]> {
    try {
      const params: Record<string, string> = {
        accountId,
        mode: periodMode.value,
      }
      if (periodDate.value) params.date = periodDate.value

      const res = await $fetch<GasResponse<Transaction[]>>('/api/transactions', { params })
      if (!res.ok) throw new Error(res.error ?? 'Unknown error')
      return res.data ?? []
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load transactions'
      pushToast(msg)
      return []
    }
  }

  return {
    summaries,
    amountMode,
    periodMode,
    periodDate,
    loading,
    error,
    fetchSummary,
    setPeriodMode,
    setPeriodDate,
    setAmountMode,
    createAccount,
    createTransaction,
    fetchTransactions,
  }
}
