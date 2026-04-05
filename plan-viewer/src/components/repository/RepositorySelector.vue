<script setup lang="ts">
import { computed, watch } from 'vue'

import type { Repository } from '../../types'

const props = withDefaults(
  defineProps<{
    repositories: Repository[]
    modelValue: string
    disabled?: boolean
  }>(),
  {
    disabled: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  select: [value: string]
}>()

const inputValue = computed({
  get: () => props.modelValue,
  set: (value: string) => {
    emit('update:modelValue', value)
  },
})

const inputPlaceholder = computed(() =>
  props.repositories.length === 0 ? 'No repositories available' : 'Select repository',
)

const isDisabled = computed(() => props.disabled || props.repositories.length === 0)

const repositoryLabels = computed(() => {
  const labels = new Map<string, string>()
  props.repositories.forEach((repository) => {
    labels.set(repository.fullName, `${repository.name} (${repository.planCount})`)
  })
  return labels
})

const normalizeSelection = (value: string): string => {
  if (!value) {
    return ''
  }

  if (repositoryLabels.value.has(value)) {
    return value
  }

  const byName = props.repositories.find((entry) => entry.name === value)
  if (byName) {
    return byName.fullName
  }

  const byId = props.repositories.find((entry) => entry.id.toString() === value)
  if (byId) {
    return byId.fullName
  }

  return value
}

const emitSelection = (value: string): void => {
  const normalized = normalizeSelection(value)
  if (normalized !== value) {
    emit('update:modelValue', normalized)
  }
  emit('select', normalized)
}

watch(
  () => props.modelValue,
  (value) => {
    if (!value) {
      return
    }

    const normalized = normalizeSelection(value)
    if (normalized !== value) {
      emit('update:modelValue', normalized)
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="repository-selector">
    <label class="sr-only" for="repository-select">Repository</label>
    <input
      id="repository-select"
      v-model="inputValue"
      data-testid="repository-select"
      type="text"
      list="repository-select-options"
      class="repository-selector__input"
      :placeholder="inputPlaceholder"
      :disabled="isDisabled"
      autocomplete="off"
      @change="emitSelection(inputValue)"
      @keydown.enter.prevent="emitSelection(inputValue)"
    />

    <datalist id="repository-select-options">
      <option v-if="repositories.length === 0" value="">No repositories available</option>
      <option v-for="repository in repositories" :key="repository.id" :value="repository.fullName">
        {{ repository.name }} ({{ repository.planCount }})
      </option>
    </datalist>
  </div>
</template>

<style scoped>
.repository-selector {
  max-width: 18rem;
}

.repository-selector__input {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 0.45rem 0.6rem;
  background: var(--bg);
  color: var(--text-h);
}

</style>
