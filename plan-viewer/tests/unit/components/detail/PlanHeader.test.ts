import { createSSRApp, defineComponent } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it } from 'vitest'

import PlanHeader from '../../../../src/components/detail/PlanHeader.vue'
import { PlanType, Priority, type PlanMetadata, type Repository } from '../../../../src/types'

type PlanHeaderTestPlan = PlanMetadata & {
  number?: number
  title?: string
  path?: string
}

const repository: Repository = {
  id: 7,
  name: 'ImplPlanViewer',
  fullName: 'JuniMods/ImplPlanViewer',
  description: null,
  htmlUrl: 'https://github.com/JuniMods/ImplPlanViewer',
  defaultBranch: 'main',
  private: false,
  archived: false,
  disabled: false,
  topics: [],
  planCount: 55,
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const renderHeader = async (plan: PlanHeaderTestPlan): Promise<string> => {
  const root = defineComponent({
    components: { PlanHeader },
    setup() {
      return { plan, repository }
    },
    template: '<PlanHeader :plan="plan" :repository="repository" />',
  })

  return renderToString(createSSRApp(root))
}

describe('PlanHeader', () => {
  it('renders breadcrumb, title, badge row, and source links', async () => {
    const html = await renderHeader({
      type: PlanType.FEATURE,
      priority: Priority.HIGH,
      scope: 'Frontend, API',
      number: 55,
      title: 'Plan header component',
      path: 'implementation-plans/055_plan_header.md',
    })

    expect(html).toContain('data-testid="plan-header"')
    expect(html).toContain('← Back to Index')
    expect(html).toContain('JuniMods/ImplPlanViewer')
    expect(html).toContain('#055')
    expect(html).toContain('Implementation Plan: Plan header component')
    expect(html).toContain('Feature')
    expect(html).toContain('High')
    expect(html).toContain('Frontend')
    expect(html).toContain('API')
    expect(html).toContain('GitHub file')
    expect(html).toContain('implementation-plans/055_plan_header.md')
  })

  it('uses safe fallbacks when optional plan metadata is missing', async () => {
    const html = await renderHeader({
      type: PlanType.CHORE,
      priority: Priority.LOW,
      scope: '   ',
    })

    expect(html).toContain('#---')
    expect(html).toContain('Implementation Plan: Untitled plan')
    expect(html).toContain('Unknown Scope')
    expect(html).toContain('Repository')
    expect(html).toContain('https://github.com/JuniMods/ImplPlanViewer')
    expect(html).toContain('data-testid="plan-header-copy"')
  })
})
