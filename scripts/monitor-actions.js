#!/usr/bin/env node

const API_BASE_URL = 'https://api.github.com'
const SUCCESS_CONCLUSIONS = new Set(['success', 'skipped', 'neutral'])

const parseRepository = (value) => {
  const [owner = '', repo = ''] = String(value ?? '')
    .trim()
    .split('/', 2)
    .map((entry) => entry.trim())

  if (!owner || !repo) {
    throw new Error('Repository must be provided as "owner/name".')
  }

  return { owner, repo }
}

const createHeaders = (token) => ({
  Accept: 'application/vnd.github+json',
  'User-Agent': 'impl-plan-viewer-monitoring',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
})

const requestJson = async ({ url, token, fetchImpl = fetch }) => {
  const response = await fetchImpl(url, { headers: createHeaders(token) })
  if (!response.ok) {
    const body = await response.text()
    throw new Error(`GitHub API ${response.status} for ${url}: ${body}`)
  }

  return response.json()
}

const parseDurationMs = (startedAt, finishedAt) => {
  if (!startedAt || !finishedAt) {
    return null
  }

  const start = Date.parse(startedAt)
  const end = Date.parse(finishedAt)
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
    return null
  }

  return end - start
}

const summarizeRun = ({ run, jobs, maxDurationMinutes }) => {
  const durationMs = parseDurationMs(run.run_started_at ?? run.created_at, run.updated_at)
  const durationMinutes = durationMs === null ? null : Number((durationMs / 60000).toFixed(2))
  const jobSummaries = jobs.map((job) => ({
    name: job.name,
    status: job.status,
    conclusion: job.conclusion,
    durationMinutes: (() => {
      const jobDurationMs = parseDurationMs(job.started_at, job.completed_at)
      return jobDurationMs === null ? null : Number((jobDurationMs / 60000).toFixed(2))
    })(),
  }))
  const failedJobs = jobSummaries.filter(
    (job) => !SUCCESS_CONCLUSIONS.has(String(job.conclusion ?? '').toLowerCase()),
  )

  const warnings = []
  if (durationMinutes !== null && Number.isFinite(maxDurationMinutes) && durationMinutes > maxDurationMinutes) {
    warnings.push(
      `Deployment duration ${durationMinutes} min exceeded threshold ${maxDurationMinutes} min.`,
    )
  }

  if (failedJobs.length > 0) {
    warnings.push(`Found ${failedJobs.length} failed/cancelled job(s).`)
  }

  return {
    runId: run.id,
    workflowName: run.name,
    runNumber: run.run_number,
    htmlUrl: run.html_url,
    status: run.status,
    conclusion: run.conclusion,
    event: run.event,
    branch: run.head_branch,
    updatedAt: run.updated_at,
    durationMinutes,
    jobs: jobSummaries,
    failedJobs,
    warnings,
  }
}

const monitorLatestDeployment = async (options = {}) => {
  const token = options.token ?? process.env.GITHUB_TOKEN ?? ''
  const repository = options.repository ?? process.env.GITHUB_REPOSITORY ?? process.env.REPOSITORY ?? ''
  const workflowName = options.workflowName ?? process.env.MONITOR_WORKFLOW_NAME ?? 'Build and Deploy'
  const maxDurationMinutes = Number(options.maxDurationMinutes ?? process.env.MAX_DEPLOY_DURATION_MINUTES ?? 15)
  const fetchImpl = options.fetchImpl ?? fetch

  const { owner, repo } = parseRepository(repository)
  const runsUrl = `${API_BASE_URL}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/actions/runs?per_page=30`
  const runsPayload = await requestJson({ url: runsUrl, token, fetchImpl })
  const runs = Array.isArray(runsPayload.workflow_runs) ? runsPayload.workflow_runs : []

  const latestRun = runs.find((run) => run.name === workflowName) ?? null
  if (!latestRun) {
    return {
      repository: `${owner}/${repo}`,
      workflowName,
      monitoringStatus: 'no_runs_found',
      warnings: [`No workflow runs found for "${workflowName}".`],
    }
  }

  const jobsUrl = `${API_BASE_URL}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/actions/runs/${latestRun.id}/jobs?per_page=100`
  const jobsPayload = await requestJson({ url: jobsUrl, token, fetchImpl })
  const jobs = Array.isArray(jobsPayload.jobs) ? jobsPayload.jobs : []

  return {
    repository: `${owner}/${repo}`,
    workflowName,
    monitoringStatus: 'ok',
    latestRun: summarizeRun({ run: latestRun, jobs, maxDurationMinutes }),
  }
}

const runCli = async () => {
  const summary = await monitorLatestDeployment()
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`)

  if (summary.monitoringStatus !== 'ok') {
    process.exitCode = 1
    return
  }

  const conclusion = String(summary.latestRun.conclusion ?? '').toLowerCase()
  if (!SUCCESS_CONCLUSIONS.has(conclusion) || summary.latestRun.warnings.length > 0) {
    process.exitCode = 1
  }
}

if (require.main === module) {
  runCli().catch((error) => {
    console.error(error.message)
    process.exit(1)
  })
}

module.exports = {
  monitorLatestDeployment,
  parseDurationMs,
  parseRepository,
  summarizeRun,
}
