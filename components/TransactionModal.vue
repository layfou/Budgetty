<script setup lang="ts">
import { todayPP } from '~/utils/date'

const props = defineProps<{
  accountId: string
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved'): void
}>()

const { createTransaction } = useBudget()

const transactionType = ref<'income' | 'expense'>('expense')
const amount = ref('')
const category = ref('')
const note = ref('')
const date = ref(todayPP())
const saving = ref(false)

// Errors
const errors = reactive({
  amount: '',
  category: '',
  date: '',
})

function reset() {
  transactionType.value = 'expense'
  amount.value = ''
  category.value = ''
  note.value = ''
  date.value = todayPP()
  errors.amount = ''
  errors.category = ''
  errors.date = ''
}

watch(() => props.open, (v) => { if (v) reset() })

function validate(): boolean {
  errors.amount = ''
  errors.category = ''
  errors.date = ''

  const n = Number(amount.value)
  if (!amount.value || !Number.isInteger(n) || n <= 0) {
    errors.amount = 'Enter a positive whole number'
    return false
  }
  if (!category.value.trim()) {
    errors.category = 'Category is required'
    return false
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date.value)) {
    errors.date = 'Enter a valid date'
    return false
  }
  return true
}

async function submit() {
  if (!validate()) return
  saving.value = true
  const ok = await createTransaction({
    accountId: props.accountId,
    type: transactionType.value,
    amount: Number(amount.value),
    category: category.value.trim(),
    note: note.value.trim(),
    date: date.value,
  })
  saving.value = false
  if (ok) {
    emit('saved')
    emit('close')
  }
}

// Prevent background scroll when open
watchEffect(() => {
  if (import.meta.client) {
    document.body.style.overflow = props.open ? 'hidden' : ''
  }
})
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 bg-black/40 z-40"
        aria-hidden="true"
        @click="emit('close')"
      />
    </Transition>

    <!-- Sheet -->
    <Transition name="slide-up">
      <div
        v-if="open"
        class="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-w-app mx-auto"
        role="dialog"
        aria-modal="true"
        aria-label="Add transaction"
      >
        <!-- Handle -->
        <div class="flex justify-center pt-3 pb-1">
          <div class="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        <div class="px-5 pb-8 pt-3">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Add Transaction</h2>

          <!-- Type toggle -->
          <div class="flex rounded-xl overflow-hidden border border-gray-200 mb-5">
            <button
              type="button"
              class="flex-1 min-touch py-2.5 text-sm font-semibold transition-colors"
              :class="transactionType === 'expense' ? 'bg-red-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'"
              @click="transactionType = 'expense'"
            >
              Expense
            </button>
            <button
              type="button"
              class="flex-1 min-touch py-2.5 text-sm font-semibold transition-colors"
              :class="transactionType === 'income' ? 'bg-emerald-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'"
              @click="transactionType = 'income'"
            >
              Income
            </button>
          </div>

          <div class="space-y-4">
            <!-- Amount -->
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Amount (KHR)</label>
              <div class="relative">
                <input
                  v-model="amount"
                  type="number"
                  min="1"
                  step="1"
                  inputmode="numeric"
                  placeholder="e.g. 50000"
                  class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 pr-8"
                  :class="errors.amount ? 'border-red-400' : ''"
                />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm khmer">៛</span>
              </div>
              <p v-if="errors.amount" class="text-xs text-red-500 mt-1">{{ errors.amount }}</p>
            </div>

            <!-- Category -->
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Category</label>
              <input
                v-model="category"
                type="text"
                placeholder="e.g. Food, Transport…"
                class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                :class="errors.category ? 'border-red-400' : ''"
              />
              <p v-if="errors.category" class="text-xs text-red-500 mt-1">{{ errors.category }}</p>
            </div>

            <!-- Note -->
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Note (optional)</label>
              <input
                v-model="note"
                type="text"
                placeholder="Optional note…"
                class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
            </div>

            <!-- Date -->
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Date</label>
              <input
                v-model="date"
                type="date"
                class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                :class="errors.date ? 'border-red-400' : ''"
              />
              <p v-if="errors.date" class="text-xs text-red-500 mt-1">{{ errors.date }}</p>
            </div>
          </div>

          <!-- Submit -->
          <button
            type="button"
            class="mt-6 w-full min-touch py-3.5 rounded-2xl text-sm font-semibold text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 disabled:opacity-60"
            :class="transactionType === 'income' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-accent-500 hover:bg-accent-600'"
            :disabled="saving"
            @click="submit"
          >
            <span v-if="saving">Saving…</span>
            <span v-else>Save Transaction</span>
          </button>
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
