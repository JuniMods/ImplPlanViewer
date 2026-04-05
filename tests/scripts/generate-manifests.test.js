const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const {
  generateManifests,
  assertNoDuplicatePlanIds,
  repositoryToFilename,
} = require('../../scripts/generate-manifests.js')

const outputDir = path.join(process.cwd(), 'tests', 'scripts', 'output-manifests')

const cleanOutput = () => {
  fs.rmSync(outputDir, { recursive: true, force: true })
}

test('repositoryToFilename creates deterministic file names', () => {
  assert.equal(repositoryToFilename('JuniMods/ImplPlanViewer'), 'junimods-implplanviewer-plans.json')
})

test('generateManifests writes repository and per-repository manifest files', () => {
  cleanOutput()

  const result = generateManifests({
    outputDir,
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
        topics: ['impl-plan-viewer'],
        planCount: 0,
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ],
    parsedResults: [
      {
        repository: 'JuniMods/ImplPlanViewer',
        plans: [{ id: 'JuniMods/ImplPlanViewer-001_test', number: 1, type: 'chore', scope: 'CI', priority: 'high' }],
      },
    ],
  })

  const repositoriesPath = path.join(outputDir, 'repositories.json')
  const repoPath = path.join(outputDir, 'junimods-implplanviewer-plans.json')

  assert.equal(result.summary.totalRepositories, 1)
  assert.equal(result.summary.totalPlans, 1)
  assert.equal(fs.existsSync(repositoriesPath), true)
  assert.equal(fs.existsSync(repoPath), true)

  const repositoriesPayload = JSON.parse(fs.readFileSync(repositoriesPath, 'utf8'))
  assert.equal(repositoriesPayload.totalRepositories, 1)
  assert.equal(repositoriesPayload.repositories[0].planCount, 1)
})

test('assertNoDuplicatePlanIds throws on duplicate ids', () => {
  assert.throws(() => {
    assertNoDuplicatePlanIds(
      new Map([
        ['JuniMods/A', [{ id: 'same' }]],
        ['JuniMods/B', [{ id: 'same' }]],
      ]),
    )
  }, /Duplicate plan id/)
})
