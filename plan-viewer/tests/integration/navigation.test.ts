import { createPinia, setActivePinia } from 'pinia'
import { createSSRApp, defineComponent } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { RouterView, createMemoryHistory } from 'vue-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createAppRouter } from '../../src/router'
import { usePlansStore, useRepositoriesStore } from '../../src/stores'
import { PlanType, Priority, type PlanMetadata, type Repository } from '../../src/types'

type IntegrationPlan = PlanMetadata & {
  id?: string
  number?: number
  title?: string
  markdown?: string
}

type WindowLike = {
  scrollTo?: (x: number, y: number) => void
}

type DocumentLike = {
  title: string
}

const globalScope = globalThis as typeof globalThis & {
  window?: WindowLike
  document?: DocumentLike
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
    topics: [],
    planCount: 1,
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
]

const plansByRepository: Record<string, IntegrationPlan[]> = {
  'JuniMods/Alpha': [
    {
      id: '42',
      number: 42,
      title: 'Navigation integration plan',
      type: PlanType.FEATURE,
      priority: Priority.HIGH,
      scope: 'routing',
      markdown: `## Problem / Objective
Validate deep linking between list and detail views.

## Proposed Changes
### 1. Routing
- **What:** Ensure deep links resolve correctly.
- **Why:** Navigation must be reliable.
- **How:** Cover route guards and rendered views.`,
    },
  ],
}

const seedStores = () => {
  const repositoriesStore = useRepositoriesStore()
  repositoriesStore.$patch({
    all: repositories,
    current: repositories[0],
    loading: false,
    error: null,
  })

  const plansStore = usePlansStore()
  plansStore.$patch({
    byRepository: plansByRepository,
    currentRepository: 'JuniMods/Alpha',
    loading: false,
    error: null,
  })
}

const renderRoute = async (path: string) => {
  const pinia = createPinia()
  setActivePinia(pinia)
  seedStores()

  const router = createAppRouter(createMemoryHistory())
  await router.push(path)
  await router.isReady()

  const root = defineComponent({
    components: { RouterView },
    template: '<RouterView />',
  })

  const app = createSSRApp(root)
  app.use(pinia)
  app.use(router)

  const html = await renderToString(app)
  return { html, route: router.currentRoute.value }
}

describe('navigation integration', () => {
  const originalWindow = globalScope.window
  const originalDocument = globalScope.document

  beforeEach(() => {
    globalScope.document = { title: '' }
    globalScope.window = { scrollTo: vi.fn() }
  })

  afterEach(() => {
    if (originalWindow === undefined) {
      delete globalScope.window
    } else {
      globalScope.window = originalWindow
    }

    if (originalDocument === undefined) {
      delete globalScope.document
    } else {
      globalScope.document = originalDocument
    }
  })

  it('renders the repository list view for repository deep links', async () => {
    const { html, route } = await renderRoute('/alpha')

    expect(route.name).toBe('repository')
    expect(globalScope.document?.title).toBe('Plans - alpha')
    expect(html).toContain('data-testid="home-view"')
    expect(html).toContain('data-testid="plan-grid"')
    expect(html).toContain('Navigation integration plan')
  })

  it('renders the plan detail view for valid plan deep links', async () => {
    const { html, route } = await renderRoute('/alpha/42')

    expect(route.name).toBe('plan-detail')
    expect(globalScope.document?.title).toBe('Plan 42 - alpha')
    expect(globalScope.window?.scrollTo).toHaveBeenCalledWith(0, 0)
    expect(html).toContain('data-testid="plan-detail-view"')
    expect(html).toContain('data-testid="plan-header"')
  })

  it('redirects invalid deep links to the not-found view', async () => {
    const { html, route } = await renderRoute('/alpha/999')

    expect(route.name).toBe('not-found')
    expect(route.path).toBe('/404')
    expect(globalScope.document?.title).toBe('Not Found')
    expect(html).toContain('data-testid="not-found-view"')
  })
})
