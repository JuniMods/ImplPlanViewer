import { defineStore } from 'pinia'

import type { RepositoriesManifest, Repository } from '../types'
import { assertValidRepositoriesManifest } from '../utils'

interface RepositoriesState {
  all: Repository[]
  current: Repository | null
  loading: boolean
  error: string | null
}

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Failed to load repositories'

export const useRepositoriesStore = defineStore('repositories', {
  state: (): RepositoriesState => ({
    all: [],
    current: null,
    loading: false,
    error: null,
  }),

  getters: {
    currentId: (state): Repository['id'] | null => state.current?.id ?? null,

    repoById: (state) => (id: Repository['id']): Repository | undefined =>
      state.all.find((repository) => repository.id === id),

    sortedByPlanCount: (state): Repository[] =>
      [...state.all].sort((left, right) => right.planCount - left.planCount || left.name.localeCompare(right.name)),

    privateRepos: (state): Repository[] => state.all.filter((repository) => repository.private),

    publicRepos: (state): Repository[] => state.all.filter((repository) => !repository.private),
  },

  actions: {
    loadRepositories(manifest: RepositoriesManifest): void {
      this.loading = true
      this.error = null

      try {
        assertValidRepositoriesManifest(manifest)

        const previousRepositoryId = this.current?.id
        this.all = [...manifest.repositories]

        if (previousRepositoryId !== undefined) {
          this.current = this.all.find((repository) => repository.id === previousRepositoryId) ?? null
        } else {
          this.current = this.all[0] ?? null
        }
      } catch (error) {
        this.all = []
        this.current = null
        this.error = getErrorMessage(error)
      } finally {
        this.loading = false
      }
    },

    selectRepository(id: Repository['id']): void {
      const repository = this.all.find((entry) => entry.id === id)

      if (!repository) {
        this.error = `Repository with id ${id} not found`
        this.current = null
        return
      }

      this.current = repository
      this.error = null
    },

    selectRepositoryByName(fullName: string): void {
      const repository = this.all.find((entry) => entry.fullName === fullName)

      if (!repository) {
        this.error = `Repository with full name ${fullName} not found`
        this.current = null
        return
      }

      this.current = repository
      this.error = null
    },

    clearSelection(): void {
      this.current = null
      this.error = null
    },
  },
})
