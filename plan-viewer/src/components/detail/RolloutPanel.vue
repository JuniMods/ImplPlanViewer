<script setup lang="ts">
import { computed, onServerPrefetch, ref, watch } from 'vue'

import { useMarkdown } from '../../composables'

const props = withDefaults(
  defineProps<{
    plan?: string
  }>(),
  {
    plan: '',
  },
)

const { render } = useMarkdown()

const rolloutHtml = ref('')
const renderError = ref<Error | null>(null)

const normalizedPlan = computed(() => props.plan.trim())
const hasPlan = computed(() => normalizedPlan.value.length > 0)

const fallbackMessage = computed(() =>
  hasPlan.value ? normalizedPlan.value : 'No rollout plan provided yet.',
)

const renderPlan = async (): Promise<void> => {
  rolloutHtml.value = ''
  renderError.value = null

  if (!hasPlan.value) {
    return
  }

  try {
    rolloutHtml.value = await render(normalizedPlan.value)
  } catch (error: unknown) {
    renderError.value = error instanceof Error ? error : new Error('Failed to render markdown')
  }
}

watch(normalizedPlan, () => {
  void renderPlan()
}, { immediate: true })

onServerPrefetch(renderPlan)
</script>

<template>
  <section class="rollout-panel" data-testid="rollout-panel">
    <header class="rollout-panel__header">
      <h2 class="rollout-panel__title">Rollout</h2>
      <p class="rollout-panel__subtitle">Deployment and release safeguards for this implementation.</p>
    </header>

    <!-- eslint-disable vue/no-v-html -->
    <div
      v-if="rolloutHtml && !renderError"
      class="rollout-panel__content rollout-panel__markdown"
      data-testid="rollout-panel-content"
      v-html="rolloutHtml"
    />
    <!-- eslint-enable vue/no-v-html -->
    <p v-else class="rollout-panel__content rollout-panel__fallback" data-testid="rollout-panel-fallback">
      {{ fallbackMessage }}
    </p>
  </section>
</template>

<style scoped>
.rollout-panel {
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  background: var(--bg);
  padding: 1rem;
  display: grid;
  gap: 0.85rem;
}

.rollout-panel__header {
  display: grid;
  gap: 0.25rem;
}

.rollout-panel__title {
  margin: 0;
  color: var(--text-h);
  font-size: 1.1rem;
}

.rollout-panel__subtitle {
  margin: 0;
  color: var(--text-m, var(--text));
}

.rollout-panel__content {
  margin: 0;
  border: 1px solid color-mix(in srgb, var(--accent) 12%, var(--border));
  background: color-mix(in srgb, var(--accent) 5%, var(--bg));
  border-radius: 0.6rem;
  padding: 0.85rem;
}

.rollout-panel__fallback {
  color: var(--text-m, var(--text));
}

.rollout-panel__markdown :deep(p:first-child) {
  margin-top: 0;
}

.rollout-panel__markdown :deep(p:last-child) {
  margin-bottom: 0;
}

.rollout-panel__markdown :deep(a) {
  color: var(--accent);
}

.rollout-panel__markdown :deep(pre) {
  overflow-x: auto;
  border-radius: 0.5rem;
}

.rollout-panel__markdown :deep(code.inline-code) {
  border-radius: 0.3rem;
  background: color-mix(in srgb, var(--text-h) 12%, transparent);
  padding: 0.08rem 0.3rem;
}
</style>
