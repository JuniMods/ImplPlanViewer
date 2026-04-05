<script setup lang="ts">
import { computed, onServerPrefetch, ref, watch } from 'vue'

import { useMarkdown } from '../../composables'

const props = withDefaults(
  defineProps<{
    strategy?: string
  }>(),
  {
    strategy: '',
  },
)

const { render } = useMarkdown()

const strategyHtml = ref('')
const renderError = ref<Error | null>(null)

const normalizedStrategy = computed(() => props.strategy.trim())
const hasStrategy = computed(() => normalizedStrategy.value.length > 0)

const fallbackMessage = computed(() =>
  hasStrategy.value ? normalizedStrategy.value : 'No testing strategy provided yet.',
)

const renderStrategy = async (): Promise<void> => {
  strategyHtml.value = ''
  renderError.value = null

  if (!hasStrategy.value) {
    return
  }

  try {
    strategyHtml.value = await render(normalizedStrategy.value)
  } catch (error: unknown) {
    renderError.value = error instanceof Error ? error : new Error('Failed to render markdown')
  }
}

watch(normalizedStrategy, () => {
  void renderStrategy()
}, { immediate: true })

onServerPrefetch(renderStrategy)
</script>

<template>
  <section class="testing-panel" data-testid="testing-panel">
    <header class="testing-panel__header">
      <h2 class="testing-panel__title">Testing Strategy</h2>
      <p class="testing-panel__subtitle">Validation and integration checks for this implementation.</p>
    </header>

    <!-- eslint-disable vue/no-v-html -->
    <div
      v-if="strategyHtml && !renderError"
      class="testing-panel__content testing-panel__markdown"
      data-testid="testing-panel-content"
      v-html="strategyHtml"
    />
    <!-- eslint-enable vue/no-v-html -->
    <p v-else class="testing-panel__content testing-panel__fallback" data-testid="testing-panel-fallback">
      {{ fallbackMessage }}
    </p>
  </section>
</template>

<style scoped>
.testing-panel {
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  background: var(--bg);
  padding: 1rem;
  display: grid;
  gap: 0.85rem;
}

.testing-panel__header {
  display: grid;
  gap: 0.25rem;
}

.testing-panel__title {
  margin: 0;
  color: var(--text-h);
  font-size: 1.1rem;
}

.testing-panel__subtitle {
  margin: 0;
  color: var(--text-m, var(--text));
}

.testing-panel__content {
  margin: 0;
  border: 1px solid color-mix(in srgb, var(--accent) 12%, var(--border));
  background: color-mix(in srgb, var(--accent) 5%, var(--bg));
  border-radius: 0.6rem;
  padding: 0.85rem;
}

.testing-panel__fallback {
  color: var(--text-m, var(--text));
}

.testing-panel__markdown :deep(p:first-child) {
  margin-top: 0;
}

.testing-panel__markdown :deep(p:last-child) {
  margin-bottom: 0;
}

.testing-panel__markdown :deep(a) {
  color: var(--accent);
}

.testing-panel__markdown :deep(pre) {
  overflow-x: auto;
  border-radius: 0.5rem;
}

.testing-panel__markdown :deep(code.inline-code) {
  border-radius: 0.3rem;
  background: color-mix(in srgb, var(--text-h) 12%, transparent);
  padding: 0.08rem 0.3rem;
}
</style>
