<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const detailMessage = computed(() => {
  const message = route.query.message
  return typeof message === 'string' && message.trim().length > 0 ? message.trim() : null
})
</script>

<template>
  <section class="error-view" data-testid="error-view">
    <h1 class="error-view__title">Something went wrong</h1>
    <p class="error-view__copy">
      The viewer could not load required data or encountered an unexpected application error.
    </p>
    <p v-if="detailMessage" class="error-view__details" data-testid="error-view-details">{{ detailMessage }}</p>
    <a href="/" class="error-view__link" data-testid="error-view-home-link">← Back to plans</a>
  </section>
</template>

<style scoped>
.error-view {
  padding: 1rem;
  display: grid;
  gap: 0.55rem;
  border: 1px solid color-mix(in srgb, #ef4444 45%, var(--border));
  border-radius: 0.75rem;
  background: color-mix(in srgb, #ef4444 6%, transparent);
}

.error-view__title {
  margin: 0;
  font-size: 1.3rem;
}

.error-view__copy {
  margin: 0;
  color: var(--text-m, var(--text));
}

.error-view__details {
  margin: 0;
  border-left: 3px solid color-mix(in srgb, #ef4444 68%, var(--accent-border));
  padding-left: 0.6rem;
  font-family: var(--mono, ui-monospace, monospace);
  font-size: 0.85rem;
}

.error-view__link {
  color: var(--accent);
  text-decoration: none;
}
</style>
