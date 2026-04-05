const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const { generateManifests } = require('../../scripts/generate-manifests.js')
const { validateManifests } = require('../../scripts/validate-manifests.js')

const outputDir = path.join(process.cwd(), 'tests', 'scripts', 'output-validation')

const repository = {
  id: 1,
  name: 'ImplPlanViewer',
  fullName: 'JuniMods/ImplPlanViewer',
  description: null,
  htmlUrl: 'https://github.com/JuniMods/ImplPlanViewer',
  defaultBranch: 'main',
  private: false,
  archived: false,
  disabled: false,
  topics: ['impl-plan-viewer'],
  planCount: 0,
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const resetDir = () => fs.rmSync(outputDir, { recursive: true, force: true })

test('validateManifests succeeds for generated manifests', () => {
  resetDir()
  generateManifests({
    outputDir,
    repositories: [repository],
    parsedResults: [
      {
        repository: repository.fullName,
        plans: [{ id: 'p1', number: 1, type: 'feature', scope: 'CI', priority: 'high' }],
      },
    ],
  })

  const result = validateManifests({ dataDir: outputDir })
  assert.equal(result.valid, true)
  assert.equal(result.errors.length, 0)
})

test('validateManifests reports cross-manifest count mismatch', () => {
  resetDir()
  generateManifests({
    outputDir,
    repositories: [repository],
    parsedResults: [
      {
        repository: repository.fullName,
        plans: [{ id: 'p1', number: 1, type: 'feature', scope: 'CI', priority: 'high' }],
      },
    ],
  })

  const repositoriesPath = path.join(outputDir, 'repositories.json')
  const repositoriesManifest = JSON.parse(fs.readFileSync(repositoriesPath, 'utf8'))
  repositoriesManifest.repositories[0].planCount = 99
  fs.writeFileSync(repositoriesPath, JSON.stringify(repositoriesManifest, null, 2), 'utf8')

  const result = validateManifests({ dataDir: outputDir })
  assert.equal(result.valid, false)
  assert.ok(result.errors.some((error) => error.includes('planCount')))
})

test('validateManifests warns about orphan manifest files', () => {
  resetDir()
  fs.mkdirSync(outputDir, { recursive: true })
  fs.writeFileSync(
    path.join(outputDir, 'repositories.json'),
    JSON.stringify({ version: '1.0.0', generatedAt: '2026-01-01T00:00:00.000Z', totalRepositories: 0, repositories: [] }, null, 2),
    'utf8',
  )
  fs.writeFileSync(path.join(outputDir, 'orphan-plans.json'), '{}', 'utf8')

  const result = validateManifests({ dataDir: outputDir })
  assert.equal(result.valid, true)
  assert.ok(result.warnings.some((warning) => warning.includes('Orphaned manifest file')))
})
