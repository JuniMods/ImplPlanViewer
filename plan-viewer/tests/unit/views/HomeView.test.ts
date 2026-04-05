import { createPinia } from 'pinia'
import { createSSRApp, defineComponent } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useFiltersStore, usePlansStore, useRepositoriesStore } from '../../../src/stores'
import { PlanType, Priority, type PlanMetadata, type Repository } from '../../../src/types'
import HomeView from '../../../src/views/HomeView.vue'

const mockedRoute = {
  params: {} as Record<string, string | undefined>,
  query: {},
}

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router')
  return {
    ...actual,
    useRoute: () => mockedRoute,
  }
})

type HomeViewTestPlan = PlanMetadata & {
  title?: string
  objective?: string
  repositoryName?: string
}

const repositories: Repository[] = [
  {
    id: 1,
    name: 'Alpha',
    fullName: 'JuniMods/Alpha',
    description: 'Alpha repository',
    htmlUrl: 'https://github.com/JuniMods/Alpha',
    defaultBranch: 'main',
    private: false,
    archived: false,
    disabled: false,
    topics: ['viewer'],
    planCount: 1,
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    name: 'Beta',
    fullName: 'JuniMods/Beta',
    description: 'Beta repository',
    htmlUrl: 'https://github.com/JuniMods/Beta',
    defaultBranch: 'main',
    private: false,
    archived: false,
    disabled: false,
    topics: ['viewer'],
    planCount: 1,
    updatedAt: '2026-01-02T00:00:00.000Z',
  },
]

const plansByRepository: Record<string, HomeViewTestPlan[]> = {
  'JuniMods/Alpha': [
    {
      type: PlanType.FEATURE,
      priority: Priority.HIGH,
      scope: 'frontend',
      title: 'Alpha plan',
      objective: 'Implement alpha workflow',
      repositoryName: 'JuniMods/Alpha',
    },
  ],
  'JuniMods/Beta': [
    {
      type: PlanType.BUG_FIX,
      priority: Priority.MEDIUM,
      scope: 'backend',
      title: 'Beta plan',
      objective: 'Implement beta workflow',
      repositoryName: 'JuniMods/Beta',
    },
  ],
}

const renderHomeView = async (configure?: () => void): Promise<string> => {
  const root = defineComponent({
    components: { HomeView },
    setup() {
      const repositoriesStore = useRepositoriesStore()
      const plansStore = usePlansStore()
      useFiltersStore()

      repositoriesStore.$patch({
        all: repositories,
        current: repositories[0],
        loading: false,
        error: null,
      })

      plansStore.$patch({
        byRepository: plansByRepository,
        currentRepository: 'JuniMods/Alpha',
        loading: false,
        error: null,
      })

      configure?.()
      return {}
    },
    template: '<HomeView />',
  })

  const app = createSSRApp(root)
  app.use(createPinia())
  return renderToString(app)
}

describe('HomeView', () => {
  beforeEach(() => {
    mockedRoute.params = {}
  })

  it('renders repository selector, filters, search, and plan grid', async () => {
    const html = await renderHomeView()

    expect(html).toContain('data-testid="home-view"')
    expect(html).toContain('id="plans"')
    expect(html).toContain('data-testid="repository-select"')
    expect(html).toContain('data-testid="error-boundary"')
    expect(html).toContain('data-testid="plan-search"')
    expect(html).toContain('data-testid="plan-filters"')
    expect(html).toContain('data-testid="plan-grid"')
    expect(html).toContain('Alpha plan')
  })

  it('loads repository from route param and shows filtered empty state', async () => {
    mockedRoute.params = { repoId: '2' }

    const html = await renderHomeView(() => {
      const filtersStore = useFiltersStore()
      filtersStore.setSearchQuery('not-present')
    })

    expect(html).toContain('Beta repository')
    expect(html).toContain('No results')
    expect(html).toContain('data-testid="plan-empty-state-clear"')
  })
})
