import { storeToRefs } from 'pinia'
import {
  computed,
  getCurrentScope,
  onScopeDispose,
  ref,
  watch,
  type Ref,
  type WatchStopHandle,
} from 'vue'

import { useFiltersStore } from '../stores'

export interface UseSearchOptions {
  debounceMs?: number
}

export interface UseSearchResult {
  query: Ref<string>
  searchQuery: Ref<string>
  isDebouncing: Readonly<Ref<boolean>>
  setQuery: (query: string) => void
  clearQuery: () => void
  flush: () => void
  cleanup: () => void
}

export const useSearch = (options: UseSearchOptions = {}): UseSearchResult => {
  const filtersStore = useFiltersStore()
  const { searchQuery } = storeToRefs(filtersStore)

  const debounceMs = Math.max(0, options.debounceMs ?? 300)
  const query = ref(searchQuery.value)
  const isDebouncing = ref(false)
  let pendingQuery: string | null = null
  let debounceHandle: ReturnType<typeof setTimeout> | null = null
  const stopHandles: WatchStopHandle[] = []

  const clearDebounce = (): void => {
    if (debounceHandle !== null) {
      clearTimeout(debounceHandle)
      debounceHandle = null
    }

    pendingQuery = null
    isDebouncing.value = false
  }

  const applyQuery = (nextQuery: string): void => {
    clearDebounce()
    filtersStore.setSearchQuery(nextQuery)
    query.value = filtersStore.searchQuery
  }

  const scheduleQuery = (nextQuery: string): void => {
    if (nextQuery === searchQuery.value) {
      clearDebounce()
      return
    }

    if (debounceMs === 0) {
      applyQuery(nextQuery)
      return
    }

    if (debounceHandle !== null) {
      clearTimeout(debounceHandle)
    }

    pendingQuery = nextQuery
    isDebouncing.value = true
    debounceHandle = setTimeout(() => {
      const queryToApply = pendingQuery
      if (queryToApply !== null) {
        applyQuery(queryToApply)
      }
    }, debounceMs)
  }

  stopHandles.push(
    watch(query, (nextQuery) => {
      scheduleQuery(nextQuery)
    }),
  )

  stopHandles.push(
    watch(searchQuery, (nextQuery) => {
      if (query.value !== nextQuery) {
        query.value = nextQuery
      }

      if (pendingQuery !== null && pendingQuery !== nextQuery) {
        clearDebounce()
      }
    }),
  )

  const cleanup = (): void => {
    clearDebounce()
    stopHandles.forEach((stop) => stop())
    stopHandles.length = 0
  }

  if (getCurrentScope()) {
    onScopeDispose(cleanup)
  }

  return {
    query,
    searchQuery,
    isDebouncing: computed(() => isDebouncing.value),
    setQuery: (nextQuery: string): void => {
      query.value = nextQuery
    },
    clearQuery: (): void => {
      query.value = ''
      applyQuery('')
    },
    flush: (): void => {
      if (pendingQuery !== null) {
        applyQuery(pendingQuery)
      }
    },
    cleanup,
  }
}
