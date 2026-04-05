<script setup lang="ts">
import { computed } from 'vue'

export interface BaseInputProps {
  modelValue?: string | number
  type?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  error?: boolean
  size?: 'sm' | 'default' | 'lg'
  id?: string
  name?: string
  autocomplete?: string
}

const props = withDefaults(defineProps<BaseInputProps>(), {
  type: 'text',
  size: 'default',
  error: false,
  disabled: false,
  readonly: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
  enter: []
}>()

const inputClasses = computed(() => [
  'base-input',
  `base-input--${props.size}`,
  {
    'base-input--error': props.error,
    'base-input--disabled': props.disabled,
    'base-input--readonly': props.readonly,
  },
])

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    emit('enter')
  }
}
</script>

<template>
  <input
    :id="id"
    :name="name"
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    :autocomplete="autocomplete"
    :class="inputClasses"
    :aria-invalid="error ? 'true' : undefined"
    @input="handleInput"
    @blur="emit('blur', $event)"
    @focus="emit('focus', $event)"
    @keydown="handleKeydown"
  />
</template>

<style scoped>
.base-input {
  font-family: var(--font-primary);
  font-size: var(--text-body);
  line-height: var(--line-height-body);
  font-weight: var(--font-weight-regular);
  color: var(--color-text-primary);
  background: var(--color-white);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-default);
  transition:
    border-color calc(var(--transition-fast) * 1ms) var(--ease-out),
    box-shadow calc(var(--transition-fast) * 1ms) var(--ease-out);
  width: 100%;
}

/* Size Variants */
.base-input--sm {
  height: 32px;
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-body-small);
}

.base-input--default {
  height: 36px;
  padding: var(--space-2) var(--space-3);
}

.base-input--lg {
  height: 40px;
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-body-large);
}

/* Placeholder */
.base-input::placeholder {
  color: var(--color-gray-400);
}

/* Focus State */
.base-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

/* Error State */
.base-input--error {
  border-color: var(--color-error);
}

.base-input--error:focus {
  border-color: var(--color-error);
  box-shadow: 0 0 0 3px var(--color-error-light);
}

/* Disabled State */
.base-input:disabled,
.base-input--disabled {
  background: var(--color-gray-50);
  color: var(--color-gray-500);
  cursor: not-allowed;
  opacity: 0.6;
}

/* Readonly State */
.base-input--readonly {
  background: var(--color-gray-50);
  cursor: default;
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .base-input {
    transition: none;
  }
}
</style>
