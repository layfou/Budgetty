<script setup lang="ts">
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved'): void
}>()

const { createAccount } = useBudget()

const name = ref('')
const type = ref<'Cash' | 'Bank' | 'E-wallet' | 'Other'>('Cash')
const openingBalance = ref('')
const saving = ref(false)

const errors = reactive({ name: '', openingBalance: '' })

const accountTypes = ['Cash', 'Bank', 'E-wallet', 'Other'] as const

function reset() {
  name.value = ''
  type.value = 'Cash'
  openingBalance.value = ''
  errors.name = ''
  errors.openingBalance = ''
}

watch(() => props.open, (v) => { if (v) reset() })

function validate(): boolean {
  errors.name = ''
  errors.openingBalance = ''
  if (!name.value.trim()) { errors.name = 'Name is required'; return false }
  const n = Number(openingBalance.value)
  if (openingBalance.value === '' || !Number.isInteger(n) || n < 0) {
    errors.openingBalance = 'Enter a non-negative whole number (0 or more)'
    return false
  }
  return true
}

async function submit() {
  if (!validate()) return
  saving.value = true
  const ok = await createAccount({
    name: name.value.trim(),
    type: type.value,
    openingBalance: Number(openingBalance.value),
  })
  saving.value = false
  if (ok) {
    emit('saved')
    emit('close')
  }
}

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
        class="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-w-app mx-auto"
        role="dialog"
        aria-modal="true"
        aria-label="Add account"
      >
        <div class="flex justify-center pt-3 pb-1">
          <div class="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        <div class="px-5 pb-8 pt-3">
          <h2 class="text-lg font-semibold text-gray-900 mb-5">New Account</h2>

          <div class="space-y-4">
            <!-- Name -->
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Account Name</label>
              <input
                v-model="name"
                type="text"
                placeholder="e.g. ABA Bank"
                class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                :class="errors.name ? 'border-red-400' : ''"
              />
              <p v-if="errors.name" class="text-xs text-red-500 mt-1">{{ errors.name }}</p>
            </div>

            <!-- Type -->
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-2">Account Type</label>
              <div class="grid grid-cols-4 gap-2">
                <button
                  v-for="t in accountTypes"
                  :key="t"
                  type="button"
                  class="min-touch flex flex-col items-center justify-center py-2 rounded-xl border text-xs font-medium transition-colors"
                  :class="type === t
                    ? 'border-accent-500 bg-accent-50 text-accent-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'"
                  @click="type = t"
                >
                  <span class="text-lg mb-0.5">
                    {{ t === 'Cash' ? '💵' : t === 'Bank' ? '🏦' : t === 'E-wallet' ? '📱' : '🪙' }}
                  </span>
                  {{ t }}
                </button>
              </div>
            </div>

            <!-- Opening balance -->
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Opening Balance (KHR)</label>
              <div class="relative">
                <input
                  v-model="openingBalance"
                  type="number"
                  min="0"
                  step="1"
                  inputmode="numeric"
                  placeholder="0"
                  class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 pr-8"
                  :class="errors.openingBalance ? 'border-red-400' : ''"
                />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm khmer">៛</span>
              </div>
              <p v-if="errors.openingBalance" class="text-xs text-red-500 mt-1">{{ errors.openingBalance }}</p>
            </div>
          </div>

          <button
            type="button"
            class="mt-6 w-full min-touch py-3.5 rounded-2xl bg-accent-500 hover:bg-accent-600 text-sm font-semibold text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 disabled:opacity-60"
            :disabled="saving"
            @click="submit"
          >
            <span v-if="saving">Creating…</span>
            <span v-else>Create Account</span>
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
