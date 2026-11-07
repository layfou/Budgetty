<script setup lang="ts">
import type { Summary } from '~/types'
import { periodLabel } from '~/utils/date'

const {
  summaries,
  amountMode,
  periodMode,
  periodDate,
  loading,
  error,
  fetchSummary,
} = useBudget()

// Modal state
const showAccountModal = ref(false)
const transactionModal = reactive({ open: false, accountId: '' })
const listModal = reactive({ open: false, accountId: '', accountName: '' })

// Fetch summaries on mount
onMounted(() => fetchSummary())

function openTransactionModal(accountId: string) {
  transactionModal.accountId = accountId
  transactionModal.open = true
}

function openListModal(summary: Summary) {
  listModal.accountId = summary.id
  listModal.accountName = summary.name
  listModal.open = true
}

const activePeriodLabel = computed(() => periodLabel(periodMode.value, periodDate.value))
</script>

<template>
  <div class="max-w-app mx-auto min-h-screen flex flex-col">

    <!-- Sticky header -->
    <header class="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-100 px-4 pt-safe-top">
      <div class="flex items-center justify-between py-3">
        <div>
          <h1 class="text-lg font-bold text-gray-900 leading-tight">Budgetty</h1>
          <p class="text-xs text-gray-400">{{ activePeriodLabel }}</p>
        </div>
        <ModeSwitch />
      </div>
      <div class="pb-3">
        <PeriodFilter />
      </div>
    </header>

    <!-- Main -->
    <main class="flex-1 px-4 py-5 space-y-4">

      <!-- Error state -->
      <div
        v-if="error && !loading"
        class="rounded-2xl border border-red-100 bg-red-50 px-4 py-4 text-sm text-red-700 flex items-start gap-2"
      >
        <span class="text-lg leading-none">⚠️</span>
        <div>
          <p class="font-medium">Failed to load accounts</p>
          <p class="text-xs mt-0.5 text-red-500">{{ error }}</p>
          <button
            type="button"
            class="mt-2 text-xs font-semibold underline underline-offset-2"
            @click="fetchSummary"
          >
            Retry
          </button>
        </div>
      </div>

      <!-- Skeleton cards -->
      <template v-if="loading && summaries.length === 0">
        <AccountCard
          v-for="i in 3"
          :key="i"
          :summary="({} as Summary)"
          :mode="amountMode"
          :loading="true"
        />
      </template>

      <!-- Empty state -->
      <div
        v-else-if="!loading && summaries.length === 0 && !error"
        class="flex flex-col items-center justify-center py-20 text-center"
      >
        <span class="text-5xl mb-4">💼</span>
        <p class="text-gray-700 font-semibold text-lg">No accounts yet</p>
        <p class="text-gray-400 text-sm mt-1">Add your first account to get started.</p>
      </div>

      <!-- Account cards -->
      <AccountCard
        v-for="summary in summaries"
        :key="summary.id"
        :summary="summary"
        :mode="amountMode"
        :loading="loading"
        @add-transaction="openTransactionModal"
        @open="openListModal(summary)"
      />

      <!-- Add account button -->
      <button
        type="button"
        class="w-full min-touch flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-accent-300 hover:text-accent-500 transition-colors text-sm font-medium"
        @click="showAccountModal = true"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Add account
      </button>
    </main>

    <!-- Modals -->
    <AccountModal
      :open="showAccountModal"
      @close="showAccountModal = false"
      @saved="fetchSummary"
    />

    <TransactionModal
      :account-id="transactionModal.accountId"
      :open="transactionModal.open"
      @close="transactionModal.open = false"
      @saved="fetchSummary"
    />

    <TransactionList
      :account-id="listModal.accountId"
      :account-name="listModal.accountName"
      :open="listModal.open"
      @close="listModal.open = false"
    />
  </div>
</template>
