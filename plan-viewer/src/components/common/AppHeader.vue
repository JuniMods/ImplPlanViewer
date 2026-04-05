<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref, watch } from 'vue'

import { useSearch } from '../../composables'
import { usePlansStore, useRepositoriesStore } from '../../stores'
import { RepositorySelector, RepositoryStats } from '../repository'
import ThemeToggle from './ThemeToggle.vue'

const GITHUB_REPO_URL = 'https://github.com/JuniMods/ImplPlanViewer'

const repositoriesStore = useRepositoriesStore()
const plansStore = usePlansStore()
const { query, flush } = useSearch({ debounceMs: 200 })
const { sortedByPlanCount, current } = storeToRefs(repositoriesStore)
const selectedRepository = ref(current.value?.fullName ?? '')
const mobileSearchOpen = ref(false)

const syncUrlQuery = (): void => {
  if (typeof window === 'undefined') {
    return
  }

  const url = new URL(window.location.href)

  if (current.value?.fullName) {
    url.searchParams.set('repo', current.value.fullName)
  } else {
    url.searchParams.delete('repo')
  }

  const normalizedQuery = query.value.trim()
  if (normalizedQuery) {
    url.searchParams.set('q', normalizedQuery)
  } else {
    url.searchParams.delete('q')
  }

  window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)
}

const selectRepository = (selection: string): void => {
  if (!selection) {
    repositoriesStore.clearSelection()
    plansStore.clearSelection()
    syncUrlQuery()
    return
  }

  const repository =
    repositoriesStore.all.find((entry) => entry.fullName === selection) ??
    repositoriesStore.all.find((entry) => entry.id.toString() === selection) ??
    repositoriesStore.all.find((entry) => entry.name === selection)

  if (!repository) {
    repositoriesStore.error = `Repository ${selection} not found`
    return
  }

  repositoriesStore.selectRepository(repository.id)
  selectedRepository.value = repository.fullName

  const nextRepository = repositoriesStore.current
  if (nextRepository) {
    plansStore.selectRepository(nextRepository.fullName)
  }

  syncUrlQuery()
}

const applyInitialRepositoryFromUrl = (): void => {
  if (typeof window === 'undefined') {
    return
  }

  const repoFromUrl = new URL(window.location.href).searchParams.get('repo')
  if (!repoFromUrl) {
    return
  }

  const repository =
    repositoriesStore.all.find((entry) => entry.fullName === repoFromUrl) ??
    repositoriesStore.all.find((entry) => entry.id.toString() === repoFromUrl)

  if (!repository) {
    return
  }

  selectedRepository.value = repository.fullName
  selectRepository(selectedRepository.value)
}

watch(
  current,
  (nextRepository) => {
    selectedRepository.value = nextRepository?.fullName ?? ''
  },
  { immediate: true },
)

watch(query, () => {
  syncUrlQuery()
})

applyInitialRepositoryFromUrl()
</script>

<template>
  <div class="app-header">
    <a href="/" class="app-header__brand" aria-label="Go to home">
      <span class="app-header__logo" aria-hidden="true">IP</span>
      <span class="app-header__title">Implementation Plan Viewer</span>
    </a>

    <nav class="app-header__nav" aria-label="Primary navigation">
      <a href="/" class="app-header__nav-link">Home</a>
      <a href="#plans" class="app-header__nav-link">Plans</a>
    </nav>

    <div class="app-header__controls">
      <RepositorySelector
        v-model="selectedRepository"
        :repositories="sortedByPlanCount"
        @select="selectRepository"
      />
      <RepositoryStats :repository="current" />

      <button
        type="button"
        class="app-header__search-toggle"
        data-testid="search-toggle"
        aria-controls="global-search"
        :aria-expanded="mobileSearchOpen ? 'true' : 'false'"
        aria-label="Toggle search input"
        @click="mobileSearchOpen = !mobileSearchOpen"
      >
        🔍
      </button>

      <label class="sr-only" for="global-search">Search plans</label>
      <input
        id="global-search"
        v-model="query"
        type="search"
        data-testid="global-search"
        class="app-header__search"
        :class="{ 'app-header__search--open': mobileSearchOpen }"
        placeholder="Search plans"
        @keydown.enter="flush"
      />

      <ThemeToggle />

      <a
        :href="GITHUB_REPO_URL"
        target="_blank"
        rel="noreferrer noopener"
        class="app-header__source-link"
        aria-label="Open project source on GitHub (opens in a new tab)"
      >
        GitHub
      </a>
    </div>
  </div>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  align-items: center;
  height: var(--header-height);
  padding: 0 var(--space-6);
  background: var(--color-white);
  border-bottom: 1px solid var(--color-gray-200);
}

.app-header__brand {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  text-decoration: none;
  color: var(--color-text-primary);
  transition: opacity calc(var(--transition-fast) * 1ms) var(--ease-out);
}

.app-header__brand:hover {
  opacity: 0.8;
}

.app-header__logo {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-default);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-caption);
  font-weight: var(--font-weight-bold);
  color: var(--color-white);
  background: var(--color-primary);
}

.app-header__title {
  font-size: var(--text-h4);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--letter-spacing-normal);
}

.app-header__nav {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
}

.app-header__nav-link,
.app-header__source-link {
  color: var(--color-gray-700);
  text-decoration: none;
  font-size: var(--text-body-small);
  font-weight: var(--font-weight-medium);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-default);
  padding: var(--space-2) var(--space-3);
  background: var(--color-white);
  transition:
    background-color calc(var(--transition-fast) * 1ms) var(--ease-out),
    border-color calc(var(--transition-fast) * 1ms) var(--ease-out);
}

.app-header__nav-link:hover,
.app-header__source-link:hover {
  background: var(--color-gray-50);
  border-color: var(--color-gray-400);
}

.app-header__controls {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  flex: 1;
  max-width: 700px;
}

.app-header__search {
  height: 36px;
  min-width: 180px;
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-default);
  padding: var(--space-2) var(--space-3);
  background: var(--color-white);
  color: var(--color-text-primary);
  font-size: var(--text-body);
  transition:
    border-color calc(var(--transition-fast) * 1ms) var(--ease-out),
    box-shadow calc(var(--transition-fast) * 1ms) var(--ease-out);
}

.app-header__search::placeholder {
  color: var(--color-gray-400);
}

.app-header__search:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.app-header__search-toggle {
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-default);
  background: var(--color-white);
  color: var(--color-gray-700);
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: none;
  align-items: center;
  justify-content: center;
  transition:
    background-color calc(var(--transition-fast) * 1ms) var(--ease-out),
    border-color calc(var(--transition-fast) * 1ms) var(--ease-out);
}

.app-header__search-toggle:hover {
  background: var(--color-gray-50);
  border-color: var(--color-gray-400);
}

@media (max-width: 1024px) {
  .app-header {
    height: auto;
    padding: var(--space-3) var(--space-4);
    align-items: flex-start;
  }

  .app-header__controls {
    width: 100%;
    margin-left: 0;
    flex-wrap: wrap;
  }

  .app-header__search-toggle {
    display: inline-flex;
  }

  .app-header__search {
    display: none;
  }

  .app-header__search--open {
    display: block;
    flex: 1 1 100%;
  }
}
</style>
