<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { useSearch } from '../../composables'
import { useFiltersStore, usePlansStore } from '../../stores'
import type { PlanMetadata } from '../../types'

const emit = defineEmits<{
  'update:query': [query: string]
}>()

const plansStore = usePlansStore()
const filtersStore = useFiltersStore()
const { query, searchQuery, clearQuery, flush } = useSearch({ debounceMs: 300 })
const searchInput = ref<HTMLInputElement | null>(null)

const filteredResultCount = computed(() =>
  plansStore.currentPlans.filter((plan: PlanMetadata) => filtersStore.filterFunction(plan)).length,
)

const resultLabel = computed(() => `${filteredResultCount.value} result${filteredResultCount.value === 1 ? '' : 's'}`)

const focusSearchInput = (): void => {
  searchInput.value?.focus()
  searchInput.value?.select()
}

const clearSearch = (): void => {
  clearQuery()
  focusSearchInput()
}

const shouldIgnoreShortcutTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  if (target.isContentEditable) {
    return true
  }

  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

const onGlobalKeydown = (event: KeyboardEvent): void => {
  if (event.defaultPrevented || event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) {
    return
  }

  if (shouldIgnoreShortcutTarget(event.target)) {
    return
  }

  event.preventDefault()
  focusSearchInput()
}

watch(
  searchQuery,
  (nextQuery) => {
    emit('update:query', nextQuery)
  },
  { immediate: true },
)

onMounted(() => {
  window.addEventListener('keydown', onGlobalKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onGlobalKeydown)
})
</script>

<template>
  <section class="plan-search" data-testid="plan-search">
    <div class="plan-search__input-wrapper">
      <span class="plan-search__icon" aria-hidden="true">🔍</span>
      <label class="sr-only" for="plan-search-input">Search plans</label>
      <input
        id="plan-search-input"
        ref="searchInput"
        v-model="query"
        type="search"
        class="plan-search__input"
        data-testid="plan-search-input"
        placeholder="Search title, objective, scope, or change areas"
        autocomplete="off"
        @keydown.enter="flush"
      />
      <button
        v-if="query"
        type="button"
        class="plan-search__clear"
        data-testid="plan-search-clear"
        aria-label="Clear search"
        @click="clearSearch"
      >
        Clear
      </button>
    </div>

    <div class="plan-search__meta">
      <span class="plan-search__count" data-testid="plan-search-count" aria-live="polite">{{ resultLabel }}</span>
      <kbd class="plan-search__shortcut" aria-label="Keyboard shortcut">/</kbd>
    </div>
  </section>
</template>

<style scoped>
.plan-search {
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 0.85rem 1rem;
  background: color-mix(in srgb, var(--bg) 96%, var(--border));
  display: grid;
  gap: 0.55rem;
}

.plan-search__input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.plan-search__icon {
  font-size: 0.95rem;
  opacity: 0.8;
}

.plan-search__input {
  flex: 1;
  min-width: 0;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 0.45rem 0.55rem;
  background: var(--bg);
  color: var(--text-h);
}

.plan-search__clear {
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 0.35rem 0.6rem;
  font-size: 0.8rem;
  background: var(--bg);
  color: var(--text-h);
  cursor: pointer;
}

.plan-search__meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.plan-search__count {
  font-size: 0.85rem;
  color: var(--text-m, var(--text));
}

.plan-search__shortcut {
  border: 1px solid var(--border);
  border-radius: 0.4rem;
  padding: 0.15rem 0.4rem;
  font-size: 0.75rem;
  color: var(--text-h);
  background: var(--bg);
}
</style>
