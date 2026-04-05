<script setup lang="ts">
import { computed, onServerPrefetch, ref, watch } from 'vue'

import { useMarkdown } from '../../composables'

const props = defineProps<{
  objective: string
  currentState?: string
}>()

const { render } = useMarkdown()

const objectiveHtml = ref('')
const currentStateHtml = ref('')
const renderError = ref<Error | null>(null)

const normalizedObjective = computed(() => props.objective.trim())
const normalizedCurrentState = computed(() => (props.currentState ?? '').trim())

const hasCurrentState = computed(() => normalizedCurrentState.value.length > 0)

const objectiveFallback = computed(() => normalizedObjective.value || 'No problem/objective details available.')

const renderSections = async (): Promise<void> => {
  objectiveHtml.value = ''
  currentStateHtml.value = ''
  renderError.value = null

  try {
    if (normalizedObjective.value.length > 0) {
      objectiveHtml.value = await render(normalizedObjective.value)
    }

    if (hasCurrentState.value) {
      currentStateHtml.value = await render(normalizedCurrentState.value)
    }
  } catch (error: unknown) {
    renderError.value = error instanceof Error ? error : new Error('Failed to render markdown')
  }
}

watch([normalizedObjective, normalizedCurrentState], () => {
  void renderSections()
}, {
  immediate: true,
})

onServerPrefetch(renderSections)
</script>

<template>
  <section class="objective-block" data-testid="objective-block">
    <h2 class="objective-block__title">Problem / Objective</h2>

    <!-- eslint-disable vue/no-v-html -->
    <div
      v-if="objectiveHtml && !renderError"
      class="objective-block__panel objective-block__markdown"
      data-testid="objective-content"
      v-html="objectiveHtml"
    />
    <p v-else class="objective-block__panel objective-block__fallback" data-testid="objective-content-fallback">
      {{ objectiveFallback }}
    </p>

    <section v-if="hasCurrentState" class="objective-block__current-state" data-testid="current-state-block">
      <h3 class="objective-block__subtitle">Current State</h3>

      <div
        v-if="currentStateHtml && !renderError"
        class="objective-block__panel objective-block__markdown"
        data-testid="current-state-content"
        v-html="currentStateHtml"
      />
      <!-- eslint-enable vue/no-v-html -->
      <p v-else class="objective-block__panel objective-block__fallback" data-testid="current-state-content-fallback">
        {{ normalizedCurrentState }}
      </p>
    </section>
  </section>
</template>

<style scoped>
.objective-block {
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  background: var(--bg);
  padding: 1rem;
  display: grid;
  gap: 0.85rem;
}

.objective-block__title,
.objective-block__subtitle {
  margin: 0;
  color: var(--text-h);
}

.objective-block__title {
  font-size: 1.1rem;
}

.objective-block__subtitle {
  font-size: 1rem;
}

.objective-block__current-state {
  display: grid;
  gap: 0.65rem;
}

.objective-block__panel {
  margin: 0;
  border: 1px solid color-mix(in srgb, var(--accent) 12%, var(--border));
  background: color-mix(in srgb, var(--accent) 5%, var(--bg));
  border-radius: 0.6rem;
  padding: 0.85rem;
}

.objective-block__fallback {
  color: var(--text-m, var(--text));
}

.objective-block__markdown :deep(p:first-child) {
  margin-top: 0;
}

.objective-block__markdown :deep(p:last-child) {
  margin-bottom: 0;
}

.objective-block__markdown :deep(a) {
  color: var(--accent);
}

.objective-block__markdown :deep(pre) {
  overflow-x: auto;
  border-radius: 0.5rem;
}

.objective-block__markdown :deep(code.inline-code) {
  border-radius: 0.3rem;
  background: color-mix(in srgb, var(--text-h) 12%, transparent);
  padding: 0.08rem 0.3rem;
}
</style>
