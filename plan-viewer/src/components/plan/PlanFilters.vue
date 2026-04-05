<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useFilter } from '../../composables'
import { usePlansStore } from '../../stores'
import { PlanType, Priority, isFilterState, type FilterState, type PlanType as PlanTypeValue, type Priority as PriorityValue } from '../../types'

const SESSION_STORAGE_KEY = 'impl-plan-viewer-filters'

const emit = defineEmits<{
  'update:filters': [filters: FilterState]
}>()

const plansStore = usePlansStore()

const filters = (() => {
  if (typeof window === 'undefined') {
    return useFilter({ syncWithUrl: false })
  }

  try {
    const route = useRoute()
    const router = useRouter()

    return useFilter({
      routeQuery: computed(() => route.query),
      replaceRouteQuery: (query) =>
        router.replace({ query }).then(() => undefined),
    })
  } catch {
    return useFilter({ syncWithUrl: false })
  }
})()

const typeOptions = Object.values(PlanType) as PlanTypeValue[]
const priorityOptions = Object.values(Priority) as PriorityValue[]
const scopeInput = ref('')

const canUseSessionStorage = (): boolean =>
  typeof window !== 'undefined' && 'sessionStorage' in window

const availableScopes = computed(() => {
  const scopeValues = new Set<string>()

  Object.values(plansStore.byRepository).forEach((plans) => {
    plans.forEach((plan) => {
      const normalized = plan.scope.trim()
      if (normalized) {
        scopeValues.add(normalized)
      }
    })
  })

  filters.scopes.value.forEach((scope) => {
    const normalized = scope.trim()
    if (normalized) {
      scopeValues.add(normalized)
    }
  })

  return [...scopeValues].sort((left, right) => left.localeCompare(right))
})

const normalizeScope = (value: string): string => value.trim()

const hasScope = (value: string): boolean =>
  filters.scopes.value.some((scope) => scope.toLowerCase() === value.toLowerCase())

const addScope = (value: string): void => {
  const normalized = normalizeScope(value)
  if (!normalized || hasScope(normalized)) {
    return
  }

  filters.setScopes([...filters.scopes.value, normalized])
  scopeInput.value = ''
}

const removeScope = (value: string): void => {
  filters.setScopes(filters.scopes.value.filter((scope) => scope !== value))
}

const toggleType = (value: PlanTypeValue): void => {
  const nextTypes = filters.types.value.includes(value)
    ? filters.types.value.filter((type) => type !== value)
    : [...filters.types.value, value]

  filters.setTypes(nextTypes)
}

const togglePriority = (value: PriorityValue): void => {
  const nextPriorities = filters.priorities.value.includes(value)
    ? filters.priorities.value.filter((priority) => priority !== value)
    : [...filters.priorities.value, value]

  filters.setPriorities(nextPriorities)
}

const updateCompletionMin = (event: Event): void => {
  const value = Number.parseInt((event.target as HTMLInputElement).value, 10)
  filters.setCompletionRange(Number.isFinite(value) ? value : 0, filters.completionMax.value)
}

const updateCompletionMax = (event: Event): void => {
  const value = Number.parseInt((event.target as HTMLInputElement).value, 10)
  filters.setCompletionRange(filters.completionMin.value, Number.isFinite(value) ? value : 100)
}

const currentFilters = computed<FilterState>(() => ({
  types: [...filters.types.value],
  priorities: [...filters.priorities.value],
  scopes: [...filters.scopes.value],
  completionMin: filters.completionMin.value,
  completionMax: filters.completionMax.value,
  searchQuery: filters.searchQuery.value,
}))

const saveToSessionStorage = (nextFilters: FilterState): void => {
  if (!canUseSessionStorage()) {
    return
  }

  try {
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextFilters))
  } catch {
    // Ignore storage access errors and keep filters in memory.
  }
}

const loadFromSessionStorage = (): void => {
  if (!canUseSessionStorage()) {
    return
  }

  if (filters.toUrlQuery().toString().length > 0) {
    return
  }

  try {
    const persisted = window.sessionStorage.getItem(SESSION_STORAGE_KEY)
    if (!persisted) {
      return
    }

    const parsed = JSON.parse(persisted) as unknown
    if (isFilterState(parsed)) {
      filters.applyFilters(parsed)
    }
  } catch {
    // Ignore storage access errors and keep default filters.
  }
}

watch(
  currentFilters,
  (nextFilters) => {
    emit('update:filters', nextFilters)
    saveToSessionStorage(nextFilters)
  },
  { deep: true, immediate: true },
)

onMounted(() => {
  loadFromSessionStorage()
})
</script>

