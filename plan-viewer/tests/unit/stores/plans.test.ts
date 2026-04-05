import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { PlanType, Priority } from '../../../src/types'
import type { RepoPlansManifest } from '../../../src/types'
import { usePlansStore } from '../../../src/stores/plans'

const alphaManifest: RepoPlansManifest = {
  repository: 'JuniMods/Alpha',
  generatedAt: '2026-01-01T00:00:00.000Z',
  totalPlans: 2,
  plans: [
    { type: PlanType.FEATURE, scope: 'stores', priority: Priority.HIGH },
    { type: PlanType.REFACTOR, scope: 'parsers', priority: Priority.MEDIUM },
  ],
}

const betaManifest: RepoPlansManifest = {
  repository: 'JuniMods/Beta',
  generatedAt: '2026-01-02T00:00:00.000Z',
  totalPlans: 1,
  plans: [{ type: PlanType.BUG_FIX, scope: 'ui', priority: Priority.LOW }],
}

describe('plans store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('loads repository plans and exposes computed getters', () => {
    const store = usePlansStore()

    store.loadRepositoryPlans(alphaManifest)
    store.loadRepositoryPlans(betaManifest)

    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
    expect(store.repositories).toEqual(['JuniMods/Alpha', 'JuniMods/Beta'])
    expect(store.currentRepository).toBe('JuniMods/Alpha')
    expect(store.currentPlans).toHaveLength(2)
    expect(store.totalPlans).toBe(3)
    expect(store.plansByRepository('JuniMods/Beta')).toEqual(betaManifest.plans)
  })

  it('supports replacing all loaded plans in batch', () => {
    const store = usePlansStore()
    store.loadRepositoryPlans(alphaManifest)
    store.selectRepository('JuniMods/Alpha')

    store.loadRepositoryPlansBatch([betaManifest])

    expect(store.repositories).toEqual(['JuniMods/Beta'])
    expect(store.currentRepository).toBe('JuniMods/Beta')
    expect(store.currentPlans).toEqual(betaManifest.plans)
    expect(store.error).toBeNull()
  })

  it('reports error when selecting unknown repository', () => {
    const store = usePlansStore()
    store.loadRepositoryPlans(alphaManifest)

    store.selectRepository('JuniMods/Unknown')

    expect(store.currentRepository).toBeNull()
    expect(store.error).toBe('Repository JuniMods/Unknown has no loaded plans')
  })

  it('captures validation errors for invalid manifests', () => {
    const store = usePlansStore()

    store.loadRepositoryPlans({
      ...alphaManifest,
      totalPlans: 99,
    } as RepoPlansManifest)

    expect(store.loading).toBe(false)
    expect(store.repositories).toEqual([])
    expect(store.currentRepository).toBeNull()
    expect(store.error).toContain('Invalid repository plans manifest payload')
  })

  it('resets batch state when one manifest in batch is invalid', () => {
    const store = usePlansStore()
    store.loadRepositoryPlans(alphaManifest)

    store.loadRepositoryPlansBatch([
      betaManifest,
      {
        ...alphaManifest,
        totalPlans: 99,
      } as RepoPlansManifest,
    ])

    expect(store.repositories).toEqual([])
    expect(store.currentRepository).toBeNull()
    expect(store.error).toContain('Invalid repository plans manifest payload')
  })
})
