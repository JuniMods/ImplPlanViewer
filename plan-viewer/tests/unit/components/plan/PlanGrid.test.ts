import { createSSRApp, defineComponent } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it } from 'vitest'

import PlanGrid from '../../../../src/components/plan/PlanGrid.vue'
import { PlanType, Priority, type PlanMetadata } from '../../../../src/types'

type PlanGridTestPlan = PlanMetadata & {
  number?: number
  title?: string
  objective?: string
  repositoryName?: string
  updatedAt?: string
  completion?: number
}

const renderGrid = async (plans: PlanGridTestPlan[], emptyMessage = '', showClearFilters = false) => {
  const root = defineComponent({
    components: { PlanGrid },
    setup() {
      return { plans, emptyMessage, showClearFilters }
    },
    template: '<PlanGrid :plans="plans" :empty-message="emptyMessage" :show-clear-filters="showClearFilters" />',
  })

  return renderToString(createSSRApp(root))
}

describe('PlanGrid', () => {
  it('renders a plan card for each plan inside a list grid', async () => {
    const html = await renderGrid([
      {
        type: PlanType.FEATURE,
        priority: Priority.HIGH,
        scope: 'Frontend',
        number: 1,
        title: 'Create responsive plan grid',
        objective: 'Show plans in a multi-column layout.',
        repositoryName: 'JuniMods/ImplPlanViewer',
        updatedAt: '2026-04-04T08:00:00.000Z',
        completion: 40,
      },
      {
        type: PlanType.REFACTOR,
        priority: Priority.MEDIUM,
        scope: 'Architecture',
        number: 2,
        title: 'Stabilize plan list rendering',
        objective: 'Ensure plan list contracts are reliable.',
        repositoryName: 'JuniMods/ImplPlanViewer',
        updatedAt: '2026-04-03T08:00:00.000Z',
        completion: 70,
      },
    ])

    expect(html).toContain('data-testid="plan-grid"')
    expect(html).toContain('class="plan-grid__list"')
    expect((html.match(/data-testid="plan-card"/gu) ?? []).length).toBe(2)
    expect(html).toContain('Create responsive plan grid')
    expect(html).toContain('Stabilize plan list rendering')
  })

  it('renders the empty state when no plans are provided', async () => {
    const html = await renderGrid([], 'No plans match the current filters.')

    expect(html).toContain('data-testid="plan-grid-empty"')
    expect(html).toContain('No plans match the current filters.')
    expect(html).not.toContain('data-testid="plan-card"')
  })

  it('renders clear filters action when empty list is caused by active filters', async () => {
    const html = await renderGrid([], '', true)

    expect(html).toContain('No results')
    expect(html).toContain('data-testid="plan-empty-state-clear"')
    expect(html).toContain('Clear filters')
  })
})
