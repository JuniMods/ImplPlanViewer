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
  border: 1px solid color-mix(in srgb, var(--border) 76%, transparent);
  border-radius: 0.75rem;
  background: color-mix(in srgb, var(--surface-1) 90%, transparent);
  color: var(--text-h);
  cursor: pointer;
  width: 2.15rem;
  height: 2.15rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 1px 0 color-mix(in srgb, #ffffff 40%, transparent);
}

.theme-toggle:hover {
  border-color: var(--border-strong);
  transform: translateY(-1px);
}
</style>
