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
  border: 1px dashed var(--border);
  border-radius: 0.75rem;
  padding: 1.25rem;
  text-align: center;
  color: var(--text-m, var(--text));
  background: color-mix(in srgb, var(--bg) 94%, var(--border));
  display: grid;
  gap: 0.75rem;
  justify-items: center;
}

.empty-state__title,
.empty-state__message {
  margin: 0;
}

.empty-state__title {
  color: var(--text-h, var(--text));
}

.empty-state__action {
  border: 1px solid var(--border);
  border-radius: 0.35rem;
  padding: 0.35rem 0.9rem;
  background: var(--bg);
  color: var(--text-h, var(--text));
  cursor: pointer;
  font: inherit;
}
</style>
