import type { Pinia } from 'pinia'

import type { RepoPlansManifest, RepositoriesManifest } from '../types'
import { usePlansStore, useRepositoriesStore } from '../stores'
import { isValidRepoPlansManifest, isValidRepositoriesManifest } from '../utils'

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const appendIssue = (current: string | null, issue: string): string =>
  current ? `${current}; ${issue}` : issue

const isRepositoriesCandidate = (value: unknown): boolean =>
  isObject(value) && ('repositories' in value || 'totalRepositories' in value)

const isRepoPlansCandidate = (value: unknown): boolean =>
  isObject(value) && ('repository' in value || 'plans' in value || 'totalPlans' in value)

export interface BundledManifestExtractionResult {
  repositoriesManifest: RepositoriesManifest | null
  repoPlansManifests: RepoPlansManifest[]
  repositoryIssues: string[]
  planIssues: string[]
}

export interface StoreInitializationResult {
  repositoriesLoaded: boolean
  repositoriesCount: number
  repositoryPlansLoaded: number
  issues: string[]
}

export const loadBundledManifestPayloads = (): unknown[] => {
  const srcData = import.meta.glob<unknown>('../data/**/*.json', { eager: true, import: 'default' })
  const rootData = import.meta.glob<unknown>('../../data/**/*.json', { eager: true, import: 'default' })

  return [...Object.values(srcData), ...Object.values(rootData)]
}

export const extractBundledManifests = (payloads: unknown[]): BundledManifestExtractionResult => {
  const repositoryIssues: string[] = []
  const planIssues: string[] = []
  let repositoriesManifest: RepositoriesManifest | null = null
  const repoPlansByRepository = new Map<string, RepoPlansManifest>()

  for (const payload of payloads) {
    if (isValidRepositoriesManifest(payload)) {
      if (repositoriesManifest !== null) {
        repositoryIssues.push('Multiple repositories manifests detected; using the first valid manifest')
        continue
      }

      repositoriesManifest = payload
      continue
    }

    if (isRepositoriesCandidate(payload)) {
      repositoryIssues.push('Invalid repositories manifest payload found in bundled data')
      continue
    }

    if (isValidRepoPlansManifest(payload)) {
      if (repoPlansByRepository.has(payload.repository)) {
        planIssues.push(`Duplicate plans manifest for ${payload.repository} ignored`)
        continue
      }

      repoPlansByRepository.set(payload.repository, payload)
      continue
    }

    if (isRepoPlansCandidate(payload)) {
      planIssues.push('Invalid repository plans manifest payload found in bundled data')
    }
  }

  if (repositoriesManifest === null) {
    repositoryIssues.push('Repositories manifest was not found in bundled data')
  }

  if ((repositoriesManifest?.totalRepositories ?? 0) > 0 && repoPlansByRepository.size === 0) {
    planIssues.push('Repository plans manifests were not found in bundled data')
  }

  return {
    repositoriesManifest,
    repoPlansManifests: [...repoPlansByRepository.values()],
    repositoryIssues,
    planIssues,
  }
}

export const initializeStoresFromBundledManifests = (
  pinia: Pinia,
  payloads: unknown[] = loadBundledManifestPayloads(),
): StoreInitializationResult => {
  const repositoriesStore = useRepositoriesStore(pinia)
  const plansStore = usePlansStore(pinia)

  const { repositoriesManifest, repoPlansManifests, repositoryIssues, planIssues } =
    extractBundledManifests(payloads)

  if (repositoriesManifest !== null) {
    repositoriesStore.loadRepositories(repositoriesManifest)
  }

  if (repoPlansManifests.length > 0) {
    plansStore.loadRepositoryPlansBatch(repoPlansManifests)
  }

  if (repositoryIssues.length > 0) {
    repositoriesStore.error = appendIssue(repositoriesStore.error, repositoryIssues.join('; '))
  }

  if (planIssues.length > 0) {
    plansStore.error = appendIssue(plansStore.error, planIssues.join('; '))
  }

  return {
    repositoriesLoaded: repositoriesManifest !== null,
    repositoriesCount: repositoriesManifest?.totalRepositories ?? 0,
    repositoryPlansLoaded: repoPlansManifests.length,
    issues: [...repositoryIssues, ...planIssues],
  }
}
