import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { isValidRepoPlansManifest, isValidRepositoriesManifest } from '../../../src/utils'

const dataDir = path.resolve(__dirname, '../../../public/data')

const readJson = (filename: string): unknown => {
  const content = fs.readFileSync(path.join(dataDir, filename), 'utf8')
  return JSON.parse(content)
}

const repositoryToMockFilename = (repository: string): string =>
  `${repository.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}-plans.mock.json`

describe('mock manifests in public/data', () => {
  it('contains a valid repositories mock manifest', () => {
    const repositoriesManifest = readJson('repositories.mock.json')

    expect(isValidRepositoriesManifest(repositoriesManifest)).toBe(true)
  })

  it('contains matching valid repository plan mock manifests', () => {
    const repositoriesManifest = readJson('repositories.mock.json') as {
      repositories: Array<{ fullName: string }>
      totalRepositories: number
    }

    expect(repositoriesManifest.repositories).toHaveLength(repositoriesManifest.totalRepositories)

    for (const repository of repositoriesManifest.repositories) {
      const fileName = repositoryToMockFilename(repository.fullName)
      const filePath = path.join(dataDir, fileName)

      expect(fs.existsSync(filePath)).toBe(true)

      const repoPlansManifest = readJson(fileName) as {
        repository: string
        plans: unknown[]
        totalPlans: number
      }

      expect(isValidRepoPlansManifest(repoPlansManifest)).toBe(true)
      expect(repoPlansManifest.repository).toBe(repository.fullName)
      expect(repoPlansManifest.plans).toHaveLength(repoPlansManifest.totalPlans)
    }
  })
})
