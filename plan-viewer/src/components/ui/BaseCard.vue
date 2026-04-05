<script setup lang="ts">
import { computed } from 'vue'

export interface BaseCardProps {
  variant?: 'standard' | 'elevated' | 'outlined' | 'interactive'
  padding?: 'compact' | 'default' | 'spacious'
  noPadding?: boolean
}

const props = withDefaults(defineProps<BaseCardProps>(), {
  variant: 'standard',
  padding: 'default',
  noPadding: false,
})

const cardClasses = computed(() => [
  'base-card',
  `base-card--${props.variant}`,
  {
    [`base-card--padding-${props.padding}`]: !props.noPadding,
    'base-card--no-padding': props.noPadding,
  },
])
</script>

<template>
  <div :class="cardClasses">
    <slot />
  </div>
</template>

<style scoped>
.base-card {
  background: var(--color-white);
  border-radius: var(--radius-md);
  transition:
    box-shadow calc(var(--transition-normal) * 1ms) var(--ease-out),
    transform calc(var(--transition-normal) * 1ms) var(--ease-out);
}

/* Padding Variants */
.base-card--padding-compact {
  padding: var(--card-padding-compact);
}

.base-card--padding-default {
  padding: var(--card-padding-default);
}

.base-card--padding-spacious {
  padding: var(--card-padding-spacious);
}

.base-card--no-padding {
  padding: 0;
}

/* Standard Variant */
.base-card--standard {
  border: 1px solid var(--color-gray-200);
  box-shadow: var(--shadow-sm);
}

/* Elevated Variant */
.base-card--elevated {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: none;
}

/* Outlined Variant */
.base-card--outlined {
  border: 1px solid var(--color-gray-200);
  box-shadow: none;
}

/* Interactive Variant */
.base-card--interactive {
  border: 1px solid var(--color-gray-200);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
}

.base-card--interactive:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.base-card--interactive:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .base-card {
    transition: none;
  }

  .base-card--interactive:hover {
    transform: none;
  }
}
</style>
