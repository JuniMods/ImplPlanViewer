<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import ErrorBoundary from '../components/common/ErrorBoundary.vue'
import { PlanFilters, PlanGrid, PlanSearch } from '../components/plan'
import { RepositoryCard, RepositorySelector, RepositoryStats } from '../components/repository'
import { useFiltersStore, usePlansStore, useRepositoriesStore } from '../stores'
import type { PlanMetadata, Repository } from '../types'

const route = useRoute()
const repositoriesStore = useRepositoriesStore()
const plansStore = usePlansStore()
const filtersStore = useFiltersStore()

const { sortedByPlanCount, current: currentRepository, error: repositoriesError } = storeToRefs(repositoriesStore)
const { currentPlans, loading: plansLoading, error: plansError } = storeToRefs(plansStore)
const { hasActiveFilters, searchQuery } = storeToRefs(filtersStore)

const selectedRepository = ref(currentRepository.value?.fullName ?? '')
const selectionError = ref<string | null>(null)

const normalizeString = (value: unknown): string =>
  typeof value === 'string' || typeof value === 'number' ? String(value).trim() : ''

const resolveRepository = (value: string): Repository | null => {
  const normalized = value.trim()
  if (!normalized) {
    return null
  }

  return (
    repositoriesStore.all.find((repository) => repository.fullName === normalized) ??
    repositoriesStore.all.find((repository) => repository.id.toString() === normalized) ??
    repositoriesStore.all.find((repository) => repository.name === normalized) ??
    null
  )
}

const selectRepository = (value: string): void => {
  const repository = resolveRepository(value)

  if (!repository) {
    selectionError.value = value.trim().length > 0 ? `Repository "${value}" not found.` : null
    return
  }

  selectionError.value = null
  selectedRepository.value = repository.fullName
  repositoriesStore.selectRepository(repository.id)
  plansStore.selectRepository(repository.fullName)
}

const extractSearchableText = (plan: PlanMetadata): string[] => {
  const record = plan as unknown as Record<string, unknown>
  return [
    plan.type,
    plan.priority,
    plan.scope,
    normalizeString(record.title),
    normalizeString(record.objective),
    normalizeString(record.summary),
    normalizeString(record.description),
    normalizeString(record.repositoryName),
  ].filter((value) => value.length > 0)
}

const normalizedSearchQuery = computed(() => searchQuery.value.trim().toLowerCase())

const filteredPlans = computed(() =>
  currentPlans.value.filter((plan) => {
    if (!filtersStore.filterFunction(plan)) {
      return false
    }

    if (!normalizedSearchQuery.value) {
      return true
    }

    const searchableContent = extractSearchableText(plan).join(' ').toLowerCase()
    return searchableContent.includes(normalizedSearchQuery.value)
  }),
)

const isLoading = computed(() => repositoriesStore.loading || plansLoading.value)

const combinedError = computed(() =>
  [selectionError.value, repositoriesError.value, plansError.value].filter((entry): entry is string => Boolean(entry)).join(' '),
)

const emptyMessage = computed(() =>
  currentRepository.value === null
    ? 'Select a repository to view implementation plans.'
    : 'No plans match the current repository and filters.',
)

watch(
  currentRepository,
  (repository) => {
    selectedRepository.value = repository?.fullName ?? ''
    if (repository && plansStore.currentRepository !== repository.fullName) {
      plansStore.selectRepository(repository.fullName)
    }
  },
  { immediate: true },
)

watch(
  () => route.params.repoId,
  (repoId) => {
    if (typeof repoId !== 'string' || repoId.trim().length === 0) {
      return
    }

    const repository = resolveRepository(repoId)
    if (repository) {
      selectRepository(repository.fullName)
    }
  },
  { immediate: true },
)
</script>

<template>
  <section id="plans" class="home-view" data-testid="home-view">
    <header class="home-view__header">
      <div>
        <h1 class="home-view__title">Plans Overview</h1>
        <p class="home-view__subtitle">Browse implementation plans by repository, filters, and search.</p>
      </div>
      <div class="home-view__header-controls">
        <RepositorySelector
          v-model="selectedRepository"
          :repositories="sortedByPlanCount"
          :disabled="isLoading"
          @select="selectRepository"
        />
        <RepositoryStats :repository="currentRepository" />
      </div>
    </header>

    <ErrorBoundary
      title="Unable to render plans"
      description="A section of the plans overview failed to render."
      reset-label="Reload section"
    >
      <RepositoryCard :repository="currentRepository" compact />
      <PlanSearch />

      <p v-if="combinedError" class="home-view__error" data-testid="home-view-error">{{ combinedError }}</p>
      <p v-if="isLoading" class="home-view__loading" data-testid="home-view-loading">Loading plans…</p>

      <div class="home-view__content">
        <aside class="home-view__filters">
          <PlanFilters />
        </aside>
        <div class="home-view__results">
          <PlanGrid
            :plans="filteredPlans"
            :empty-message="emptyMessage"
            :show-clear-filters="hasActiveFilters"
            @clear-filters="filtersStore.clearFilters()"
          />
        </div>
      </div>
    </ErrorBoundary>
  </section>
</template>

<style scoped>
.home-view {
  padding: 0.25rem;
  display: grid;
  gap: 1rem;
}

.home-view__header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1rem;
  border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
  border-radius: 1rem;
  padding: 1rem 1.1rem;
  background: var(--gradient-surface), color-mix(in srgb, var(--surface-2) 92%, transparent);
  box-shadow: var(--shadow-sm);
}

.home-view__title {
  margin: 0;
  font-size: clamp(1.45rem, 3.2vw, 2.1rem);
  letter-spacing: -0.02em;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.home-view__subtitle {
  margin: 0.35rem 0 0;
  color: var(--text-m, var(--text));
  max-width: 56ch;
}

.home-view__header-controls {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.home-view__error {
  margin: 0;
  border: 1px solid color-mix(in srgb, #ef4444 35%, var(--border));
  border-radius: 0.75rem;
  padding: 0.7rem 0.8rem;
  color: color-mix(in srgb, #ef4444 78%, var(--text-h));
  background: color-mix(in srgb, #ef4444 10%, transparent);
}

.home-view__loading {
  margin: 0;
  color: var(--text-m, var(--text));
}

.home-view__content {
  display: grid;
  gap: 1rem;
  grid-template-columns: minmax(0, 18rem) minmax(0, 1fr);
  align-items: start;
}

.home-view__filters,
.home-view__results {
  min-width: 0;
}

@media (max-width: 980px) {
  .home-view__content {
    grid-template-columns: 1fr;
  }
}
</style>
