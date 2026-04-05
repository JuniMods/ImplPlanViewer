#!/usr/bin/env node

const DISCOVERY_MODES = new Set(['topic', 'org'])
const PLAN_DIRECTORY = 'implementation-plans'
const API_BASE_URL = 'https://api.github.com'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const parseCsv = (value) =>
  (value ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)

const createHeaders = (token) => ({
  Accept: 'application/vnd.github+json',
  'User-Agent': 'impl-plan-viewer-discovery',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
})

const requestJson = async (url, token, options = {}) => {
  const { retries = 3 } = options
  let attempt = 0
  let waitMs = 500
  let lastError = null

  while (attempt < retries) {
    attempt += 1
    try {
      const response = await fetch(url, { headers: createHeaders(token) })
      if (response.ok) {
        return response.json()
      }

      if (response.status === 404) {
        return null
      }

      if ((response.status >= 500 || response.status === 429) && attempt < retries) {
        await delay(waitMs)
        waitMs *= 2
        continue
      }

      const body = await response.text()
      throw new Error(`GitHub API ${response.status}: ${body}`)
    } catch (error) {
      lastError = error
      if (attempt >= retries) {
        throw error
      }

      await delay(waitMs)
      waitMs *= 2
    }
  }

  throw lastError ?? new Error(`Failed request: ${url}`)
}

const normalizeRepository = (repository) => ({
  id: repository.id,
  name: repository.name,
  fullName: repository.full_name,
  description: repository.description,
  htmlUrl: repository.html_url,
  defaultBranch: repository.default_branch,
  private: Boolean(repository.private),
  archived: Boolean(repository.archived),
  disabled: Boolean(repository.disabled),
  topics: Array.isArray(repository.topics) ? repository.topics : [],
  planCount: 0,
  updatedAt: repository.updated_at,
})

const fetchTopicRepositories = async ({ token, topic }) => {
  if (!topic) {
    throw new Error('GITHUB_TOPIC is required in topic discovery mode')
  }

  const repositories = []
  let page = 1

  while (true) {
    const query = encodeURIComponent(`topic:${topic} archived:false`)
    const data = await requestJson(
      `${API_BASE_URL}/search/repositories?q=${query}&per_page=100&page=${page}`,
      token,
    )

    const items = data?.items ?? []
    repositories.push(...items)

    if (items.length < 100) {
      return repositories
    }

    page += 1
  }
}

const fetchOrgRepositories = async ({ token, org }) => {
  if (!org) {
    throw new Error('GITHUB_ORG is required in org discovery mode')
  }

  const repositories = []
  let page = 1

  while (true) {
    const data = await requestJson(
      `${API_BASE_URL}/orgs/${encodeURIComponent(org)}/repos?type=all&per_page=100&page=${page}`,
      token,
    )

    if (!Array.isArray(data) || data.length === 0) {
      return repositories
    }

    repositories.push(...data)
    if (data.length < 100) {
      return repositories
    }

    page += 1
  }
}

const hasPlanDirectory = async ({ token, fullName }) => {
  const url = `${API_BASE_URL}/repos/${fullName}/contents/${PLAN_DIRECTORY}`
  const payload = await requestJson(url, token)

  if (payload === null) {
    return false
  }

  return Array.isArray(payload)
}

const applyRepositoryFilters = ({ repositories, includeRepos, excludeRepos }) => {
  const includeSet = new Set(includeRepos)
  const excludeSet = new Set(excludeRepos)

  return repositories.filter((repository) => {
    const name = repository.full_name
    if (includeSet.size > 0 && !includeSet.has(name) && !includeSet.has(repository.name)) {
      return false
    }

    return !excludeSet.has(name) && !excludeSet.has(repository.name)
  })
}

const discoverRepositories = async (options = {}) => {
  const token = options.token ?? process.env.GITHUB_TOKEN ?? ''
  const discoveryMode = (options.discoveryMode ?? process.env.DISCOVERY_MODE ?? 'topic').toLowerCase()
  const org = options.org ?? process.env.GITHUB_ORG ?? ''
  const topic = options.topic ?? process.env.GITHUB_TOPIC ?? ''
  const includeRepos = options.includeRepos ?? parseCsv(process.env.INCLUDE_REPOS)
  const excludeRepos = options.excludeRepos ?? parseCsv(process.env.EXCLUDE_REPOS)

  if (!DISCOVERY_MODES.has(discoveryMode)) {
    throw new Error(`Unsupported discovery mode "${discoveryMode}". Use "topic" or "org".`)
  }

  const fetchedRepositories =
    discoveryMode === 'topic'
      ? await fetchTopicRepositories({ token, topic })
      : await fetchOrgRepositories({ token, org })

  const filteredRepositories = applyRepositoryFilters({
    repositories: fetchedRepositories,
    includeRepos,
    excludeRepos,
  })

  const discovered = []
  for (const repository of filteredRepositories) {
    try {
      const plansExists = await hasPlanDirectory({ token, fullName: repository.full_name })
      if (plansExists) {
        discovered.push(normalizeRepository(repository))
      }
    } catch (error) {
      console.warn(`Skipping ${repository.full_name}: ${error.message}`)
    }
  }

  discovered.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))

  return {
    repositories: discovered,
    count: discovered.length,
    cacheKey: `${discoveryMode}:${org || topic}:${discovered.length}`,
  }
}

const writeActionOutputs = (result) => {
  if (!process.env.GITHUB_OUTPUT) {
    return
  }

  const content = [
    `count=${result.count}`,
    `repositories=${JSON.stringify(result.repositories)}`,
    `cache_key=${result.cacheKey}`,
  ].join('\n')

  require('node:fs').appendFileSync(process.env.GITHUB_OUTPUT, `${content}\n`, 'utf8')
}

const runCli = async () => {
  const result = await discoverRepositories()
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
  discoverRepositories,
  parseCsv,
}
