import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { PlanType, Priority } from '../../../src/types'
import type { PlanMetadata } from '../../../src/types'
import { useFiltersStore } from '../../../src/stores/filters'

const plans: PlanMetadata[] = [
  { type: PlanType.FEATURE, scope: 'stores', priority: Priority.HIGH },
  { type: PlanType.BUG_FIX, scope: 'ui', priority: Priority.LOW },
  { type: PlanType.REFACTOR, scope: 'parsers', priority: Priority.MEDIUM },
]

describe('filters store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts with default filter state', () => {
    const store = useFiltersStore()

    expect(store.types).toEqual([])
    expect(store.priorities).toEqual([])
    expect(store.scopes).toEqual([])
    expect(store.completionMin).toBe(0)
    expect(store.completionMax).toBe(100)
    expect(store.searchQuery).toBe('')
    expect(store.hasActiveFilters).toBe(false)
    expect(store.activeFilterCount).toBe(0)
  })

  it('filters plans by selected type, priority, scope and search query', () => {
    const store = useFiltersStore()

    store.setTypes([PlanType.FEATURE])
    store.setPriorities([Priority.HIGH])
    store.setScopes(['stor'])
    store.setSearchQuery('feature')

    const filtered = plans.filter((plan) => store.filterFunction(plan))

    expect(filtered).toEqual([plans[0]])
    expect(store.hasActiveFilters).toBe(true)
    expect(store.activeFilterCount).toBe(4)
  })

  it('normalizes completion range and applies completion filtering when present', () => {
    const store = useFiltersStore()

    store.setCompletionRange(90, 10)

    expect(store.completionMin).toBe(10)
    expect(store.completionMax).toBe(90)

    const withCompletion = plans.map((plan, index) => ({ ...plan, completion: index * 50 }))
    expect(withCompletion.filter((plan) => store.filterFunction(plan)).map((plan) => plan.scope)).toEqual([
      'ui',
    ])
  })

  it('applies URL query values and serializes back to URL query', () => {
    const store = useFiltersStore()

    store.applyFromUrlQuery(
      new URLSearchParams(
        'type=feature&type=invalid&priority=high&scope=stores&completionMin=30&completionMax=80&q=auth',
      ),
    )

    expect(store.types).toEqual([PlanType.FEATURE])
    expect(store.priorities).toEqual([Priority.HIGH])
    expect(store.scopes).toEqual(['stores'])
    expect(store.completionMin).toBe(30)
    expect(store.completionMax).toBe(80)
    expect(store.searchQuery).toBe('auth')

    const serialized = store.toUrlQuery()
    expect(serialized.getAll('type')).toEqual([PlanType.FEATURE])
    expect(serialized.getAll('priority')).toEqual([Priority.HIGH])
    expect(serialized.getAll('scope')).toEqual(['stores'])
    expect(serialized.get('completionMin')).toBe('30')
    expect(serialized.get('completionMax')).toBe('80')
    expect(serialized.get('q')).toBe('auth')
  })

  it('clears all filters back to defaults', () => {
    const store = useFiltersStore()

    store.patchFilters({
      types: [PlanType.CHORE],
      priorities: [Priority.CRITICAL],
      scopes: ['tooling'],
      completionMin: 20,
      completionMax: 40,
      searchQuery: 'cleanup',
    })

    store.clearFilters()

    expect(store.$state).toEqual({
      types: [],
      priorities: [],
      scopes: [],
      completionMin: 0,
      completionMax: 100,
      searchQuery: '',
    })
    expect(store.hasActiveFilters).toBe(false)
  })

  it('normalizes patch updates by removing duplicates, invalid values and trimming input', () => {
    const store = useFiltersStore()

    store.patchFilters({
      types: [PlanType.FEATURE, PlanType.FEATURE, 'invalid' as PlanType],
      priorities: [Priority.HIGH, Priority.HIGH, 'invalid' as Priority],
      scopes: ['  api  ', '', 'api'],
      completionMin: 120,
      completionMax: -5,
      searchQuery: '  parser ',
    })

    expect(store.types).toEqual([PlanType.FEATURE])
    expect(store.priorities).toEqual([Priority.HIGH])
    expect(store.scopes).toEqual(['api'])
    expect(store.completionMin).toBe(0)
    expect(store.completionMax).toBe(100)
    expect(store.searchQuery).toBe('parser')
  })
})
