#!/usr/bin/env node

const fs = require('node:fs')
const path = require('node:path')

const { repositoryToFilename } = require('./generate-manifests.js')

const PLAN_TYPES = new Set(['feature', 'enhancement', 'bug fix', 'refactor', 'chore'])
const PRIORITIES = new Set(['critical', 'high', 'medium', 'low'])

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'))

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0
const isBoolean = (value) => typeof value === 'boolean'
const isNonNegativeInteger = (value) => Number.isInteger(value) && value >= 0

const validateRepository = (repository, index, errors) => {
  const prefix = `repositories[${index}]`
  if (!Number.isFinite(repository.id)) errors.push(`${prefix}.id must be a number`)
  if (!isNonEmptyString(repository.name)) errors.push(`${prefix}.name must be a non-empty string`)
  if (!isNonEmptyString(repository.fullName)) errors.push(`${prefix}.fullName must be a non-empty string`)
  if (!(repository.description === null || typeof repository.description === 'string')) {
    errors.push(`${prefix}.description must be null or string`)
  }
  if (!isNonEmptyString(repository.htmlUrl)) errors.push(`${prefix}.htmlUrl must be a non-empty string`)
  if (!isNonEmptyString(repository.defaultBranch)) {
    errors.push(`${prefix}.defaultBranch must be a non-empty string`)
  }
  if (!isBoolean(repository.private)) errors.push(`${prefix}.private must be boolean`)
  if (!isBoolean(repository.archived)) errors.push(`${prefix}.archived must be boolean`)
  if (!isBoolean(repository.disabled)) errors.push(`${prefix}.disabled must be boolean`)
  if (!Array.isArray(repository.topics) || !repository.topics.every((topic) => typeof topic === 'string')) {
    errors.push(`${prefix}.topics must be an array of strings`)
  }
  if (!isNonNegativeInteger(repository.planCount)) {
    errors.push(`${prefix}.planCount must be a non-negative integer`)
  }
  if (!isNonEmptyString(repository.updatedAt)) errors.push(`${prefix}.updatedAt must be a non-empty string`)
}

const validatePlanMetadata = (plan, index, repository, errors) => {
  const prefix = `${repository}.plans[${index}]`
  if (!PLAN_TYPES.has(plan.type)) errors.push(`${prefix}.type is invalid`)
  if (!isNonEmptyString(plan.scope)) errors.push(`${prefix}.scope must be a non-empty string`)
  if (!PRIORITIES.has(plan.priority)) errors.push(`${prefix}.priority is invalid`)
}

const validateManifests = ({ dataDir = 'plan-viewer/src/data' } = {}) => {
  const errors = []
  const warnings = []

  const repositoriesPath = path.join(dataDir, 'repositories.json')
  if (!fs.existsSync(repositoriesPath)) {
    return {
      valid: false,
      errors: ['repositories.json not found'],
      warnings,
    }
  }

  const repositoriesManifest = readJson(repositoriesPath)
  if (!isNonEmptyString(repositoriesManifest.version)) errors.push('repositories.version must be a non-empty string')
  if (!isNonEmptyString(repositoriesManifest.generatedAt)) {
    errors.push('repositories.generatedAt must be a non-empty string')
  }
  if (!isNonNegativeInteger(repositoriesManifest.totalRepositories)) {
    errors.push('repositories.totalRepositories must be a non-negative integer')
  }
  if (!Array.isArray(repositoriesManifest.repositories)) {
    errors.push('repositories.repositories must be an array')
  }

  const repositories = Array.isArray(repositoriesManifest.repositories)
    ? repositoriesManifest.repositories
    : []

  if (repositoriesManifest.totalRepositories !== repositories.length) {
    errors.push('repositories.totalRepositories does not match repositories length')
  }

  const referencedFiles = new Set(['repositories.json'])
  const seenIds = new Set()

  for (let index = 0; index < repositories.length; index += 1) {
    const repository = repositories[index]
    validateRepository(repository, index, errors)

    if (seenIds.has(repository.id)) {
      errors.push(`Duplicate repository id detected: ${repository.id}`)
    }
    seenIds.add(repository.id)

    const fileName = repositoryToFilename(repository.fullName)
    const repoManifestPath = path.join(dataDir, fileName)
    referencedFiles.add(fileName)

    if (!fs.existsSync(repoManifestPath)) {
      errors.push(`Missing repository manifest file: ${fileName}`)
      continue
    }

    const repoManifest = readJson(repoManifestPath)
    if (repoManifest.repository !== repository.fullName) {
      errors.push(`${fileName}: repository field mismatch`)
    }
    if (!Array.isArray(repoManifest.plans)) {
      errors.push(`${fileName}: plans must be an array`)
      continue
    }

    if (!isNonNegativeInteger(repoManifest.totalPlans)) {
      errors.push(`${fileName}: totalPlans must be a non-negative integer`)
    }

    if (repoManifest.totalPlans !== repoManifest.plans.length) {
      errors.push(`${fileName}: totalPlans does not match plans length`)
    }

    if (repository.planCount !== repoManifest.totalPlans) {
      errors.push(`${fileName}: repository planCount does not match totalPlans`)
    }

    repoManifest.plans.forEach((plan, planIndex) =>
      validatePlanMetadata(plan, planIndex, repository.fullName, errors),
    )
  }

  if (fs.existsSync(dataDir)) {
    const allJsonFiles = fs.readdirSync(dataDir).filter((entry) => entry.endsWith('.json'))
    for (const file of allJsonFiles) {
      if (!referencedFiles.has(file)) {
        warnings.push(`Orphaned manifest file detected: ${file}`)
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

const runCli = () => {
  const dataDir = process.env.MANIFEST_DATA_DIR || process.argv[2] || 'plan-viewer/src/data'
  const result = validateManifests({ dataDir })
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
  if (!result.valid) {
    process.exitCode = 1
  }
}

if (require.main === module) {
  runCli()
}

module.exports = {
  validateManifests,
}
