<script setup lang="ts">
import { computed, onServerPrefetch, ref, watch } from 'vue'

import { useMarkdown } from '../../composables'
import type { ProposedChange } from '../../types'

const props = defineProps<{
  change: ProposedChange
  index: number
}>()

const { render } = useMarkdown()

const normalizedHeading = computed(() => props.change.heading.trim())
const headingText = computed(() => normalizedHeading.value || 'Change Area')
const emoji = computed(() => props.change.emoji?.trim() ?? '')

const normalizedWhat = computed(() => props.change.what.trim())
const normalizedWhy = computed(() => props.change.why.trim())
const normalizedHow = computed(() => props.change.how.trim())

const whatHtml = ref('')
const whyHtml = ref('')
const howHtml = ref('')
const renderError = ref<Error | null>(null)
const isOpen = ref(props.index === 0)

const renderSections = async (): Promise<void> => {
  whatHtml.value = ''
  whyHtml.value = ''
  howHtml.value = ''
  renderError.value = null

  try {
    if (normalizedWhat.value.length > 0) {
      whatHtml.value = await render(normalizedWhat.value)
    }

    if (normalizedWhy.value.length > 0) {
      whyHtml.value = await render(normalizedWhy.value)
    }

    if (normalizedHow.value.length > 0) {
      howHtml.value = await render(normalizedHow.value)
    }
  } catch (error: unknown) {
    renderError.value = error instanceof Error ? error : new Error('Failed to render markdown')
  }
}

watch([normalizedWhat, normalizedWhy, normalizedHow], () => {
  void renderSections()
}, { immediate: true })

watch(() => props.index, (nextIndex) => {
  isOpen.value = nextIndex === 0
})

const onToggle = (event: Event): void => {
  const details = event.currentTarget
  if (details instanceof HTMLDetailsElement) {
    isOpen.value = details.open
  }
}

onServerPrefetch(renderSections)
</script>

<template>
  <article class="ai-intent-card" data-testid="ai-intent-card">
    <details class="ai-intent-card__panel" :open="isOpen" @toggle="onToggle">
      <summary class="ai-intent-card__summary" data-testid="ai-intent-card-summary">
        <span class="ai-intent-card__heading">{{ index + 1 }}. {{ headingText }}</span>
        <span v-if="emoji" class="ai-intent-card__emoji">{{ emoji }}</span>
      </summary>

      <div class="ai-intent-card__content">
        <section class="ai-intent-card__section" data-testid="ai-intent-what">
          <h3 class="ai-intent-card__label">What</h3>
          <!-- eslint-disable vue/no-v-html -->
          <div
            v-if="whatHtml && !renderError"
            class="ai-intent-card__panel-body ai-intent-card__markdown"
            data-testid="ai-intent-what-content"
            v-html="whatHtml"
          />
          <!-- eslint-enable vue/no-v-html -->
          <p v-else class="ai-intent-card__panel-body ai-intent-card__fallback">{{ normalizedWhat || 'No details provided.' }}</p>
        </section>

        <section class="ai-intent-card__section" data-testid="ai-intent-why">
          <h3 class="ai-intent-card__label">Why</h3>
          <!-- eslint-disable vue/no-v-html -->
          <div
            v-if="whyHtml && !renderError"
            class="ai-intent-card__panel-body ai-intent-card__markdown"
            data-testid="ai-intent-why-content"
            v-html="whyHtml"
          />
          <!-- eslint-enable vue/no-v-html -->
          <p v-else class="ai-intent-card__panel-body ai-intent-card__fallback">{{ normalizedWhy || 'No details provided.' }}</p>
        </section>

        <section class="ai-intent-card__section" data-testid="ai-intent-how">
          <h3 class="ai-intent-card__label">How</h3>
          <!-- eslint-disable vue/no-v-html -->
          <div
            v-if="howHtml && !renderError"
            class="ai-intent-card__panel-body ai-intent-card__markdown"
            data-testid="ai-intent-how-content"
            v-html="howHtml"
          />
          <!-- eslint-enable vue/no-v-html -->
          <p v-else class="ai-intent-card__panel-body ai-intent-card__fallback">{{ normalizedHow || 'No details provided.' }}</p>
        </section>
      </div>
    </details>
  </article>
</template>

<style scoped>
.ai-intent-card {
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  background: var(--bg);
}

.ai-intent-card__panel {
  padding: 0.8rem 0.9rem;
}

.ai-intent-card__summary {
  list-style: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--text-h);
}

.ai-intent-card__summary::-webkit-details-marker {
  display: none;
}

.ai-intent-card__heading {
  font-size: 1rem;
}

.ai-intent-card__emoji {
  font-size: 1rem;
}

.ai-intent-card__content {
  margin-top: 0.85rem;
  display: grid;
  gap: 0.7rem;
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.ai-intent-card__section {
  display: grid;
  gap: 0.45rem;
}

.ai-intent-card__label {
  margin: 0;
  color: var(--text-h);
  font-size: 0.95rem;
}

.ai-intent-card__panel-body {
  margin: 0;
  border: 1px solid color-mix(in srgb, var(--accent) 12%, var(--border));
  background: color-mix(in srgb, var(--accent) 5%, var(--bg));
  border-radius: 0.6rem;
  padding: 0.75rem;
  color: var(--text);
}

.ai-intent-card__fallback {
  color: var(--text-m, var(--text));
}

.ai-intent-card__markdown :deep(p:first-child) {
  margin-top: 0;
}

.ai-intent-card__markdown :deep(p:last-child) {
  margin-bottom: 0;
}

.ai-intent-card__markdown :deep(a) {
  color: var(--accent);
}

.ai-intent-card__markdown :deep(pre) {
  overflow-x: auto;
  border-radius: 0.5rem;
}

.ai-intent-card__markdown :deep(code.inline-code) {
  border-radius: 0.3rem;
  background: color-mix(in srgb, var(--text-h) 12%, transparent);
  padding: 0.08rem 0.3rem;
}

@media (min-width: 900px) {
  .ai-intent-card__content {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
