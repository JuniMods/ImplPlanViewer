import { describe, expect, it } from 'vitest'

import { PlanType, Priority } from '../../../../src/types'
import {
  assertValidRepoPlansManifest,
  assertValidRepositoriesManifest,
  isValidRepoPlansManifest,
  isValidRepositoriesManifest,
  validateRepoPlansManifest,
  validateRepositoriesManifest,
} from '../../../../src/utils/validators/manifest'

describe('manifest validator', () => {
  it('accepts valid repositories manifest', () => {
    const manifest = {
      version: '1.0.0',
      generatedAt: '2026-01-01T00:00:00.000Z',
      totalRepositories: 1,
      repositories: [
        {
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
        },
      ],
    }

    const result = validateRepositoriesManifest(manifest)

    expect(result.valid).toBe(true)
    expect(result.issues).toHaveLength(0)
    expect(isValidRepositoriesManifest(manifest)).toBe(true)
  })

  it('reports invalid repositories manifest fields', () => {
    const result = validateRepositoriesManifest({
      version: ' ',
      generatedAt: 10,
      totalRepositories: -1,
      repositories: [{}],
    })

    expect(result.valid).toBe(false)
    expect(result.issues).toEqual([
      { field: 'version', message: 'Version is required and must be a non-empty string' },
      {
        field: 'generatedAt',
        message: 'Generated timestamp is required and must be a non-empty string',
      },
      {
        field: 'totalRepositories',
        message: 'Total repositories is required and must be a non-negative integer',
      },
      {
        field: 'repositories',
        message: 'Repositories is required and must be a valid repository list',
      },
    ])
  })

  it('rejects repositories manifest when repository IDs are duplicated', () => {
    const result = validateRepositoriesManifest({
      version: '1.0.0',
      generatedAt: '2026-01-01T00:00:00.000Z',
      totalRepositories: 2,
      repositories: [
        {
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
        },
        {
          id: 1,
          name: 'AnotherRepo',
          fullName: 'JuniMods/AnotherRepo',
          description: null,
          htmlUrl: 'https://github.com/JuniMods/AnotherRepo',
          defaultBranch: 'main',
          private: false,
          archived: false,
          disabled: false,
          topics: ['planning'],
          planCount: 1,
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    })

    expect(result.valid).toBe(false)
    expect(result.issues).toContainEqual({
      field: 'repositories',
      message: 'Repositories is required and must be a valid repository list',
    })
  })

  it('throws in assert mode when repositories manifest is invalid', () => {
    expect(() => assertValidRepositoriesManifest(null)).toThrow('Invalid repositories manifest payload')
  })

  it('accepts valid repository plans manifest', () => {
    const manifest = {
      repository: 'JuniMods/ImplPlanViewer',
      generatedAt: '2026-01-01T00:00:00.000Z',
      totalPlans: 1,
      plans: [
        {
          type: PlanType.FEATURE,
          scope: 'validators',
          priority: Priority.MEDIUM,
        },
      ],
    }

    const result = validateRepoPlansManifest(manifest)

    expect(result.valid).toBe(true)
    expect(result.issues).toHaveLength(0)
    expect(isValidRepoPlansManifest(manifest)).toBe(true)
  })

  it('reports invalid repository plans manifest fields', () => {
    const result = validateRepoPlansManifest({
      repository: '',
      generatedAt: null,
      totalPlans: 1.2,
      plans: [{ type: 'invalid', scope: ' ', priority: 'low' }],
    })

    expect(result.valid).toBe(false)
    expect(result.issues).toEqual([
      { field: 'repository', message: 'Repository is required and must be a non-empty string' },
      {
        field: 'generatedAt',
        message: 'Generated timestamp is required and must be a non-empty string',
      },
      {
        field: 'totalPlans',
        message: 'Total plans is required and must be a non-negative integer',
      },
      {
        field: 'plans',
        message: 'Plans is required and must contain valid plan metadata entries',
      },
    ])
  })

  it('throws in assert mode when repository plans manifest is invalid', () => {
    expect(() => assertValidRepoPlansManifest(undefined)).toThrow(
      'Invalid repository plans manifest payload',
    )
  })

  it('reports total mismatch errors for manifest counts', () => {
    const repositoriesMismatch = validateRepositoriesManifest({
      version: '1.0.0',
      generatedAt: '2026-01-01T00:00:00.000Z',
      totalRepositories: 2,
      repositories: [
        {
          id: 10,
          name: 'ImplPlanViewer',
          fullName: 'JuniMods/ImplPlanViewer',
          description: null,
          htmlUrl: 'https://github.com/JuniMods/ImplPlanViewer',
          defaultBranch: 'main',
          private: false,
          archived: false,
          disabled: false,
          topics: [],
          planCount: 1,
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    })

    expect(repositoriesMismatch.issues).toContainEqual({
      field: 'totalRepositories',
      message: 'Total repositories must match repositories length',
    })

    const plansMismatch = validateRepoPlansManifest({
      repository: 'JuniMods/ImplPlanViewer',
      generatedAt: '2026-01-01T00:00:00.000Z',
      totalPlans: 2,
      plans: [{ type: PlanType.FEATURE, scope: 'ui', priority: Priority.LOW }],
    })

    expect(plansMismatch.issues).toContainEqual({
      field: 'totalPlans',
      message: 'Total plans must match plans length',
    })
  })
})
