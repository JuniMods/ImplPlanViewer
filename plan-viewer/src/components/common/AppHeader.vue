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
  z-index: 10;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1rem;
  align-items: center;
}

.app-header__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: var(--text-h);
}

.app-header__logo {
  width: 1.9rem;
  height: 1.9rem;
  border-radius: 0.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: #fff;
  background: var(--accent);
}

.app-header__title {
  font-size: 1rem;
  font-weight: 600;
}

.app-header__nav {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
}

.app-header__nav-link,
.app-header__source-link {
  color: var(--text-h);
  text-decoration: none;
  font-size: 0.9rem;
}

.app-header__controls {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-width: min(100%, 44rem);
}

.app-header__search {
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 0.45rem 0.6rem;
  background: var(--bg);
  color: var(--text-h);
}

.app-header__search {
  min-width: 11rem;
}

.app-header__search-toggle {
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--bg);
  color: var(--text-h);
  cursor: pointer;
  width: 2.15rem;
  height: 2.15rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.app-header__search-toggle {
  display: none;
}

@media (max-width: 860px) {
  .app-header {
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
