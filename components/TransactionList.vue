<script setup lang="ts">
import type { Transaction } from '~/types'
import { formatKHR } from '~/utils/formatKHR'
import { formatDate } from '~/utils/date'

const props = defineProps<{
  accountId: string
  accountName: string
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { fetchTransactions } = useBudget()

const transactions = ref<Transaction[]>([])
const loading = ref(false)
const fetched = ref(false)

watch(() => props.open, async (v) => {
  if (v) {
    loading.value = true
    fetched.value = false
    transactions.value = await fetchTransactions(props.accountId)
    loading.value = false
    fetched.value = true
  }
})

watchEffect(() => {
  if (import.meta.client) {
    document.body.style.overflow = props.open ? 'hidden' : ''
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 bg-black/40 z-40"
        aria-hidden="true"
        @click="emit('close')"
      />
    </Transition>

    <Transition name="slide-up">
      <div
        v-if="open"
        class="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-w-app mx-auto flex flex-col"
        style="max-height: 85dvh"
        role="dialog"
        aria-modal="true"
        :aria-label="`Transactions for ${accountName}`"
      >
        <!-- Handle -->
        <div class="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div class="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-3 flex-shrink-0 border-b border-gray-100">
          <h2 class="text-lg font-semibold text-gray-900 truncate">{{ accountName }}</h2>
          <button
            type="button"
            class="min-touch w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Close"
            @click="emit('close')"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto px-5 py-4">
          <!-- Skeleton -->
          <div v-if="loading" class="space-y-3">
            <div v-for="i in 5" :key="i" class="animate-pulse flex justify-between items-center py-3">
              <div class="space-y-1.5 flex-1">
                <div class="h-3.5 bg-gray-200 rounded w-1/3" />
                <div class="h-3 bg-gray-100 rounded w-1/2" />
              </div>
              <div class="h-4 bg-gray-200 rounded w-20" />
            </div>
          </div>

          <!-- Empty -->
          <div
            v-else-if="fetched && transactions.length === 0"
            class="flex flex-col items-center justify-center py-16 text-center"
          >
            <span class="text-4xl mb-3">🗒️</span>
            <p class="text-gray-600 font-medium">No transactions</p>
            <p class="text-gray-400 text-sm mt-1">for the selected period</p>
          </div>

          <!-- List -->
          <ul v-else class="divide-y divide-gray-100">
            <li
              v-for="t in transactions"
              :key="t.id"
              class="py-3.5 flex items-start justify-between gap-3"
            >
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 mb-0.5">
                  <span
                    class="text-xs font-semibold px-1.5 py-0.5 rounded-md"
                    :class="t.type === 'income' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'"
                  >
                    {{ t.category }}
                  </span>
                </div>
                <p class="text-xs text-gray-400">{{ formatDate(t.date) }}<span v-if="t.note" class="ml-2">· {{ t.note }}</span></p>
              </div>
              <span
                class="font-semibold text-sm flex-shrink-0"
                :class="t.type === 'income' ? 'text-emerald-600' : 'text-red-500'"
              >
                {{ t.type === 'income' ? '+' : '-' }}{{ formatKHR(t.amount) }}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-up-enter-active { transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1); }
.slide-up-leave-active { transition: transform 0.25s cubic-bezier(0.32, 0.72, 0, 1); }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100%); }
</style>
