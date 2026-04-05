import type { PlanMetadata } from './plan'
import { isPlanMetadata } from './plan'
import type { Repository } from './repository'
import { isRepositoryList } from './repository'

export interface RepositoriesManifest {
  version: string
  generatedAt: string
  totalRepositories: number
  repositories: Repository[]
}

export interface RepoPlansManifest {
  repository: string
  generatedAt: string
  totalPlans: number
  plans: PlanMetadata[]
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const hasString = (value: Record<string, unknown>, key: string): boolean =>
  typeof value[key] === 'string'

const hasNonNegativeInteger = (value: Record<string, unknown>, key: string): boolean =>
  typeof value[key] === 'number' &&
  Number.isInteger(value[key] as number) &&
  (value[key] as number) >= 0

export const isRepositoriesManifest = (value: unknown): value is RepositoriesManifest => {
  if (!isObject(value)) {
    return false
  }

  return (
    hasString(value, 'version') &&
    hasString(value, 'generatedAt') &&
    hasNonNegativeInteger(value, 'totalRepositories') &&
    isRepositoryList(value.repositories) &&
    value.totalRepositories === value.repositories.length
  )
}

export const assertRepositoriesManifest = (value: unknown): asserts value is RepositoriesManifest => {
  if (!isRepositoriesManifest(value)) {
    throw new TypeError('Invalid repositories manifest payload')
  }
}

export const isRepoPlansManifest = (value: unknown): value is RepoPlansManifest => {
  if (!isObject(value)) {
    return false
  }

  return (
    hasString(value, 'repository') &&
    hasString(value, 'generatedAt') &&
    hasNonNegativeInteger(value, 'totalPlans') &&
    Array.isArray(value.plans) &&
    value.plans.every((entry) => isPlanMetadata(entry)) &&
    value.totalPlans === value.plans.length
  )
}

export const assertRepoPlansManifest = (value: unknown): asserts value is RepoPlansManifest => {
  if (!isRepoPlansManifest(value)) {
    throw new TypeError('Invalid repository plans manifest payload')
  }
}
