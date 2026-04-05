import { describe, expect, it } from 'vitest'

import {
  assertValidRepository,
  assertValidRepositoryList,
  isValidRepository,
  isValidRepositoryList,
  validateRepository,
  validateRepositoryList,
} from '../../../../src/utils/validators/repository'

const validRepository = {
  id: 1,
  name: 'ImplPlanViewer',
  fullName: 'JuniMods/ImplPlanViewer',
  description: null,
  htmlUrl: 'https://github.com/JuniMods/ImplPlanViewer',
  defaultBranch: 'main',
  private: false,
  archived: false,
  disabled: false,
  topics: ['planning'],
  planCount: 3,
  updatedAt: '2026-01-01T00:00:00.000Z',
}

describe('repository validator', () => {
  it('accepts valid repository payload', () => {
    const result = validateRepository(validRepository)

    expect(result.valid).toBe(true)
    expect(result.issues).toHaveLength(0)
    expect(isValidRepository(validRepository)).toBe(true)
  })

  it('reports invalid repository URL', () => {
    const result = validateRepository({
      ...validRepository,
      htmlUrl: 'github.com/JuniMods/ImplPlanViewer',
    })

    expect(result.valid).toBe(false)
    expect(result.issues).toEqual([
      { field: 'htmlUrl', message: 'HTML URL is required and must be a valid http(s) URL' },
    ])
  })

  it('reports duplicate IDs in repository list', () => {
    const result = validateRepositoryList([validRepository, { ...validRepository, name: 'Other repo' }])

    expect(result.valid).toBe(false)
    expect(result.issues).toEqual([
      { field: 'id', index: 1, message: 'Repository ID must be unique within repository list' },
    ])
    expect(isValidRepositoryList([validRepository, { ...validRepository, name: 'Other repo' }])).toBe(false)
  })

  it('throws in assert mode when payloads are invalid', () => {
    expect(() => assertValidRepository({ ...validRepository, id: 0 })).toThrow('Invalid repository payload')
    expect(() => assertValidRepositoryList([validRepository, { ...validRepository }])).toThrow(
      'Invalid repository list payload',
    )
  })

  it('reports required fields when repository payload is not an object', () => {
    const result = validateRepository(null)

    expect(result.valid).toBe(false)
    expect(result.issues).toHaveLength(12)
    expect(result.issues[0]).toEqual({
      field: 'id',
      message: 'ID is required and must be a positive integer',
    })
  })

  it('rejects non-array repository lists', () => {
    const result = validateRepositoryList('invalid' as unknown)

    expect(result).toEqual({
      valid: false,
      issues: [
        { field: 'repositories', message: 'Repositories is required and must be a valid repository list' },
      ],
    })
  })
})
