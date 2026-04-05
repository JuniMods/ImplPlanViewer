<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    filtered?: boolean
    message?: string
    clearLabel?: string
  }>(),
  {
    filtered: false,
    message: '',
    clearLabel: 'Clear filters',
  },
)

const emit = defineEmits<{
  clear: []
}>()

const fallbackMessage = computed(() =>
  props.filtered
    ? 'No plans match the current filters.'
    : 'No plans found in this repository yet. Check back soon for new implementation plans.',
)

const resolvedMessage = computed(() => {
  const trimmed = props.message.trim()
  return trimmed.length > 0 ? trimmed : fallbackMessage.value
})

const title = computed(() => (props.filtered ? 'No results' : 'No plans yet'))

const onClear = (): void => {
  emit('clear')
}
</script>

<template>
  <section class="empty-state" data-testid="plan-empty-state">
    <h3 class="empty-state__title">{{ title }}</h3>
    <p class="empty-state__message" data-testid="plan-grid-empty">
      {{ resolvedMessage }}
    </p>
    <button
      v-if="filtered"
      type="button"
      class="empty-state__action"
      data-testid="plan-empty-state-clear"
      @click="onClear"
    >
      {{ clearLabel }}
    </button>
  </section>
</template>

<style scoped>
.empty-state {
  margin: 0;
  border: 1px dashed var(--color-gray-300);
  border-radius: var(--radius-md);
  padding: var(--space-8);
  text-align: center;
  color: var(--color-text-secondary);
  background: var(--color-gray-50);
  display: grid;
  gap: var(--space-3);
  justify-items: center;
  min-height: 240px;
  place-content: center;
}

.empty-state__title,
.empty-state__message {
  margin: 0;
}

.empty-state__title {
  color: var(--color-text-primary);
  font-size: var(--text-h2);
  font-weight: var(--font-weight-semibold);
}

.empty-state__message {
  font-size: var(--text-body);
  max-width: 480px;
}

.empty-state__action {
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-default);
  padding: var(--space-2) var(--space-4);
  background: var(--color-white);
  color: var(--color-text-primary);
  cursor: pointer;
  font: inherit;
  font-size: var(--text-body-small);
  font-weight: var(--font-weight-medium);
  transition:
    background-color calc(var(--transition-fast) * 1ms) var(--ease-out),
    border-color calc(var(--transition-fast) * 1ms) var(--ease-out);
}

.empty-state__action:hover {
  background: var(--color-gray-50);
  border-color: var(--color-gray-400);
}

.empty-state__action:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
</style>
