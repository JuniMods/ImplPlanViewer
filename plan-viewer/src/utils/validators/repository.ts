import type { Repository } from '../../types'

export type RepositoryValidationField = keyof Repository
export type RepositoryListValidationField = RepositoryValidationField | 'repositories'

export interface RepositoryValidationIssue {
  field: RepositoryValidationField
  message: string
}

export interface RepositoryValidationResult {
  valid: boolean
  issues: RepositoryValidationIssue[]
}

export interface RepositoryListValidationIssue {
  field: RepositoryListValidationField
  message: string
  index?: number
}

export interface RepositoryListValidationResult {
  valid: boolean
  issues: RepositoryListValidationIssue[]
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0

const isPositiveInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value > 0

const isNonNegativeInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0

const isValidHttpUrl = (value: string): boolean => {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export const validateRepository = (value: unknown): RepositoryValidationResult => {
  const issues: RepositoryValidationIssue[] = []

  if (!isObject(value)) {
    return {
      valid: false,
      issues: [
        { field: 'id', message: 'ID is required and must be a positive integer' },
        { field: 'name', message: 'Name is required and must be a non-empty string' },
        { field: 'fullName', message: 'Full name is required and must be a non-empty string' },
        { field: 'description', message: 'Description is required and must be null or a string' },
        { field: 'htmlUrl', message: 'HTML URL is required and must be a valid http(s) URL' },
        {
          field: 'defaultBranch',
          message: 'Default branch is required and must be a non-empty string',
        },
        { field: 'private', message: 'Private flag is required and must be a boolean' },
        { field: 'archived', message: 'Archived flag is required and must be a boolean' },
        { field: 'disabled', message: 'Disabled flag is required and must be a boolean' },
        { field: 'topics', message: 'Topics is required and must be an array of strings' },
        { field: 'planCount', message: 'Plan count is required and must be a non-negative integer' },
        { field: 'updatedAt', message: 'Updated timestamp is required and must be a non-empty string' },
      ],
    }
  }

  if (!isPositiveInteger(value.id)) {
    issues.push({ field: 'id', message: 'ID is required and must be a positive integer' })
  }

  if (!isNonEmptyString(value.name)) {
    issues.push({ field: 'name', message: 'Name is required and must be a non-empty string' })
  }

  if (!isNonEmptyString(value.fullName)) {
    issues.push({ field: 'fullName', message: 'Full name is required and must be a non-empty string' })
  }

  if (!(value.description === null || typeof value.description === 'string')) {
    issues.push({ field: 'description', message: 'Description is required and must be null or a string' })
  }

  if (!isNonEmptyString(value.htmlUrl) || !isValidHttpUrl(value.htmlUrl)) {
    issues.push({ field: 'htmlUrl', message: 'HTML URL is required and must be a valid http(s) URL' })
  }

  if (!isNonEmptyString(value.defaultBranch)) {
    issues.push({
      field: 'defaultBranch',
      message: 'Default branch is required and must be a non-empty string',
    })
  }

  if (typeof value.private !== 'boolean') {
    issues.push({ field: 'private', message: 'Private flag is required and must be a boolean' })
  }

  if (typeof value.archived !== 'boolean') {
    issues.push({ field: 'archived', message: 'Archived flag is required and must be a boolean' })
  }

  if (typeof value.disabled !== 'boolean') {
    issues.push({ field: 'disabled', message: 'Disabled flag is required and must be a boolean' })
  }

  if (!Array.isArray(value.topics) || !value.topics.every((topic) => typeof topic === 'string')) {
    issues.push({ field: 'topics', message: 'Topics is required and must be an array of strings' })
  }

  if (!isNonNegativeInteger(value.planCount)) {
    issues.push({
      field: 'planCount',
      message: 'Plan count is required and must be a non-negative integer',
    })
  }

  if (!isNonEmptyString(value.updatedAt)) {
    issues.push({
      field: 'updatedAt',
      message: 'Updated timestamp is required and must be a non-empty string',
    })
  }

  return {
    valid: issues.length === 0,
    issues,
  }
}

export const isValidRepository = (value: unknown): value is Repository => validateRepository(value).valid

export function assertValidRepository(value: unknown): asserts value is Repository {
  const validationResult = validateRepository(value)
  if (!validationResult.valid) {
    throw new TypeError(
      `Invalid repository payload: ${validationResult.issues
        .map((issue) => `${issue.field} (${issue.message})`)
        .join(', ')}`,
    )
  }
}

export const validateRepositoryList = (value: unknown): RepositoryListValidationResult => {
  if (!Array.isArray(value)) {
    return {
      valid: false,
      issues: [
        { field: 'repositories', message: 'Repositories is required and must be a valid repository list' },
      ],
    }
  }

  const issues: RepositoryListValidationIssue[] = []
  const seenIds = new Set<number>()

  value.forEach((entry, index) => {
    const result = validateRepository(entry)
    if (!result.valid) {
      result.issues.forEach((issue) => {
        issues.push({ ...issue, index })
      })
      return
    }

    if (seenIds.has(entry.id)) {
      issues.push({
        field: 'id',
        index,
        message: 'Repository ID must be unique within repository list',
      })
      return
    }

    seenIds.add(entry.id)
  })

  return {
    valid: issues.length === 0,
    issues,
  }
}

export const isValidRepositoryList = (value: unknown): value is Repository[] =>
  validateRepositoryList(value).valid

export function assertValidRepositoryList(value: unknown): asserts value is Repository[] {
  const validationResult = validateRepositoryList(value)
  if (!validationResult.valid) {
    throw new TypeError(
      `Invalid repository list payload: ${validationResult.issues
        .map((issue) => `${issue.field}${typeof issue.index === 'number' ? `@${issue.index}` : ''} (${issue.message})`)
        .join(', ')}`,
    )
  }
}
