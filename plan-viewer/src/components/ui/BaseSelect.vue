<script setup lang="ts">
import { ref, computed } from 'vue'

export interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
}

export interface BaseSelectProps {
  modelValue?: string | number
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  error?: boolean
  size?: 'sm' | 'default' | 'lg'
  id?: string
  name?: string
}

const props = withDefaults(defineProps<BaseSelectProps>(), {
  size: 'default',
  error: false,
  disabled: false,
  placeholder: 'Select an option',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const isOpen = ref(false)
const selectRef = ref<HTMLDivElement>()

const selectedOption = computed(() => {
  return props.options.find((opt) => opt.value === props.modelValue)
})

const selectClasses = computed(() => [
  'base-select',
  `base-select--${props.size}`,
  {
    'base-select--error': props.error,
    'base-select--disabled': props.disabled,
    'base-select--open': isOpen.value,
  },
])

const handleSelect = (value: string | number) => {
  emit('update:modelValue', value)
  isOpen.value = false
}

const toggleDropdown = () => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
  }
}

const handleClickOutside = (event: MouseEvent) => {
  if (selectRef.value && !selectRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    isOpen.value = false
  }
}

if (typeof window !== 'undefined') {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
}
</script>

<template>
  <div ref="selectRef" :class="selectClasses">
    <button
      :id="id"
      type="button"
      class="base-select__trigger"
      :disabled="disabled"
      :aria-expanded="isOpen"
      :aria-haspopup="true"
      @click="toggleDropdown"
    >
      <span class="base-select__value">
        {{ selectedOption?.label || placeholder }}
      </span>
      <span class="base-select__arrow" :class="{ 'base-select__arrow--up': isOpen }">▼</span>
    </button>

    <div v-if="isOpen" class="base-select__dropdown" role="listbox">
      <div
        v-for="option in options"
        :key="option.value"
        class="base-select__option"
        :class="{
          'base-select__option--selected': option.value === modelValue,
          'base-select__option--disabled': option.disabled,
        }"
        role="option"
        :aria-selected="option.value === modelValue"
        @click="!option.disabled && handleSelect(option.value)"
      >
        {{ option.label }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.base-select {
  position: relative;
  width: 100%;
}

.base-select__trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  font-family: var(--font-primary);
  font-size: var(--text-body);
  font-weight: var(--font-weight-regular);
  color: var(--color-text-primary);
  background: var(--color-white);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-default);
  cursor: pointer;
  transition:
    border-color calc(var(--transition-fast) * 1ms) var(--ease-out),
    box-shadow calc(var(--transition-fast) * 1ms) var(--ease-out);
  text-align: left;
}

.base-select--sm .base-select__trigger {
  height: 32px;
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-body-small);
}

.base-select--default .base-select__trigger {
  height: 36px;
  padding: var(--space-2) var(--space-3);
}

.base-select--lg .base-select__trigger {
  height: 40px;
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-body-large);
}

.base-select__trigger:hover:not(:disabled) {
  border-color: var(--color-gray-400);
}

.base-select__trigger:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.base-select__value {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.base-select__trigger:disabled .base-select__value {
  color: var(--color-gray-400);
}

.base-select__arrow {
  font-size: 10px;
  color: var(--color-gray-500);
  transition: transform calc(var(--transition-fast) * 1ms) var(--ease-out);
}

.base-select__arrow--up {
  transform: rotate(180deg);
}

.base-select__dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  max-height: 240px;
  overflow-y: auto;
  background: var(--color-white);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-dropdown);
  padding: var(--space-1) 0;
}

.base-select__option {
  height: 32px;
  padding: 0 var(--space-3);
  display: flex;
  align-items: center;
  font-size: var(--text-body-small);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: background-color calc(var(--transition-fast) * 1ms) var(--ease-out);
}

.base-select__option:hover:not(.base-select__option--disabled) {
  background: var(--color-gray-100);
}

.base-select__option--selected {
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
}

.base-select__option--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.base-select--error .base-select__trigger {
  border-color: var(--color-error);
}

.base-select--error .base-select__trigger:focus {
  border-color: var(--color-error);
  box-shadow: 0 0 0 3px var(--color-error-light);
}

.base-select--disabled .base-select__trigger {
  background: var(--color-gray-50);
  cursor: not-allowed;
  opacity: 0.6;
}

@media (prefers-reduced-motion: reduce) {
  .base-select__trigger,
  .base-select__arrow,
  .base-select__option {
    transition: none;
  }
}
</style>
