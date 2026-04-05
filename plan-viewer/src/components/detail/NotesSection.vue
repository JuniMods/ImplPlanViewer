<script setup lang="ts">
import { computed, onServerPrefetch, ref, watch } from 'vue'

import { useMarkdown } from '../../composables'

const props = withDefaults(
  defineProps<{
    notes?: string
  }>(),
  {
    notes: '',
  },
)

const { render } = useMarkdown()

const notesHtml = ref('')
const renderError = ref<Error | null>(null)
const isOpen = ref(false)

const normalizedNotes = computed(() => props.notes.trim())
const hasNotes = computed(() => normalizedNotes.value.length > 0)

const fallbackMessage = computed(() =>
  hasNotes.value ? normalizedNotes.value : 'No additional notes provided yet.',
)

const renderNotes = async (): Promise<void> => {
  notesHtml.value = ''
  renderError.value = null

  if (!hasNotes.value) {
    return
  }

  try {
    notesHtml.value = await render(normalizedNotes.value)
  } catch (error: unknown) {
    renderError.value = error instanceof Error ? error : new Error('Failed to render markdown')
  }
}

watch(normalizedNotes, () => {
  void renderNotes()
}, { immediate: true })

const onToggle = (event: Event): void => {
  const details = event.currentTarget
  if (details instanceof HTMLDetailsElement) {
    isOpen.value = details.open
  }
}

onServerPrefetch(renderNotes)
</script>

<template>
  <section class="notes-section" data-testid="notes-section">
    <details class="notes-section__panel" :open="isOpen" @toggle="onToggle">
      <summary class="notes-section__summary" data-testid="notes-section-summary">Notes</summary>

      <!-- eslint-disable vue/no-v-html -->
      <div
        v-if="notesHtml && !renderError"
        class="notes-section__content notes-section__markdown"
        data-testid="notes-section-content"
        v-html="notesHtml"
      />
      <!-- eslint-enable vue/no-v-html -->
      <p v-else class="notes-section__content notes-section__fallback" data-testid="notes-section-fallback">
        {{ fallbackMessage }}
      </p>
    </details>
  </section>
</template>

<style scoped>
.notes-section {
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  background: var(--bg);
}

.notes-section__panel {
  padding: 0.8rem 0.9rem;
}

.notes-section__summary {
  list-style: none;
  cursor: pointer;
  color: var(--text-h);
  font-size: 1.1rem;
  font-weight: 600;
}

.notes-section__summary::-webkit-details-marker {
  display: none;
}

.notes-section__content {
  margin: 0.85rem 0 0;
  border: 1px solid color-mix(in srgb, var(--accent) 12%, var(--border));
  background: color-mix(in srgb, var(--accent) 5%, var(--bg));
  border-radius: 0.6rem;
  padding: 0.85rem;
}

.notes-section__fallback {
  color: var(--text-m, var(--text));
}

.notes-section__markdown :deep(p:first-child) {
  margin-top: 0;
}

.notes-section__markdown :deep(p:last-child) {
  margin-bottom: 0;
}

.notes-section__markdown :deep(a) {
  color: var(--accent);
}

.notes-section__markdown :deep(pre) {
  overflow-x: auto;
  border-radius: 0.5rem;
}

.notes-section__markdown :deep(code.inline-code) {
  border-radius: 0.3rem;
  background: color-mix(in srgb, var(--text-h) 12%, transparent);
  padding: 0.08rem 0.3rem;
}
</style>
