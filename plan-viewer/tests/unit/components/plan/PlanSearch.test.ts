import { createPinia, setActivePinia } from 'pinia'
import { createSSRApp, defineComponent } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { beforeEach, describe, expect, it } from 'vitest'

import PlanSearch from '../../../../src/components/plan/PlanSearch.vue'
import { useFiltersStore, usePlansStore } from '../../../../src/stores'
import { PlanType, Priority, type PlanMetadata } from '../../../../src/types'

type PlanSearchTestPlan = PlanMetadata & {
  title?: string
  objective?: string
}

const plans: PlanSearchTestPlan[] = [
  {
    type: PlanType.FEATURE,
    priority: Priority.HIGH,
    scope: 'Frontend',
    title: 'Add search card',
    objective: 'Deliver PlanSearch UI',
  },
  {
    type: PlanType.REFACTOR,
    priority: Priority.MEDIUM,
    scope: 'Architecture',
    title: 'Refactor parser internals',
    objective: 'Improve parser code organization',
  },
]

const renderSearch = async (setupStore?: () => void): Promise<string> => {
  const root = defineComponent({
    components: { PlanSearch },
    setup() {
      const plansStore = usePlansStore()
      plansStore.$patch({
        byRepository: { 'JuniMods/ImplPlanViewer': plans },
        currentRepository: 'JuniMods/ImplPlanViewer',
      })

      setupStore?.()

      return {}
    },
    template: '<PlanSearch />',
  })

  const app = createSSRApp(root)
  app.use(createPinia())
  return renderToString(app)
}

describe('PlanSearch', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders debounced search input, keyboard hint and result count', async () => {
    const html = await renderSearch()

    expect(html).toContain('data-testid="plan-search"')
    expect(html).toContain('data-testid="plan-search-input"')
    expect(html).toContain('Search title, objective, scope, or change areas')
    expect(html).toContain('data-testid="plan-search-count"')
    expect(html).toContain('aria-live="polite"')
    expect(html).toContain('2 results')
    expect(html).toContain('plan-search__shortcut')
    expect(html).toContain('>/</kbd>')
  })

  it('updates result count from active filter state and shows clear button for active query', async () => {
    const html = await renderSearch(() => {
      const filtersStore = useFiltersStore()
      filtersStore.patchFilters({
        types: [PlanType.FEATURE],
        searchQuery: 'feature',
      })
    })

    expect(html).toContain('1 result')
    expect(html).toContain('data-testid="plan-search-clear"')
    expect(html).toContain('aria-label="Clear search"')
  })
})
