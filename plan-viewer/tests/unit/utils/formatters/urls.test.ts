import { describe, expect, it } from 'vitest'

import { buildPlanUrl, buildRepositoryUrl } from '../../../../src/utils/formatters/urls'

describe('buildRepositoryUrl', () => {
  it('builds a GitHub repository URL from owner/repo id', () => {
    expect(buildRepositoryUrl('JuniMods/ImplPlanViewer')).toBe(
      'https://github.com/JuniMods/ImplPlanViewer',
    )
  })

  it('normalizes whitespace and surrounding slashes', () => {
    expect(buildRepositoryUrl('  /JuniMods/ImplPlanViewer/  ')).toBe(
      'https://github.com/JuniMods/ImplPlanViewer',
    )
  })

  it('returns an empty string for invalid inputs', () => {
    expect(buildRepositoryUrl('')).toBe('')
    expect(buildRepositoryUrl(null)).toBe('')
    expect(buildRepositoryUrl('JuniMods/ImplPlanViewer', '   ')).toBe('')
  })

  it('supports custom base URLs and URL-encodes path segments', () => {
    expect(buildRepositoryUrl('My Org/Repo Name', 'https://example.com/')).toBe(
      'https://example.com/My%20Org/Repo%20Name',
    )
  })
})

describe('buildPlanUrl', () => {
  it('builds a plan file URL with default branch and directory', () => {
    expect(buildPlanUrl('JuniMods/ImplPlanViewer', '001_add_authentication')).toBe(
      'https://github.com/JuniMods/ImplPlanViewer/blob/main/implementation-plans/001_add_authentication.md',
    )
  })

  it('supports custom branch, directory, and explicit file extension', () => {
    expect(
      buildPlanUrl('JuniMods/ImplPlanViewer', 'plans/042_refactor_api.md', {
        branch: 'develop',
        plansDirectory: '/implementation-plans/',
      }),
    ).toBe(
      'https://github.com/JuniMods/ImplPlanViewer/blob/develop/implementation-plans/plans/042_refactor_api.md',
    )
  })

  it('returns an empty string when repository or plan id is missing', () => {
    expect(buildPlanUrl('', '001_add_authentication')).toBe('')
    expect(buildPlanUrl('JuniMods/ImplPlanViewer', '')).toBe('')
    expect(buildPlanUrl(undefined, undefined)).toBe('')
  })

  it('URL-encodes branch, directory, and plan file segments', () => {
    expect(
      buildPlanUrl('My Org/Repo Name', 'Plan 1', {
        branch: 'release/v1',
        plansDirectory: 'implementation plans',
      }),
    ).toBe(
      'https://github.com/My%20Org/Repo%20Name/blob/release/v1/implementation%20plans/Plan%201.md',
    )
  })
})
