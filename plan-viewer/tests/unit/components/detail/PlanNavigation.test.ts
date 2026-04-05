import { createSSRApp, defineComponent } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it } from 'vitest'

import PlanNavigation from '../../../../src/components/detail/PlanNavigation.vue'
import { PlanType, Priority, type PlanMetadata } from '../../../../src/types'

type PlanNavigationTestPlan = PlanMetadata & {
  id?: string
  title?: string
}

const plans: PlanNavigationTestPlan[] = [
  {
    id: '61',
    title: 'Store contracts',
    type: PlanType.ENHANCEMENT,
    priority: Priority.MEDIUM,
    scope: 'stores',
  },
  {
    id: '62',
    title: 'Metadata footer',
    type: PlanType.FEATURE,
    priority: Priority.HIGH,
    scope: 'detail',
  },
  {
    id: '63',
    title: 'Notes refinements',
    type: PlanType.REFACTOR,
    priority: Priority.LOW,
    scope: 'detail',
  },
]

const renderNavigation = async (
  currentPlanId: string,
  basePath = '/JuniMods/ImplPlanViewer',
): Promise<string> => {
  const root = defineComponent({
    components: { PlanNavigation },
    setup() {
      return { plans, currentPlanId, basePath }
    },
    template: '<PlanNavigation :plans="plans" :current-plan-id="currentPlanId" :base-path="basePath" />',
  })

  return renderToString(createSSRApp(root))
}

describe('PlanNavigation', () => {
  it('renders previous and next links for plans around the current item', async () => {
    const html = await renderNavigation('62')

    expect(html).toContain('data-testid="plan-navigation"')
    expect(html).toContain('data-testid="plan-navigation-prev"')
    expect(html).toContain('← Prev: Store contracts')
    expect(html).toContain('href="/JuniMods/ImplPlanViewer/61"')
    expect(html).toContain('data-testid="plan-navigation-next"')
    expect(html).toContain('Next: Notes refinements →')
    expect(html).toContain('href="/JuniMods/ImplPlanViewer/63"')
    expect(html).toContain('Plan 2 of 3')
    expect(html).toContain('Use ← and → keys to navigate')
  })

  it('falls back to disabled controls when the current plan is missing', async () => {
    const html = await renderNavigation('999')

    expect(html).toContain('data-testid="plan-navigation-prev-disabled"')
    expect(html).toContain('data-testid="plan-navigation-next-disabled"')
    expect(html).toContain('Plan not in current list')
  })
})
