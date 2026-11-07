<script setup lang="ts">
import type { PeriodMode } from '~/types'
import { periodLabel, todayPP, thisMonthPP } from '~/utils/date'

const { periodMode, periodDate, setPeriodMode, setPeriodDate } = useBudget()

const label = computed(() => periodLabel(periodMode.value, periodDate.value))

function onModeToggle(mode: PeriodMode) {
  setPeriodMode(mode)
}

function onDateChange(e: Event) {
  const val = (e.target as HTMLInputElement).value
  if (val) setPeriodDate(val)
}

function onMonthChange(e: Event) {
  const val = (e.target as HTMLInputElement).value
  if (val) setPeriodDate(val)
}

// Clamp the date input type based on period mode
const inputType = computed(() => periodMode.value === 'daily' ? 'date' : 'month')
const inputValue = computed(() => periodDate.value)
</script>

<template>
  <div class="flex flex-col gap-2">
    <!-- Period mode toggle -->
    <div
      class="inline-flex self-start bg-gray-100 rounded-lg p-0.5"
      role="group"
      aria-label="Period filter"
    >
      <button
        v-for="mode in (['daily', 'monthly'] as PeriodMode[])"
        :key="mode"
        type="button"
        class="min-touch flex items-center justify-center px-3 rounded-md text-sm font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 capitalize"
        :class="
          periodMode === mode
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        "
        :aria-pressed="periodMode === mode"
        @click="onModeToggle(mode)"
      >
        {{ mode === 'daily' ? 'Daily' : 'Monthly' }}
      </button>
    </div>

    <!-- Date / Month picker -->
    <div class="flex items-center gap-2">
      <input
        class="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent-500 min-touch cursor-pointer"
        :type="inputType"
        :value="inputValue"
        :max="periodMode === 'daily' ? todayPP() : thisMonthPP()"
        @change="periodMode === 'daily' ? onDateChange($event) : onMonthChange($event)"
      />
      <span class="text-xs text-gray-500 font-medium">{{ label }}</span>
    </div>
  </div>
</template>
