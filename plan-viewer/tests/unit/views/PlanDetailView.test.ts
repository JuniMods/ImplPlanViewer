import { createPinia } from 'pinia'
import { createSSRApp, defineComponent } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { usePlansStore, useRepositoriesStore } from '../../../src/stores'
import { PlanType, Priority, type PlanMetadata, type Repository } from '../../../src/types'
import PlanDetailView from '../../../src/views/PlanDetailView.vue'

const mockedRoute = {
  params: {} as Record<string, string | undefined>,
  query: {},
}

const pushSpy = vi.fn()

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router')
  return {
    ...actual,
    useRoute: () => mockedRoute,
    useRouter: () => ({ push: pushSpy }),
  }
})

type PlanDetailTestPlan = PlanMetadata & {
  id?: string
  title?: string
  markdown?: string
  generatedAt?: string
}

const repository: Repository = {
  id: 11,
  name: 'ImplPlanViewer',
  fullName: 'JuniMods/ImplPlanViewer',
  description: 'Viewer repository',
  htmlUrl: 'https://github.com/JuniMods/ImplPlanViewer',
  defaultBranch: 'main',
  private: false,
  archived: false,
  disabled: false,
  topics: ['impl-plan-viewer'],
  planCount: 2,
  updatedAt: '2026-04-01T00:00:00.000Z',
}

const markdownPlan = `## Problem / Objective
Build the detail screen.

## Current State
The route exists but no page is wired yet.

## Proposed Changes
### 1. Detail Layout
- **What:** Render the complete detail layout.
- **Why:** Users need context for a single plan.
- **How:** Compose the existing detail components.

## Implementation Steps
1. **Phase 1: View Composition**
   - [x] Mount all detail sections
   - [ ] Add keyboard navigation handlers

2. **Phase 2: Validation**
   - [x] Add integration test coverage

## Testing Strategy
- Verify detail sections render for a valid plan.

## Rollout
- Release with existing views update.

## Success Criteria
- [x] Detail route renders all sections.
- [ ] Keyboard navigation works.

## Notes
- Keep links shareable.
`

const plansByRepository: Record<string, PlanDetailTestPlan[]> = {
  'JuniMods/ImplPlanViewer': [
    {
      id: '67',
      title: 'PlanDetailView page',
      type: PlanType.FEATURE,
      priority: Priority.MEDIUM,
      scope: 'views',
      markdown: markdownPlan,
      generatedAt: '2026-04-01T10:00:00.000Z',
    },
    {
      id: '68',
      title: 'Another plan',
      type: PlanType.ENHANCEMENT,
      priority: Priority.LOW,
      scope: 'views',
      markdown: markdownPlan,
      generatedAt: '2026-04-01T10:00:00.000Z',
    },
  ],
}

const renderPlanDetailView = async (configure?: () => void): Promise<string> => {
  const root = defineComponent({
    components: { PlanDetailView },
    setup() {
      const repositoriesStore = useRepositoriesStore()
      const plansStore = usePlansStore()

      repositoriesStore.$patch({
        all: [repository],
        current: repository,
        loading: false,
        error: null,
      })

      plansStore.$patch({
        byRepository: plansByRepository,
        currentRepository: repository.fullName,
        loading: false,
        error: null,
      })

      configure?.()
      return {}
    },
    template: '<PlanDetailView />',
  })

  const app = createSSRApp(root)
  app.use(createPinia())
  return renderToString(app)
}

describe('PlanDetailView', () => {
  beforeEach(() => {
    mockedRoute.params = { repoId: '11', planId: '67' }
    pushSpy.mockReset()
  })

  it('renders full plan detail layout with parsed markdown sections', async () => {
    const html = await renderPlanDetailView()

    expect(html).toContain('data-testid="plan-detail-view"')
    expect(html).toContain('data-testid="error-boundary"')
    expect(html).toContain('data-testid="plan-header"')
    expect(html).toContain('data-testid="objective-block"')
    expect(html).toContain('data-testid="ai-intent-card"')
    expect(html).toContain('data-testid="scope-impact-map"')
    expect(html).toContain('data-testid="phase-timeline"')
    expect(html).toContain('data-testid="testing-panel"')
    expect(html).toContain('data-testid="rollout-panel"')
    expect(html).toContain('data-testid="success-criteria"')
    expect(html).toContain('data-testid="notes-section"')
    expect(html).toContain('data-testid="metadata-footer"')
    expect(html).toContain('data-testid="plan-navigation"')
    expect(html).toContain('Detail Layout')
  })

  it('renders a not-found state for invalid route params', async () => {
    mockedRoute.params = { repoId: '11', planId: '999' }

    const html = await renderPlanDetailView()

    expect(html).toContain('data-testid="plan-detail-not-found"')
    expect(html).not.toContain('data-testid="plan-header"')
  })
})
