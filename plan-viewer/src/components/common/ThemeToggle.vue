<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

import { useThemeStore } from '../../stores'
import { ThemeMode } from '../../types'

const themeStore = useThemeStore()
const { mode } = storeToRefs(themeStore)

const themeDetails = computed(() => {
  if (mode.value === ThemeMode.LIGHT) {
    return {
      icon: '☀️',
      label: 'Switch theme (current: light)',
    }
  }

  if (mode.value === ThemeMode.DARK) {
    return {
      icon: '🌙',
      label: 'Switch theme (current: dark)',
    }
  }

  return {
    icon: '🖥️',
    label: 'Switch theme (current: system)',
  }
})
</script>

<template>
  <button
    type="button"
    class="theme-toggle"
    data-testid="theme-toggle"
    :aria-label="themeDetails.label"
    @click="themeStore.toggleMode"
  >
    {{ themeDetails.icon }}
  </button>
</template>

<style scoped>
.theme-toggle {
  width: 32px;
  height: 32px;
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-default);
  background: var(--color-white);
  color: var(--color-text-primary);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition:
    background-color calc(var(--transition-fast) * 1ms) var(--ease-out),
    border-color calc(var(--transition-fast) * 1ms) var(--ease-out);
}

.theme-toggle:hover {
  background: var(--color-gray-50);
  border-color: var(--color-gray-400);
}

.theme-toggle:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.theme-toggle:active {
  background: var(--color-gray-100);
}
</style>
