#!/usr/bin/env node

const fs = require('node:fs')
const path = require('node:path')

const VERSION = '1.0.0'

const repositoryToFilename = (repository) =>
  `${repository.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}-plans.json`

const ensureDirectory = (directory) => {
  fs.mkdirSync(directory, { recursive: true })
}

const buildRepositoriesManifest = ({ repositories, plansByRepository, generatedAt }) => {
  const normalizedRepositories = repositories
    .filter(Boolean)
    .map((repository) => ({
      ...repository,
      planCount: plansByRepository.get(repository.fullName)?.length ?? 0,
    }))
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))

  return {
    version: VERSION,
    generatedAt,
    totalRepositories: normalizedRepositories.length,
    repositories: normalizedRepositories,
  }
}

const buildRepoManifest = ({ repository, plans, generatedAt }) => ({
  repository,
  generatedAt,
  totalPlans: plans.length,
  plans: [...plans].sort((left, right) => {
    const leftNumber = Number(left.number ?? 0)
    const rightNumber = Number(right.number ?? 0)
    return leftNumber - rightNumber || String(left.title ?? '').localeCompare(String(right.title ?? ''))
  }),
})

const assertNoDuplicatePlanIds = (plansByRepository) => {
  const seen = new Map()
  for (const [repository, plans] of plansByRepository.entries()) {
    for (const plan of plans) {
      if (!plan.id) {
        continue
      }

      if (seen.has(plan.id)) {
        throw new Error(`Duplicate plan id "${plan.id}" found in ${seen.get(plan.id)} and ${repository}`)
      }

      seen.set(plan.id, repository)
    }
  }
}

const generateManifests = ({ repositories, parsedResults, outputDir = 'plan-viewer/src/data' }) => {
  const generatedAt = new Date().toISOString()
  const plansByRepository = new Map()

  for (const result of parsedResults ?? []) {
    if (!result || typeof result.repository !== 'string' || !Array.isArray(result.plans)) {
      continue
    }
    plansByRepository.set(result.repository, result.plans)
  }

  assertNoDuplicatePlanIds(plansByRepository)
  ensureDirectory(outputDir)

  const repositoriesManifest = buildRepositoriesManifest({
    repositories: repositories ?? [],
    plansByRepository,
    generatedAt,
  })

  const writtenFiles = []
  const repositoriesPath = path.join(outputDir, 'repositories.json')
  fs.writeFileSync(repositoriesPath, JSON.stringify(repositoriesManifest, null, 2), 'utf8')
  writtenFiles.push(repositoriesPath)

  let totalPlans = 0
  for (const repository of repositoriesManifest.repositories) {
    const plans = plansByRepository.get(repository.fullName) ?? []
    totalPlans += plans.length

    const repoManifest = buildRepoManifest({
      repository: repository.fullName,
      plans,
      generatedAt,
    })

    const repoManifestPath = path.join(outputDir, repositoryToFilename(repository.fullName))
    fs.writeFileSync(repoManifestPath, JSON.stringify(repoManifest, null, 2), 'utf8')
    writtenFiles.push(repoManifestPath)
  }

  return {
    generatedAt,
    writtenFiles,
    repositoriesManifest,
    summary: {
      totalRepositories: repositoriesManifest.totalRepositories,
      totalPlans,
    },
  }
}

const parseInput = async () => {
  const stdinPayload = await new Promise((resolve) => {
    let input = ''
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', (chunk) => {
      input += chunk
    })
    process.stdin.on('end', () => resolve(input.trim()))
    process.stdin.on('error', () => resolve(''))
  })

  const raw = process.env.MANIFEST_INPUT || stdinPayload
  if (!raw) {
    throw new Error('Input payload required via MANIFEST_INPUT or stdin')
  }

  return JSON.parse(raw)
}

const writeActionOutputs = (result) => {
  if (!process.env.GITHUB_OUTPUT) {
    return
  }

  const output = [
    `generated_at=${result.generatedAt}`,
    `total_repositories=${result.summary.totalRepositories}`,
    `total_plans=${result.summary.totalPlans}`,
    `written_files=${JSON.stringify(result.writtenFiles)}`,
  ].join('\n')

  fs.appendFileSync(process.env.GITHUB_OUTPUT, `${output}\n`, 'utf8')
}

const runCli = async () => {
  const input = await parseInput()
  const result = generateManifests(input)
  writeActionOutputs(result)
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
}

if (require.main === module) {
  runCli().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}

module.exports = {
  generateManifests,
  repositoryToFilename,
  assertNoDuplicatePlanIds,
}
