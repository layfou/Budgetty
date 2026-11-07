// Shared TypeScript interfaces for the whole app

export interface Account {
  id: string
  name: string
  type: 'Cash' | 'Bank' | 'E-wallet' | 'Other'
  openingBalance: number
  createdAt: string
}

export interface Summary {
  id: string
  name: string
  type: Account['type']
  openingBalance: number
  balance: number
  income: number
  expense: number
}

export interface Transaction {
  id: string
  accountId: string
  type: 'income' | 'expense'
  amount: number
  category: string
  note: string
  date: string        // YYYY-MM-DD
  createdAt: string
}

export type AmountMode = 'balance' | 'income' | 'expense'
export type PeriodMode = 'daily' | 'monthly'

export interface GasResponse<T = unknown> {
  ok: boolean
  data?: T
  error?: string
}
