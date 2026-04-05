<script setup lang="ts">
import { computed } from 'vue'

type LoadingVariant = 'spinner' | 'skeleton'

interface LoadingSpinnerProps {
  variant?: LoadingVariant
  label?: string
  showLabel?: boolean
  skeletonLines?: number
}

const props = withDefaults(defineProps<LoadingSpinnerProps>(), {
  variant: 'spinner',
  label: 'Loading…',
  showLabel: true,
  skeletonLines: 3,
})

const normalizedSkeletonLines = computed(() =>
  Math.max(1, Math.floor(Number.isFinite(props.skeletonLines) ? props.skeletonLines : 1)),
)
</script>

<template>
  <section
    class="loading-spinner"
    data-testid="loading-spinner"
    role="status"
    aria-live="polite"
    :aria-label="label"
  >
    <div v-if="variant === 'spinner'" class="loading-spinner__indicator" aria-hidden="true" />

    <div v-else class="loading-spinner__skeleton" data-testid="loading-skeleton" aria-hidden="true">
      <span
        v-for="line in normalizedSkeletonLines"
        :key="line"
        class="loading-spinner__skeleton-line"
        :style="{ '--line-width': `${Math.max(30, 92 - line * 12)}%` }"
      />
    </div>

    <p v-if="showLabel" class="loading-spinner__label">{{ label }}</p>
  </section>
</template>

<style scoped>
.loading-spinner {
  display: grid;
  justify-items: center;
  gap: 0.75rem;
  color: var(--text-h);
}

.loading-spinner__indicator {
  width: 2rem;
  height: 2rem;
  border: 0.22rem solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: loading-spinner-rotate 0.8s linear infinite;
}

.loading-spinner__skeleton {
  display: grid;
  gap: 0.45rem;
  width: min(100%, 24rem);
}

.loading-spinner__skeleton-line {
  height: 0.85rem;
  width: var(--line-width);
  border-radius: 999px;
  background: linear-gradient(90deg, var(--code-bg) 25%, var(--border) 37%, var(--code-bg) 63%);
  background-size: 400% 100%;
  animation: loading-spinner-shimmer 1.2s ease-in-out infinite;
}

.loading-spinner__label {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text);
}

@keyframes loading-spinner-rotate {
  to {
    transform: rotate(360deg);
  }
}

@keyframes loading-spinner-shimmer {
  0% {
    background-position: 100% 0;
  }

  100% {
    background-position: 0 0;
  }
}
</style>
