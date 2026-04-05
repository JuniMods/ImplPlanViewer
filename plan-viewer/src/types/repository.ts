export interface Repository {
  id: number
  name: string
  fullName: string
  description: string | null
  htmlUrl: string
  defaultBranch: string
  private: boolean
  archived: boolean
  disabled: boolean
  topics: string[]
  planCount: number
  updatedAt: string
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const hasString = (value: Record<string, unknown>, key: string): boolean =>
  typeof value[key] === 'string'

const hasBoolean = (value: Record<string, unknown>, key: string): boolean =>
  typeof value[key] === 'boolean'

const hasNumber = (value: Record<string, unknown>, key: string): boolean =>
  typeof value[key] === 'number' && Number.isFinite(value[key] as number)

const hasStringArray = (value: Record<string, unknown>, key: string): boolean =>
  Array.isArray(value[key]) && (value[key] as unknown[]).every((entry) => typeof entry === 'string')

export const isRepository = (value: unknown): value is Repository => {
  if (!isObject(value)) {
    return false
  }

  return (
    hasNumber(value, 'id') &&
    hasString(value, 'name') &&
    hasString(value, 'fullName') &&
    (value.description === null || typeof value.description === 'string') &&
    hasString(value, 'htmlUrl') &&
    hasString(value, 'defaultBranch') &&
    hasBoolean(value, 'private') &&
    hasBoolean(value, 'archived') &&
    hasBoolean(value, 'disabled') &&
    hasStringArray(value, 'topics') &&
    hasNumber(value, 'planCount') &&
    hasString(value, 'updatedAt')
  )
}

export const assertRepository = (value: unknown): asserts value is Repository => {
  if (!isRepository(value)) {
    throw new TypeError('Invalid repository payload')
  }
}

export const isRepositoryList = (value: unknown): value is Repository[] =>
  Array.isArray(value) && value.every((entry) => isRepository(entry))
