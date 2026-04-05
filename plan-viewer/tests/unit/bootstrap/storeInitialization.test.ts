import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { usePlansStore, useRepositoriesStore } from '../../../src/stores'
import { PlanType, Priority } from '../../../src/types'
import type { RepoPlansManifest, RepositoriesManifest } from '../../../src/types'
import {
  extractBundledManifests,
  initializeStoresFromBundledManifests,
} from '../../../src/bootstrap/storeInitialization'

const repositoriesManifest: RepositoriesManifest = {
  version: '1.0.0',
  generatedAt: '2026-01-01T00:00:00.000Z',
  totalRepositories: 2,
  repositories: [
    {
      id: 1,
      name: 'Alpha',
      fullName: 'JuniMods/Alpha',
      description: null,
      htmlUrl: 'https://github.com/JuniMods/Alpha',
      defaultBranch: 'main',
      private: false,
      archived: false,
      disabled: false,
      topics: ['planning'],
      planCount: 1,
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 2,
      name: 'Beta',
      fullName: 'JuniMods/Beta',
      description: null,
      htmlUrl: 'https://github.com/JuniMods/Beta',
      defaultBranch: 'main',
      private: false,
      archived: false,
      disabled: false,
      topics: ['planning'],
      planCount: 1,
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ],
}

const emptyRepositoriesManifest: RepositoriesManifest = {
  version: '1.0.0',
  generatedAt: '2026-01-01T00:00:00.000Z',
  totalRepositories: 0,
  repositories: [],
}

const alphaPlansManifest: RepoPlansManifest = {
  repository: 'JuniMods/Alpha',
  generatedAt: '2026-01-01T00:00:00.000Z',
  totalPlans: 1,
  plans: [{ type: PlanType.FEATURE, scope: 'stores', priority: Priority.HIGH }],
}

const betaPlansManifest: RepoPlansManifest = {
  repository: 'JuniMods/Beta',
  generatedAt: '2026-01-01T00:00:00.000Z',
  totalPlans: 1,
  plans: [{ type: PlanType.BUG_FIX, scope: 'ui', priority: Priority.MEDIUM }],
}

describe('store initialization from bundled manifests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('loads repositories and repository plans into stores', () => {
    const pinia = createPinia()
    const result = initializeStoresFromBundledManifests(pinia, [
      repositoriesManifest,
      alphaPlansManifest,
      betaPlansManifest,
    ])

    const repositoriesStore = useRepositoriesStore(pinia)
    const plansStore = usePlansStore(pinia)

    expect(result.repositoriesLoaded).toBe(true)
    expect(result.repositoriesCount).toBe(2)
    expect(result.repositoryPlansLoaded).toBe(2)
    expect(result.issues).toEqual([])
    expect(repositoriesStore.all).toHaveLength(2)
    expect(plansStore.repositories).toEqual(['JuniMods/Alpha', 'JuniMods/Beta'])
    expect(plansStore.totalPlans).toBe(2)
  })

  it('reports missing manifests as store initialization errors', () => {
    const pinia = createPinia()
    const result = initializeStoresFromBundledManifests(pinia, [])

    const repositoriesStore = useRepositoriesStore(pinia)
    const plansStore = usePlansStore(pinia)

    expect(result.repositoriesLoaded).toBe(false)
    expect(result.repositoriesCount).toBe(0)
    expect(result.repositoryPlansLoaded).toBe(0)
    expect(repositoriesStore.error).toContain('Repositories manifest was not found in bundled data')
    expect(plansStore.error).toBeNull()
  })

  it('detects invalid and duplicate manifest payloads', () => {
    const extraction = extractBundledManifests([
      { ...repositoriesManifest, totalRepositories: 999 },
      repositoriesManifest,
      alphaPlansManifest,
      alphaPlansManifest,
    ])

    expect(extraction.repositoriesManifest).toEqual(repositoriesManifest)
    expect(extraction.repoPlansManifests).toEqual([alphaPlansManifest])
    expect(extraction.repositoryIssues).toContain('Invalid repositories manifest payload found in bundled data')
    expect(extraction.planIssues).toContain('Duplicate plans manifest for JuniMods/Alpha ignored')
  })

  it('does not report missing plan manifests when no repositories are discovered', () => {
    const pinia = createPinia()
    const result = initializeStoresFromBundledManifests(pinia, [emptyRepositoriesManifest])

    const repositoriesStore = useRepositoriesStore(pinia)
    const plansStore = usePlansStore(pinia)

    expect(result.repositoriesLoaded).toBe(true)
    expect(result.repositoriesCount).toBe(0)
    expect(result.repositoryPlansLoaded).toBe(0)
    expect(repositoriesStore.error).toBeNull()
    expect(plansStore.error).toBeNull()
  })
})
