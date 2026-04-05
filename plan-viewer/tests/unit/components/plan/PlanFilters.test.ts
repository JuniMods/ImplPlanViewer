import { createPinia, setActivePinia } from 'pinia'
import { createSSRApp, defineComponent } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { beforeEach, describe, expect, it } from 'vitest'

import PlanFilters from '../../../../src/components/plan/PlanFilters.vue'
import { useFiltersStore, usePlansStore } from '../../../../src/stores'
import { PlanType, Priority, type PlanMetadata } from '../../../../src/types'

const plans: PlanMetadata[] = [
  { type: PlanType.FEATURE, scope: 'Frontend', priority: Priority.HIGH },
  { type: PlanType.BUG_FIX, scope: 'Backend', priority: Priority.MEDIUM },
  { type: PlanType.REFACTOR, scope: 'Frontend', priority: Priority.LOW },
]

const renderFilters = async (setupStore?: () => void): Promise<string> => {
  const root = defineComponent({
    components: { PlanFilters },
    setup() {
      const plansStore = usePlansStore()
      plansStore.$patch({
        byRepository: { 'JuniMods/ImplPlanViewer': plans },
        currentRepository: 'JuniMods/ImplPlanViewer',
      })

      setupStore?.()

      return {}
    },
    template: '<PlanFilters />',
  })

  const app = createSSRApp(root)
  app.use(createPinia())
  return renderToString(app)
}

describe('PlanFilters', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders type/priority filters, scope options and completion controls', async () => {
    const html = await renderFilters()

    expect(html).toContain('data-testid="plan-filters"')
    expect(html).toContain('data-testid="plan-filters-types"')
    expect(html).toContain('data-testid="plan-filters-priorities"')
    expect(html).toContain('data-testid="plan-filters-scopes"')
    expect(html).toContain('data-testid="plan-filters-completion"')
    expect(html).toContain('value="Frontend"')
    expect(html).toContain('value="Backend"')
    expect(html).toContain('plan-filters-completion-min')
    expect(html).toContain('plan-filters-completion-max')
  })

  it('shows active filter count and selected scope chips from store state', async () => {
    const html = await renderFilters(() => {
      const filtersStore = useFiltersStore()
      filtersStore.patchFilters({
        types: [PlanType.FEATURE],
        priorities: [Priority.HIGH],
        scopes: ['Frontend'],
      })
    })

    expect(html).toContain('data-testid="plan-filters-count"')
    expect(html).toContain('>3</span>')
    expect(html).toContain('Frontend ×')
    expect(html).toContain('plan-filters__chip--active')
  })
})
