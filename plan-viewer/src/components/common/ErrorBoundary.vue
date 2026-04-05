<script setup lang="ts">
import { computed, onErrorCaptured, ref, type PropType } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Something went wrong',
  },
  description: {
    type: String,
    default: 'An unexpected error occurred while rendering this section.',
  },
  resetLabel: {
    type: String,
    default: 'Try again',
  },
  error: {
    type: null as unknown as PropType<unknown | null>,
    default: null,
  },
})

const emit = defineEmits<{
  (event: 'error', error: unknown): void
  (event: 'reset'): void
}>()

const capturedError = ref<unknown>(null)
const activeError = computed(() => props.error ?? capturedError.value)
const hasError = computed(() => activeError.value != null)
const errorDetails = computed(() => {
  const currentError = activeError.value

  if (currentError instanceof Error) {
    return currentError.message
  }

  if (typeof currentError === 'string' && currentError.trim()) {
    return currentError
  }

  return null
})

const reset = () => {
  capturedError.value = null
  emit('reset')
}

onErrorCaptured((error) => {
  capturedError.value = error
  emit('error', error)
  return false
})
</script>

<template>
  <section class="error-boundary" data-testid="error-boundary">
    <div v-if="hasError" class="error-boundary__fallback" data-testid="error-boundary-fallback" role="alert">
      <slot name="fallback" :error="activeError" :reset="reset">
        <h2 class="error-boundary__title">{{ title }}</h2>
        <p class="error-boundary__description">{{ description }}</p>
        <p v-if="errorDetails" class="error-boundary__details">{{ errorDetails }}</p>
        <button class="error-boundary__reset" type="button" @click="reset">{{ resetLabel }}</button>
      </slot>
    </div>

    <div v-else class="error-boundary__content" data-testid="error-boundary-content">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.error-boundary {
  min-height: 100%;
}

.error-boundary__content {
  min-height: 100%;
}

.error-boundary__fallback {
  display: grid;
  justify-items: center;
  gap: var(--space-3);
  border: 1px solid var(--color-error-light);
  border-radius: var(--radius-md);
  padding: var(--space-6) var(--space-4);
  margin: var(--space-4);
  text-align: center;
  background: var(--color-error-light);
  color: var(--color-error);
}

.error-boundary__title {
  margin: 0;
  font-size: var(--text-h3);
  font-weight: var(--font-weight-semibold);
  color: var(--color-error);
}

.error-boundary__description {
  margin: 0;
  color: var(--color-gray-700);
  font-size: var(--text-body);
}

.error-boundary__details {
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--text-body-small);
  color: var(--color-error);
  background: var(--color-white);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  max-width: 100%;
  overflow-x: auto;
}

.error-boundary__reset {
  border: 1px solid var(--color-error);
  background: var(--color-white);
  color: var(--color-error);
  border-radius: var(--radius-default);
  padding: var(--space-2) var(--space-4);
  font: inherit;
  font-size: var(--text-body-small);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition:
    background-color calc(var(--transition-fast) * 1ms) var(--ease-out),
    border-color calc(var(--transition-fast) * 1ms) var(--ease-out);
}

.error-boundary__reset:hover {
  background: var(--color-error);
  color: var(--color-white);
}

.error-boundary__reset:focus-visible {
  outline: 2px solid var(--color-error);
  outline-offset: 2px;
}
</style>
