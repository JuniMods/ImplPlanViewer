import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import type { RepositoriesManifest } from '../../../src/types'
import { useRepositoriesStore } from '../../../src/stores/repositories'

const repositoriesManifest: RepositoriesManifest = {
  version: '1.0.0',
  generatedAt: '2026-01-01T00:00:00.000Z',
  totalRepositories: 3,
  repositories: [
    {
      id: 1,
      name: 'Beta',
      fullName: 'JuniMods/Beta',
      description: 'Second repo',
      htmlUrl: 'https://github.com/JuniMods/Beta',
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
      name: 'Alpha',
      fullName: 'JuniMods/Alpha',
      description: null,
      htmlUrl: 'https://github.com/JuniMods/Alpha',
      defaultBranch: 'main',
      private: true,
      archived: false,
      disabled: false,
      topics: ['planning', 'private'],
      planCount: 5,
      updatedAt: '2026-01-02T00:00:00.000Z',
    },
    {
      id: 3,
      name: 'Gamma',
      fullName: 'JuniMods/Gamma',
      description: null,
      htmlUrl: 'https://github.com/JuniMods/Gamma',
      defaultBranch: 'develop',
      private: false,
      archived: false,
      disabled: false,
      topics: [],
      planCount: 5,
      updatedAt: '2026-01-03T00:00:00.000Z',
    },
  ],
}

describe('repositories store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('loads repositories and exposes computed getters', () => {
    const store = useRepositoriesStore()

    store.loadRepositories(repositoriesManifest)

    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
    expect(store.all).toHaveLength(3)
    expect(store.currentId).toBe(1)
    expect(store.privateRepos.map((repository) => repository.id)).toEqual([2])
    expect(store.publicRepos.map((repository) => repository.id)).toEqual([1, 3])
    expect(store.sortedByPlanCount.map((repository) => repository.id)).toEqual([2, 3, 1])
    expect(store.repoById(2)?.fullName).toBe('JuniMods/Alpha')
  })

  it('supports explicit selection and clearing', () => {
    const store = useRepositoriesStore()
    store.loadRepositories(repositoriesManifest)

    store.selectRepository(3)
    expect(store.currentId).toBe(3)

    store.selectRepositoryByName('JuniMods/Alpha')
    expect(store.currentId).toBe(2)

    store.clearSelection()
    expect(store.current).toBeNull()
    expect(store.error).toBeNull()
  })

  it('reports error when repository selection misses', () => {
    const store = useRepositoriesStore()
    store.loadRepositories(repositoriesManifest)

    store.selectRepository(999)
    expect(store.current).toBeNull()
    expect(store.error).toBe('Repository with id 999 not found')

    store.selectRepositoryByName('JuniMods/Unknown')
    expect(store.current).toBeNull()
    expect(store.error).toBe('Repository with full name JuniMods/Unknown not found')
  })

  it('captures validation errors for invalid manifests', () => {
    const store = useRepositoriesStore()

    store.loadRepositories({
      ...repositoriesManifest,
      totalRepositories: 99,
    } as RepositoriesManifest)

    expect(store.all).toEqual([])
    expect(store.current).toBeNull()
    expect(store.loading).toBe(false)
    expect(store.error).toContain('Invalid repositories manifest payload')
  })

  it('preserves the selected repository across reloads when still present', () => {
    const store = useRepositoriesStore()
    store.loadRepositories(repositoriesManifest)
    store.selectRepository(2)

    store.loadRepositories({
      ...repositoriesManifest,
      repositories: [...repositoriesManifest.repositories].reverse(),
    })

    expect(store.currentId).toBe(2)
    expect(store.error).toBeNull()
  })
})
