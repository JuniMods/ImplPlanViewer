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
  gap: 0.6rem;
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 1.5rem 1rem;
  margin: 1rem;
  text-align: center;
  background: var(--code-bg);
}

.error-boundary__title {
  margin: 0;
  font-size: 1.1rem;
}

.error-boundary__description {
  color: var(--text);
}

.error-boundary__details {
  font-family: var(--mono);
  font-size: 0.8rem;
  color: var(--text-h);
}

.error-boundary__reset {
  border: 1px solid var(--accent-border);
  background: var(--accent-bg);
  color: var(--accent);
  border-radius: 0.5rem;
  padding: 0.45rem 0.8rem;
  font: inherit;
  cursor: pointer;
}

.error-boundary__reset:hover {
  border-color: var(--accent);
}
</style>
