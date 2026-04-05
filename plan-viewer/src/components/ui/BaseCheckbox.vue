<script setup lang="ts">
export interface BaseCheckboxProps {
  modelValue?: boolean
  disabled?: boolean
  id?: string
  name?: string
  label?: string
}

const props = withDefaults(defineProps<BaseCheckboxProps>(), {
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.checked)
}
</script>

<template>
  <div class="base-checkbox">
    <input
      :id="id"
      :name="name"
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      class="base-checkbox__input"
      @change="handleChange"
    />
    <label v-if="label || $slots.default" :for="id" class="base-checkbox__label">
      <slot>{{ label }}</slot>
    </label>
  </div>
</template>

<style scoped>
.base-checkbox {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
}

.base-checkbox__input {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  width: 16px;
  height: 16px;
  border: 1.5px solid var(--color-gray-400);
  border-radius: var(--radius-sm);
  background: var(--color-white);
  cursor: pointer;
  position: relative;
  transition:
    background-color calc(var(--transition-fast) * 1ms) var(--ease-out),
    border-color calc(var(--transition-fast) * 1ms) var(--ease-out);
  flex-shrink: 0;
}

.base-checkbox__input:hover:not(:disabled) {
  border-color: var(--color-primary);
}

.base-checkbox__input:checked {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.base-checkbox__input:checked::after {
  content: '';
  position: absolute;
  left: 4px;
  top: 1px;
  width: 4px;
  height: 8px;
  border: solid var(--color-white);
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.base-checkbox__input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.base-checkbox__input:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.base-checkbox__label {
  font-size: var(--text-body);
  line-height: var(--line-height-body);
  color: var(--color-text-primary);
  cursor: pointer;
  user-select: none;
}

.base-checkbox:has(.base-checkbox__input:disabled) {
  cursor: not-allowed;
}

.base-checkbox:has(.base-checkbox__input:disabled) .base-checkbox__label {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .base-checkbox__input {
    transition: none;
  }
}
</style>
