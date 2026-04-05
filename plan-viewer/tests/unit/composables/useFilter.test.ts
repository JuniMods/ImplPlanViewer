import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { effectScope, nextTick, ref } from 'vue'
import type { LocationQuery, LocationQueryRaw } from 'vue-router'

import { useFilter } from '../../../src/composables/useFilter'
import { PlanType, Priority } from '../../../src/types'

describe('useFilter composable', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('hydrates filters from route query and keeps URL in sync when filters change', async () => {
    const routeQuery = ref<LocationQuery>({
      type: [PlanType.FEATURE, 'invalid'],
      priority: Priority.HIGH,
      scope: 'stores',
      completionMin: '25',
      completionMax: '75',
      q: ' auth ',
    })

    const replacedQueries: LocationQueryRaw[] = []

    const scope = effectScope()
    const filters = scope.run(() =>
      useFilter({
        routeQuery,
        replaceRouteQuery: (query) => {
          replacedQueries.push(query)
          routeQuery.value = query as LocationQuery
        },
      }),
    )

    await nextTick()

    expect(filters?.types.value).toEqual([PlanType.FEATURE])
    expect(filters?.priorities.value).toEqual([Priority.HIGH])
    expect(filters?.scopes.value).toEqual(['stores'])
    expect(filters?.completionMin.value).toBe(25)
    expect(filters?.completionMax.value).toBe(75)
    expect(filters?.searchQuery.value).toBe('auth')

    filters?.setSearchQuery('refactor')
    await nextTick()

    expect(replacedQueries.at(-1)).toEqual({
      type: PlanType.FEATURE,
      priority: Priority.HIGH,
      scope: 'stores',
      completionMin: '25',
      completionMax: '75',
      q: 'refactor',
    })

    scope.stop()
  })

  it('reacts to external route query updates', async () => {
    const routeQuery = ref<LocationQuery>({ type: PlanType.CHORE })

    const scope = effectScope()
    const filters = scope.run(() =>
      useFilter({
        routeQuery,
        replaceRouteQuery: (query) => {
          routeQuery.value = query as LocationQuery
        },
      }),
    )

    routeQuery.value = {
      priority: Priority.LOW,
      scope: ['ui', 'detail'],
      q: 'layout',
    }

    await nextTick()

    expect(filters?.types.value).toEqual([])
    expect(filters?.priorities.value).toEqual([Priority.LOW])
    expect(filters?.scopes.value).toEqual(['ui', 'detail'])
    expect(filters?.searchQuery.value).toBe('layout')

    scope.stop()
  })

  it('supports disabling URL synchronization', async () => {
    const replaceRouteQuery = () => {
      throw new Error('replaceRouteQuery should not be called when sync is disabled')
    }

    const scope = effectScope()
    const filters = scope.run(() =>
      useFilter({
        syncWithUrl: false,
        replaceRouteQuery,
      }),
    )

    filters?.applyFilters({ types: [PlanType.REFACTOR], searchQuery: 'parser' })
    await nextTick()

    expect(filters?.types.value).toEqual([PlanType.REFACTOR])
    expect(filters?.searchQuery.value).toBe('parser')

    scope.stop()
  })
})
