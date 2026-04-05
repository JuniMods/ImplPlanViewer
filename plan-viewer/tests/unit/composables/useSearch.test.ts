import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { effectScope, nextTick } from 'vue'

import { useSearch } from '../../../src/composables/useSearch'
import { useFiltersStore } from '../../../src/stores'

describe('useSearch composable', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('debounces query updates before writing to the filters store', async () => {
    const scope = effectScope()
    const search = scope.run(() => useSearch({ debounceMs: 300 }))
    const filtersStore = useFiltersStore()

    search?.setQuery('  refactor ')
    await nextTick()

    expect(search?.query.value).toBe('  refactor ')
    expect(search?.isDebouncing.value).toBe(true)
    expect(filtersStore.searchQuery).toBe('')

    vi.advanceTimersByTime(299)
    expect(filtersStore.searchQuery).toBe('')

    vi.advanceTimersByTime(1)
    expect(filtersStore.searchQuery).toBe('refactor')
    expect(search?.query.value).toBe('refactor')
    expect(search?.isDebouncing.value).toBe(false)

    scope.stop()
  })

  it('supports immediate updates via flush and clear', async () => {
    const scope = effectScope()
    const search = scope.run(() => useSearch({ debounceMs: 300 }))
    const filtersStore = useFiltersStore()

    search?.setQuery('feature')
    await nextTick()
    expect(filtersStore.searchQuery).toBe('')

    search?.flush()
    expect(filtersStore.searchQuery).toBe('feature')
    expect(search?.isDebouncing.value).toBe(false)

    search?.setQuery('bugfix')
    await nextTick()
    search?.clearQuery()

    expect(filtersStore.searchQuery).toBe('')
    expect(search?.query.value).toBe('')
    expect(search?.isDebouncing.value).toBe(false)

    scope.stop()
  })

  it('keeps local query in sync with external store changes', async () => {
    const scope = effectScope()
    const search = scope.run(() => useSearch({ debounceMs: 300 }))
    const filtersStore = useFiltersStore()

    search?.setQuery('pending')
    await nextTick()
    expect(search?.isDebouncing.value).toBe(true)

    filtersStore.setSearchQuery('external')
    await nextTick()

    expect(search?.query.value).toBe('external')
    expect(search?.searchQuery.value).toBe('external')
    expect(search?.isDebouncing.value).toBe(false)

    scope.stop()
  })
})
