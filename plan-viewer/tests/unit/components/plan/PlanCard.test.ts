import { createSSRApp, defineComponent } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it } from 'vitest'

import PlanCard from '../../../../src/components/plan/PlanCard.vue'
import { PlanType, Priority, type PlanMetadata } from '../../../../src/types'

type PlanCardTestPlan = PlanMetadata & {
  number?: number
  title?: string
  objective?: string
  repositoryName?: string
  updatedAt?: string
  completion?: number
}

const renderCard = async (plan: PlanCardTestPlan, compact = false): Promise<string> => {
  const root = defineComponent({
    components: { PlanCard },
    setup() {
      return { plan, compact }
    },
    template: '<PlanCard :plan="plan" :compact="compact" />',
  })

  return renderToString(createSSRApp(root))
}

describe('PlanCard', () => {
  it('renders plan content with badges and progress details', async () => {
    const html = await renderCard({
      type: PlanType.FEATURE,
      priority: Priority.HIGH,
      scope: 'Frontend',
      number: 5,
      title: 'Implement plan list card rendering with metadata details',
      objective: 'Provide a quick overview of each plan so users can scan list items effectively.',
      repositoryName: 'JuniMods/ImplPlanViewer',
      updatedAt: '2026-04-04T08:00:00.000Z',
      completion: 63,
    })

    expect(html).toContain('data-testid="plan-card"')
    expect(html).toContain('#005')
    expect(html).toContain('Feature')
    expect(html).toContain('High')
    expect(html).toContain('Frontend')
    expect(html).toContain('Implement plan list card rendering with metadata details')
    expect(html).toContain('JuniMods/ImplPlanViewer')
    expect(html).toContain('2026-04-04')
    expect(html).toContain('63%')
    expect(html).toContain('plan-card--plan-feature')
  })

  it('uses resilient fallbacks for missing optional metadata', async () => {
    const html = await renderCard({
      type: PlanType.CHORE,
      priority: Priority.LOW,
      scope: '',
      completion: 120,
    })

    expect(html).toContain('#---')
    expect(html).toContain('Untitled plan')
    expect(html).toContain('No objective summary available.')
    expect(html).toContain('Unknown repository')
    expect(html).toContain('Unknown date')
    expect(html).toContain('100%')
    expect(html).toContain('Unknown Scope')
  })
})
