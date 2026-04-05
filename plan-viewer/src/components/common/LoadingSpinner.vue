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
  gap: var(--space-3);
  color: var(--color-text-primary);
  padding: var(--space-6);
}

.loading-spinner__indicator {
  width: 24px;
  height: 24px;
  border: 2px solid var(--color-gray-200);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: loading-spinner-rotate 0.75s linear infinite;
}

.loading-spinner__skeleton {
  display: grid;
  gap: var(--space-2);
  width: min(100%, 384px);
}

.loading-spinner__skeleton-line {
  height: 14px;
  width: var(--line-width);
  border-radius: var(--radius-sm);
  background: var(--color-gray-100);
  animation: loading-spinner-shimmer 1.2s ease-in-out infinite;
}

.loading-spinner__label {
  margin: 0;
  font-size: var(--text-body);
  color: var(--color-text-secondary);
}

@keyframes loading-spinner-rotate {
  to {
    transform: rotate(360deg);
  }
}

@keyframes loading-spinner-shimmer {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@media (prefers-reduced-motion: reduce) {
  .loading-spinner__indicator {
    animation: none;
    border-top-color: var(--color-primary);
  }

  .loading-spinner__skeleton-line {
    animation: none;
  }
}
</style>
