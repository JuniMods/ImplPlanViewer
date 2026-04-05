import { defineStore } from 'pinia'

import type { PlanMetadata, RepoPlansManifest } from '../types'
import { assertValidRepoPlansManifest } from '../utils'

interface PlansState {
  byRepository: Record<string, PlanMetadata[]>
  currentRepository: string | null
  loading: boolean
  error: string | null
}

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Failed to load plans'

export const usePlansStore = defineStore('plans', {
  state: (): PlansState => ({
    byRepository: {},
    currentRepository: null,
    loading: false,
    error: null,
  }),

  getters: {
    repositories: (state): string[] => Object.keys(state.byRepository).sort(),

    currentPlans: (state): PlanMetadata[] =>
      state.currentRepository ? state.byRepository[state.currentRepository] ?? [] : [],

    totalPlans: (state): number =>
      Object.values(state.byRepository).reduce((total, plans) => total + plans.length, 0),

    plansByRepository: (state) => (repository: string): PlanMetadata[] =>
      state.byRepository[repository] ?? [],
  },

  actions: {
    loadRepositoryPlans(manifest: RepoPlansManifest): void {
      this.loading = true
      this.error = null

      try {
        assertValidRepoPlansManifest(manifest)

        this.byRepository = {
          ...this.byRepository,
          [manifest.repository]: [...manifest.plans],
        }

        if (this.currentRepository === null) {
          this.currentRepository = manifest.repository
        }
      } catch (error) {
        this.error = getErrorMessage(error)
      } finally {
        this.loading = false
      }
    },

    loadRepositoryPlansBatch(manifests: RepoPlansManifest[]): void {
      this.loading = true
      this.error = null

      try {
        const nextByRepository: Record<string, PlanMetadata[]> = {}

        for (const manifest of manifests) {
          assertValidRepoPlansManifest(manifest)
          nextByRepository[manifest.repository] = [...manifest.plans]
        }

        this.byRepository = nextByRepository

        if (this.currentRepository && nextByRepository[this.currentRepository]) {
          return
        }

        this.currentRepository = Object.keys(nextByRepository)[0] ?? null
      } catch (error) {
        this.byRepository = {}
        this.currentRepository = null
        this.error = getErrorMessage(error)
      } finally {
        this.loading = false
      }
    },

    selectRepository(repository: string): void {
      if (!this.byRepository[repository]) {
        this.currentRepository = null
        this.error = `Repository ${repository} has no loaded plans`
        return
      }

      this.currentRepository = repository
      this.error = null
    },

    clearSelection(): void {
      this.currentRepository = null
      this.error = null
    },
  },
})
