<script setup lang="ts">
import type { Summary, AmountMode } from '~/types'
import { formatKHR } from '~/utils/formatKHR'

const props = defineProps<{
  summary: Summary
  mode: AmountMode
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'add-transaction', id: string): void
  (e: 'open', id: string): void
}>()

// Account type → colour/icon mapping
const typeConfig: Record<string, { icon: string; color: string; bg: string }> = {
  Cash:     { icon: '💵', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100' },
  Bank:     { icon: '🏦', color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-100' },
  'E-wallet': { icon: '📱', color: 'text-violet-700', bg: 'bg-violet-50 border-violet-100' },
  Other:    { icon: '🪙', color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-100' },
}

const cfg = computed(() => typeConfig[props.summary.type] ?? typeConfig.Other)

const displayAmount = computed(() => {
  switch (props.mode) {
    case 'balance': return props.summary.balance
    case 'income':  return props.summary.income
    case 'expense': return props.summary.expense
  }
})

const isNegative = computed(() => displayAmount.value < 0)
</script>

<template>
  <!-- Skeleton -->
  <div
    v-if="loading"
    class="rounded-2xl border bg-white p-5 shadow-sm animate-pulse space-y-3"
  >
    <div class="h-4 bg-gray-200 rounded w-1/3" />
    <div class="h-8 bg-gray-200 rounded w-1/2" />
    <div class="h-4 bg-gray-100 rounded w-1/4" />
  </div>

  <!-- Card -->
  <div
    v-else
    class="rounded-2xl border bg-white p-5 shadow-sm active:scale-[0.98] transition-transform duration-100 cursor-pointer select-none"
    :class="cfg.bg"
    role="button"
    tabindex="0"
    :aria-label="`${summary.name} account card`"
    @click="emit('open', summary.id)"
    @keydown.enter="emit('open', summary.id)"
    @keydown.space.prevent="emit('open', summary.id)"
  >
    <!-- Header row -->
    <div class="flex items-start justify-between gap-2">
      <div class="flex items-center gap-2 min-w-0">
        <span class="text-2xl leading-none flex-shrink-0" aria-hidden="true">{{ cfg.icon }}</span>
        <div class="min-w-0">
          <p class="font-semibold text-gray-900 truncate">{{ summary.name }}</p>
          <p class="text-xs text-gray-500 mt-0.5" :class="cfg.color">{{ summary.type }}</p>
        </div>
      </div>

      <!-- Add transaction button -->
      <button
        type="button"
        class="flex-shrink-0 min-touch flex items-center justify-center w-9 h-9 rounded-xl bg-accent-500 text-white shadow hover:bg-accent-600 active:bg-accent-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
        aria-label="Add transaction"
        @click.stop="emit('add-transaction', summary.id)"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>

    <!-- Amount -->
    <div class="mt-4">
      <p class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
        {{ mode === 'balance' ? 'Balance' : mode === 'income' ? 'Income' : 'Expense' }}
      </p>
      <p
        class="text-2xl font-bold tracking-tight"
        :class="isNegative ? 'text-red-600' : 'text-gray-900'"
      >
        {{ formatKHR(displayAmount) }}
      </p>
    </div>

    <!-- Mini stats when showing balance -->
    <div v-if="mode === 'balance'" class="mt-3 flex gap-4">
      <div class="text-xs">
        <span class="text-gray-400">In</span>
        <span class="ml-1 font-medium text-emerald-600">{{ formatKHR(summary.income) }}</span>
      </div>
      <div class="text-xs">
        <span class="text-gray-400">Out</span>
        <span class="ml-1 font-medium text-red-500">{{ formatKHR(summary.expense) }}</span>
      </div>
    </div>
  </div>
</template>
