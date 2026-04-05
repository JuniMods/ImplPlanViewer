<script setup lang="ts">
import { computed } from 'vue'

export interface BaseButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'xs' | 'sm' | 'default' | 'lg'
  disabled?: boolean
  loading?: boolean
  icon?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<BaseButtonProps>(), {
  variant: 'primary',
  size: 'default',
  disabled: false,
  loading: false,
  icon: false,
  type: 'button',
})

const buttonClasses = computed(() => [
  'base-button',
  `base-button--${props.variant}`,
  `base-button--${props.size}`,
  {
    'base-button--icon': props.icon,
    'base-button--loading': props.loading,
    'base-button--disabled': props.disabled,
  },
])
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    :aria-busy="loading"
  >
    <span v-if="loading" class="base-button__spinner" aria-hidden="true"></span>
    <span :class="{ 'base-button__content--hidden': loading }">
      <slot />
    </span>
  </button>
</template>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-family: var(--font-primary);
  font-weight: var(--font-weight-medium);
  border: none;
  cursor: pointer;
  transition:
    background-color calc(var(--transition-fast) * 1ms) var(--ease-out),
    border-color calc(var(--transition-fast) * 1ms) var(--ease-out),
    box-shadow calc(var(--transition-fast) * 1ms) var(--ease-out),
    transform calc(var(--transition-fast) * 1ms) var(--ease-out);
  position: relative;
  user-select: none;
}

/* Size Variants */
.base-button--xs {
  height: 24px;
  min-width: 48px;
  font-size: var(--text-overline);
  border-radius: var(--radius-sm);
  padding: var(--button-padding-xs);
}

.base-button--sm {
  height: 28px;
  min-width: 64px;
  font-size: var(--text-caption);
  border-radius: var(--radius-default);
  padding: var(--button-padding-sm);
}

.base-button--default {
  height: 32px;
  min-width: 80px;
  font-size: var(--text-body-small);
  border-radius: var(--radius-default);
  padding: var(--button-padding-default);
}

.base-button--lg {
  height: 40px;
  min-width: 96px;
  font-size: var(--text-body);
  border-radius: var(--radius-md);
  padding: var(--button-padding-lg);
}

/* Icon Button Overrides */
.base-button--icon.base-button--xs {
  width: 24px;
  height: 24px;
  min-width: 24px;
  padding: 0;
}

.base-button--icon.base-button--default {
  width: 32px;
  height: 32px;
  min-width: 32px;
  padding: 0;
}

.base-button--icon.base-button--lg {
  width: 40px;
  height: 40px;
  min-width: 40px;
  padding: 0;
}

/* Primary Variant */
.base-button--primary {
  background: var(--color-primary);
  color: var(--color-white);
}

.base-button--primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.base-button--primary:active:not(:disabled) {
  background: var(--color-primary-active);
}

/* Secondary Variant */
.base-button--secondary {
  background: var(--color-white);
  color: var(--color-gray-700);
  border: 1px solid var(--color-gray-300);
}

.base-button--secondary:hover:not(:disabled) {
  background: var(--color-gray-50);
}

.base-button--secondary:active:not(:disabled) {
  background: var(--color-gray-100);
}

/* Ghost Variant */
.base-button--ghost {
  background: transparent;
  color: var(--color-gray-700);
}

.base-button--ghost:hover:not(:disabled) {
  background: var(--color-gray-100);
}

.base-button--ghost:active:not(:disabled) {
  background: var(--color-gray-200);
}

/* Danger Variant */
.base-button--danger {
  background: var(--color-error);
  color: var(--color-white);
}

.base-button--danger:hover:not(:disabled) {
  background: #b91c1c;
}

.base-button--danger:active:not(:disabled) {
  background: #991b1b;
}

/* Disabled State */
.base-button:disabled,
.base-button--disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.base-button--primary:disabled,
.base-button--danger:disabled {
  background: var(--color-gray-300);
  color: var(--color-gray-500);
}

/* Loading State */
.base-button--loading {
  cursor: wait;
}

.base-button__spinner {
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.base-button__content--hidden {
  visibility: hidden;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Focus State */
.base-button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .base-button {
    transition: none;
  }

  .base-button__spinner {
    animation: none;
  }
}
</style>
