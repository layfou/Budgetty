<script setup lang="ts">
import type { AmountMode } from '~/types'

const { amountMode, setAmountMode } = useBudget()

const modes: { key: AmountMode; label: string }[] = [
  { key: 'balance', label: 'Balance' },
  { key: 'income',  label: 'Income' },
  { key: 'expense', label: 'Expense' },
]
</script>

<template>
  <div
    class="inline-flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm"
    role="group"
    aria-label="Amount mode"
  >
    <button
      v-for="m in modes"
      :key="m.key"
      type="button"
      class="relative min-touch flex items-center justify-center px-4 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
      :class="
        amountMode === m.key
          ? 'bg-accent-500 text-white shadow-sm'
          : 'text-gray-500 hover:text-gray-800'
      "
      :aria-pressed="amountMode === m.key"
      @click="setAmountMode(m.key)"
    >
      {{ m.label }}
    </button>
  </div>
</template>
