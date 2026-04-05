import type { RepoPlansManifest, RepositoriesManifest } from '../../types'

import { isValidPlanMetadata } from './plan'
import { isValidRepositoryList, validateRepositoryList } from './repository'

type RepositoriesManifestField = keyof RepositoriesManifest
type RepoPlansManifestField = keyof RepoPlansManifest

export interface ManifestValidationIssue<Field extends string> {
  field: Field
  message: string
}

export interface ManifestValidationResult<Field extends string> {
  valid: boolean
  issues: ManifestValidationIssue<Field>[]
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0

const isNonNegativeInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0

export const validateRepositoriesManifest = (
  value: unknown,
): ManifestValidationResult<RepositoriesManifestField> => {
  const issues: ManifestValidationIssue<RepositoriesManifestField>[] = []

  if (!isObject(value)) {
    return {
      valid: false,
      issues: [
        { field: 'version', message: 'Version is required and must be a non-empty string' },
        { field: 'generatedAt', message: 'Generated timestamp is required and must be a non-empty string' },
        {
          field: 'totalRepositories',
          message: 'Total repositories is required and must be a non-negative integer',
        },
        { field: 'repositories', message: 'Repositories is required and must be a valid repository list' },
      ],
    }
  }

  if (!isNonEmptyString(value.version)) {
    issues.push({ field: 'version', message: 'Version is required and must be a non-empty string' })
  }

  if (!isNonEmptyString(value.generatedAt)) {
    issues.push({
      field: 'generatedAt',
      message: 'Generated timestamp is required and must be a non-empty string',
    })
  }

  if (!isNonNegativeInteger(value.totalRepositories)) {
    issues.push({
      field: 'totalRepositories',
      message: 'Total repositories is required and must be a non-negative integer',
    })
  }

  const repositoryListValidation = validateRepositoryList(value.repositories)

  if (!repositoryListValidation.valid) {
    issues.push({
      field: 'repositories',
      message: 'Repositories is required and must be a valid repository list',
    })
  } else if (isValidRepositoryList(value.repositories) && value.totalRepositories !== value.repositories.length) {
    issues.push({
      field: 'totalRepositories',
      message: 'Total repositories must match repositories length',
    })
  }

  return {
    valid: issues.length === 0,
    issues,
  }
}

export const isValidRepositoriesManifest = (value: unknown): value is RepositoriesManifest =>
  validateRepositoriesManifest(value).valid

export function assertValidRepositoriesManifest(
  value: unknown,
): asserts value is RepositoriesManifest {
  const validationResult = validateRepositoriesManifest(value)
  if (!validationResult.valid) {
    throw new TypeError(
      `Invalid repositories manifest payload: ${validationResult.issues
        .map((issue) => `${issue.field} (${issue.message})`)
        .join(', ')}`,
    )
  }
}

export const validateRepoPlansManifest = (
  value: unknown,
): ManifestValidationResult<RepoPlansManifestField> => {
  const issues: ManifestValidationIssue<RepoPlansManifestField>[] = []

  if (!isObject(value)) {
    return {
      valid: false,
      issues: [
        { field: 'repository', message: 'Repository is required and must be a non-empty string' },
        { field: 'generatedAt', message: 'Generated timestamp is required and must be a non-empty string' },
        {
          field: 'totalPlans',
          message: 'Total plans is required and must be a non-negative integer',
        },
        { field: 'plans', message: 'Plans is required and must contain valid plan metadata entries' },
      ],
    }
  }

  if (!isNonEmptyString(value.repository)) {
    issues.push({ field: 'repository', message: 'Repository is required and must be a non-empty string' })
  }

  if (!isNonEmptyString(value.generatedAt)) {
    issues.push({
      field: 'generatedAt',
      message: 'Generated timestamp is required and must be a non-empty string',
    })
  }

  if (!isNonNegativeInteger(value.totalPlans)) {
    issues.push({
      field: 'totalPlans',
      message: 'Total plans is required and must be a non-negative integer',
    })
  }

  if (!Array.isArray(value.plans) || !value.plans.every((entry) => isValidPlanMetadata(entry))) {
    issues.push({
      field: 'plans',
      message: 'Plans is required and must contain valid plan metadata entries',
    })
  } else if (value.totalPlans !== value.plans.length) {
    issues.push({ field: 'totalPlans', message: 'Total plans must match plans length' })
  }

  return {
    valid: issues.length === 0,
    issues,
  }
}

export const isValidRepoPlansManifest = (value: unknown): value is RepoPlansManifest =>
  validateRepoPlansManifest(value).valid

export function assertValidRepoPlansManifest(value: unknown): asserts value is RepoPlansManifest {
  const validationResult = validateRepoPlansManifest(value)
  if (!validationResult.valid) {
    throw new TypeError(
      `Invalid repository plans manifest payload: ${validationResult.issues
        .map((issue) => `${issue.field} (${issue.message})`)
        .join(', ')}`,
    )
  }
}
