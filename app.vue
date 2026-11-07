<script setup lang="ts">
import { useToasts } from '~/composables/useBudget'

const toasts = useToasts()
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <NuxtPage />

    <!-- Global toast container -->
    <div
      aria-live="assertive"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none"
    >
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto rounded-2xl px-4 py-3 text-sm font-medium shadow-lg flex items-center gap-2"
          :class="toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'"
          role="alert"
        >
          <span>{{ toast.type === 'error' ? '⚠️' : '✅' }}</span>
          {{ toast.message }}
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<style>
.toast-enter-active { transition: all 0.25s ease; }
.toast-leave-active { transition: all 0.2s ease; }
.toast-enter-from { opacity: 0; transform: translateY(8px) scale(0.97); }
.toast-leave-to   { opacity: 0; transform: translateY(8px) scale(0.97); }
.toast-move       { transition: transform 0.25s ease; }
</style>
