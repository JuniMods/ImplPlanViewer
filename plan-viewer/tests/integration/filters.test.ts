import { createPinia, setActivePinia } from 'pinia'
import { computed, effectScope, nextTick } from 'vue'
import { createMemoryHistory } from 'vue-router'
import { afterEach, describe, expect, it } from 'vitest'

import { useFilter } from '../../src/composables'
import { createAppRouter } from '../../src/router'
import { useFiltersStore, usePlansStore, useRepositoriesStore } from '../../src/stores'
import { PlanType, Priority, type PlanMetadata, type Repository } from '../../src/types'

type IntegrationPlan = PlanMetadata & {
  title?: string
  completion?: number
}

const repositories: Repository[] = [
  {
    id: 1,
    name: 'Alpha',
    fullName: 'JuniMods/Alpha',
    description: null,
    htmlUrl: 'https://github.com/JuniMods/Alpha',
    defaultBranch: 'main',
    private: false,
    archived: false,
    disabled: false,
    topics: [],
    planCount: 2,
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
]

const plans: IntegrationPlan[] = [
  {
    title: 'Frontend feature plan',
    type: PlanType.FEATURE,
    priority: Priority.HIGH,
    scope: 'frontend',
    completion: 55,
  },
  {
    title: 'Backend bugfix plan',
    type: PlanType.BUG_FIX,
    priority: Priority.MEDIUM,
    scope: 'backend',
    completion: 35,
  },
]

const scopesToStop: Array<{ stop: () => void }> = []

const setupFiltersIntegration = async (path: string) => {
  const pinia = createPinia()
  setActivePinia(pinia)

  const repositoriesStore = useRepositoriesStore()
  repositoriesStore.$patch({
    all: repositories,
    current: repositories[0],
    loading: false,
    error: null,
  })

  const plansStore = usePlansStore()
  plansStore.$patch({
    byRepository: { 'JuniMods/Alpha': plans },
    currentRepository: 'JuniMods/Alpha',
    loading: false,
    error: null,
  })

  const router = createAppRouter(createMemoryHistory())
  await router.push(path)
  await router.isReady()

  const scope = effectScope()
  const filters = scope.run(() =>
    useFilter({
      routeQuery: computed(() => router.currentRoute.value.query),
      replaceRouteQuery: (query) => router.replace({ query }),
    }),
  )

  if (!filters) {
    throw new Error('Unable to create filter integration harness.')
  }

  scopesToStop.push(scope)
  await nextTick()

  return { router, filters, plansStore }
}

describe('filters integration', () => {
  afterEach(() => {
    while (scopesToStop.length > 0) {
      scopesToStop.pop()?.stop()
    }
  })

  it('hydrates filters from URL query and applies them to plan data', async () => {
    const { filters, plansStore } = await setupFiltersIntegration('/alpha?type=feature&scope=frontend&q=front')

    const filtersStore = useFiltersStore()
    expect(filters.types.value).toEqual([PlanType.FEATURE])
    expect(filters.scopes.value).toEqual(['frontend'])
    expect(filters.searchQuery.value).toBe('front')

    const visiblePlans = plansStore.currentPlans.filter((plan) => filtersStore.filterFunction(plan))
    expect(visiblePlans).toHaveLength(1)
    expect(visiblePlans[0]?.title).toBe('Frontend feature plan')
  })

  it('syncs filter mutations back to URL query state', async () => {
    const { router, filters } = await setupFiltersIntegration('/alpha')

    filters.setTypes([PlanType.BUG_FIX])
    filters.setPriorities([Priority.MEDIUM])
    filters.setCompletionRange(20, 60)
    filters.setSearchQuery('backend')
    await filters.syncToRoute()
    await nextTick()

    expect(router.currentRoute.value.query).toEqual({
      type: PlanType.BUG_FIX,
      priority: Priority.MEDIUM,
      completionMin: '20',
      completionMax: '60',
      q: 'backend',
    })

    filters.clearFilters()
    await filters.syncToRoute()
    await nextTick()

    expect(router.currentRoute.value.query).toEqual({})
  })
})
