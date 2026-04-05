import { createMemoryHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createAppRouter } from '../../../src/router'
import { usePlansStore, useRepositoriesStore } from '../../../src/stores'
import { PlanType, Priority, type PlanMetadata, type Repository } from '../../../src/types'

type RouterTestPlan = PlanMetadata & {
  id?: string
  planId?: string
  number?: number
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
    topics: ['viewer'],
    planCount: 1,
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
]

const plansByRepository: Record<string, RouterTestPlan[]> = {
  'JuniMods/Alpha': [
    {
      type: PlanType.FEATURE,
      priority: Priority.HIGH,
      scope: 'frontend',
      id: '42',
      number: 42,
    },
  ],
}

describe('router configuration', () => {
  const originalWindow = globalScope.window
  const originalDocument = globalScope.document

  beforeEach(() => {
    setActivePinia(createPinia())

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

  it('sets route title and scrolls on successful repository navigation', async () => {
    const router = createAppRouter(createMemoryHistory())

    await router.push('/1')
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('repository')
    expect(globalScope.document?.title).toBe('Plans - 1')
    expect(globalScope.window?.scrollTo).toHaveBeenCalledWith(0, 0)
  })

  it('redirects unknown repositories to not-found', async () => {
    const router = createAppRouter(createMemoryHistory())

    await router.push('/999')
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('not-found')
    expect(router.currentRoute.value.path).toBe('/404')
    expect(globalScope.document?.title).toBe('Not Found')
  })

  it('redirects unknown plans to not-found', async () => {
    const router = createAppRouter(createMemoryHistory())

    await router.push('/1/999')
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('not-found')
    expect(router.currentRoute.value.path).toBe('/404')
  })

  it('supports known plan routes', async () => {
    const router = createAppRouter(createMemoryHistory())

    await router.push('/1/42')
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('plan-detail')
    expect(globalScope.document?.title).toBe('Plan 42 - 1')
  })
})