<template>
  <section class="plan-filters" data-testid="plan-filters">
    <header class="plan-filters__header">
      <h3 class="plan-filters__title">Filters</h3>
      <span class="plan-filters__count" data-testid="plan-filters-count">{{ filters.activeFilterCount.value }}</span>
    </header>

    <div class="plan-filters__group" data-testid="plan-filters-types">
      <p class="plan-filters__label">Type</p>
      <div class="plan-filters__chips">
        <button
          v-for="type in typeOptions"
          :key="type"
          type="button"
          class="plan-filters__chip"
          :class="{ 'plan-filters__chip--active': filters.types.value.includes(type) }"
          :aria-pressed="filters.types.value.includes(type)"
          @click="toggleType(type)"
        >
          {{ type }}
        </button>
      </div>
    </div>

    <div class="plan-filters__group" data-testid="plan-filters-priorities">
      <p class="plan-filters__label">Priority</p>
      <div class="plan-filters__chips">
        <button
          v-for="priority in priorityOptions"
          :key="priority"
          type="button"
          class="plan-filters__chip"
          :class="{ 'plan-filters__chip--active': filters.priorities.value.includes(priority) }"
          :aria-pressed="filters.priorities.value.includes(priority)"
          @click="togglePriority(priority)"
        >
          {{ priority }}
        </button>
      </div>
    </div>

    <div class="plan-filters__group" data-testid="plan-filters-scopes">
      <label class="plan-filters__label" for="plan-filters-scope-input">Scope</label>
      <div class="plan-filters__scope-input-row">
        <input
          id="plan-filters-scope-input"
          v-model="scopeInput"
          type="text"
          list="plan-filters-scope-options"
          class="plan-filters__input"
          placeholder="Add scope"
          autocomplete="off"
          @keydown.enter.prevent="addScope(scopeInput)"
        />
        <button type="button" class="plan-filters__action" :disabled="!scopeInput.trim()" @click="addScope(scopeInput)">
          Add
        </button>
      </div>
      <datalist id="plan-filters-scope-options">
        <option v-for="scope in availableScopes" :key="scope" :value="scope" />
      </datalist>
      <div class="plan-filters__chips">
        <button
          v-for="scope in filters.scopes.value"
          :key="scope"
          type="button"
          class="plan-filters__chip plan-filters__chip--active"
          @click="removeScope(scope)"
        >
          {{ scope }} ×
        </button>
      </div>
    </div>

    <div class="plan-filters__group" data-testid="plan-filters-completion">
      <p class="plan-filters__label">Completion</p>
      <div class="plan-filters__range-row">
        <label class="plan-filters__range-label" for="plan-filters-completion-min">
          Min {{ filters.completionMin.value }}%
        </label>
        <input
          id="plan-filters-completion-min"
          type="range"
          min="0"
          max="100"
          :value="filters.completionMin.value"
          @input="updateCompletionMin"
        />
      </div>
      <div class="plan-filters__range-row">
        <label class="plan-filters__range-label" for="plan-filters-completion-max">
          Max {{ filters.completionMax.value }}%
        </label>
        <input
          id="plan-filters-completion-max"
          type="range"
          min="0"
          max="100"
          :value="filters.completionMax.value"
          @input="updateCompletionMax"
        />
      </div>
    </div>

    <div class="plan-filters__actions">
      <button
        type="button"
        class="plan-filters__action plan-filters__action--clear"
        :disabled="!filters.hasActiveFilters.value"
        @click="filters.clearFilters()"
      >
        Clear filters
      </button>
    </div>
  </section>
</template>

<style scoped>
.plan-filters {
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 1rem;
  background: color-mix(in srgb, var(--bg) 96%, var(--border));
  display: grid;
  gap: 1rem;
}

.plan-filters__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.plan-filters__title {
  margin: 0;
  font-size: 1rem;
  color: var(--text-h);
}

.plan-filters__count {
  min-width: 1.75rem;
  height: 1.75rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
  background: color-mix(in srgb, var(--accent) 25%, transparent);
  color: var(--text-h);
}

.plan-filters__group {
  display: grid;
  gap: 0.5rem;
}

.plan-filters__label {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-h);
}

.plan-filters__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.plan-filters__chip {
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--bg);
  color: var(--text);
  padding: 0.25rem 0.6rem;
  font-size: 0.8rem;
  cursor: pointer;
}

.plan-filters__chip--active {
  border-color: var(--accent);
  color: var(--text-h);
  background: color-mix(in srgb, var(--accent) 15%, transparent);
}

.plan-filters__scope-input-row {
  display: flex;
  gap: 0.5rem;
}

.plan-filters__input {
  flex: 1;
  min-width: 0;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 0.4rem 0.55rem;
  background: var(--bg);
  color: var(--text-h);
}

.plan-filters__range-row {
  display: grid;
  gap: 0.25rem;
}

.plan-filters__range-label {
  font-size: 0.8rem;
  color: var(--text-m, var(--text));
}

.plan-filters__actions {
  display: flex;
  justify-content: flex-end;
}

.plan-filters__action {
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 0.35rem 0.7rem;
  font-size: 0.8rem;
  background: var(--bg);
  color: var(--text-h);
  cursor: pointer;
}

.plan-filters__action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.plan-filters__action--clear {
  border-color: color-mix(in srgb, #ef4444 40%, var(--border));
}
</style>
