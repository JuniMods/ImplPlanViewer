#!/usr/bin/env node

const PLAN_DIRECTORY = 'implementation-plans'
const PLAN_FILE_PATTERN = /^\d{3}_.+\.md$/i
const MAX_WARN_SIZE_BYTES = 1024 * 1024
const API_BASE_URL = 'https://api.github.com'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const createHeaders = (token) => ({
  Accept: 'application/vnd.github+json',
  'User-Agent': 'impl-plan-viewer-fetcher',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
})

const requestJson = async (url, token, options = {}) => {
  const { retries = 3 } = options
  let attempt = 0
  let waitMs = 500

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

      throw new Error(`GitHub API ${response.status}: ${await response.text()}`)
    } catch (error) {
      if (attempt >= retries) {
        throw error
      }
      await delay(waitMs)
      waitMs *= 2
    }
  }

  throw new Error(`Failed request: ${url}`)
}

const decodeBase64 = (value) => Buffer.from(value, 'base64').toString('utf8')

const looksBinary = (value) => /\u0000/.test(value)

const parseRepositoryInput = (value) => {
  if (!value) {
    throw new Error('Repository is required (e.g. "JuniMods/ImplPlanViewer")')
  }

  if (typeof value === 'object') {
    return value.fullName || value.full_name || value.repository || value.name
  }

  if (typeof value !== 'string') {
    throw new Error('Repository must be a string or object')
  }

  try {
    const parsed = JSON.parse(value)
    return parseRepositoryInput(parsed)
  } catch {
    return value
  }
}

const fetchPlans = async (repositoryInput, options = {}) => {
  const token = options.token ?? process.env.GITHUB_TOKEN ?? ''
  const repository = parseRepositoryInput(repositoryInput ?? process.env.REPOSITORY)
  const cache = options.cache ?? new Map()

  const listing = await requestJson(
    `${API_BASE_URL}/repos/${repository}/contents/${PLAN_DIRECTORY}`,
    token,
  )

  if (!Array.isArray(listing)) {
    return {
      repository,
      files: [],
      metadata: {
        fileCount: 0,
        totalBytes: 0,
        shaHashes: [],
      },
    }
  }

  const candidateFiles = listing.filter(
    (entry) => entry.type === 'file' && PLAN_FILE_PATTERN.test(entry.name),
  )

  const files = []
  const shaHashes = []
  let totalBytes = 0

  for (const file of candidateFiles) {
    const sha = file.sha
    const cached = cache.get(sha)
    if (cached) {
      files.push(cached)
      shaHashes.push(sha)
      totalBytes += cached.size
      continue
    }

    if (file.size > MAX_WARN_SIZE_BYTES) {
      console.warn(`Plan file is larger than 1MB: ${file.path}`)
    }

    const details = await requestJson(
      `${API_BASE_URL}/repos/${repository}/contents/${encodeURIComponent(file.path)}`,
      token,
    )

    if (!details || typeof details.content !== 'string') {
      console.warn(`Skipping unreadable file: ${file.path}`)
      continue
    }

    const content = decodeBase64(details.content.replace(/\n/g, ''))
    if (looksBinary(content)) {
      console.warn(`Skipping binary file: ${file.path}`)
      continue
    }

    const entry = {
      path: file.path,
      name: file.name,
      sha,
      size: file.size,
      content,
      htmlUrl: details.html_url,
    }

    files.push(entry)
    cache.set(sha, entry)
    shaHashes.push(sha)
    totalBytes += file.size
  }

  return {
    repository,
    files,
    metadata: {
      fileCount: files.length,
      totalBytes,
      shaHashes,
    },
  }
}

const writeActionOutputs = (result) => {
  if (!process.env.GITHUB_OUTPUT) {
    return
  }

  const payload = [
    `repository=${result.repository}`,
    `file_count=${result.metadata.fileCount}`,
    `total_bytes=${result.metadata.totalBytes}`,
    `plans=${JSON.stringify(result.files)}`,
  ].join('\n')

  require('node:fs').appendFileSync(process.env.GITHUB_OUTPUT, `${payload}\n`, 'utf8')
}

const runCli = async () => {
  const result = await fetchPlans()
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
  fetchPlans,
  parseRepositoryInput,
}
