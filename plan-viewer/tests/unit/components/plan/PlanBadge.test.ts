import { createSSRApp, defineComponent } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it } from 'vitest'

import PlanBadge from '../../../../src/components/plan/PlanBadge.vue'

const renderPlanBadge = async (kind: 'type' | 'priority' | 'scope', value?: string | null) => {
  const root = defineComponent({
    components: { PlanBadge },
    data: () => ({ kind, value }),
    template: '<PlanBadge :kind="kind" :value="value" />',
  })

  return renderToString(createSSRApp(root))
}

describe('PlanBadge', () => {
  it('renders type badge styling for known values', async () => {
    const html = await renderPlanBadge('type', 'feature')

    expect(html).toContain('Feature')
    expect(html).toContain('plan-badge--plan-feature')
    expect(html).toContain('plan-badge--tonal')
  })

  it('normalizes priority values before styling', async () => {
    const html = await renderPlanBadge('priority', '  HIGH  ')

    expect(html).toContain('High')
    expect(html).toContain('plan-badge--priority-high')
  })

  it('renders scope badges with fallback for blank values', async () => {
    const html = await renderPlanBadge('scope', '   ')

    expect(html).toContain('Unknown Scope')
    expect(html).toContain('plan-badge--plan-scope')
    expect(html).toContain('plan-badge--outlined')
  })

  it('falls back to unknown type styling for invalid values', async () => {
    const html = await renderPlanBadge('type', 'invalid')

    expect(html).toContain('Unknown')
    expect(html).toContain('plan-badge--grey')
    expect(html).toContain('plan-badge--outlined')
  })
})
