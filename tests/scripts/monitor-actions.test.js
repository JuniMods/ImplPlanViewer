const test = require('node:test')
const assert = require('node:assert/strict')

const {
  monitorLatestDeployment,
  parseDurationMs,
  parseRepository,
  summarizeRun,
} = require('../../scripts/monitor-actions.js')

test('parseRepository validates owner/name', () => {
  assert.deepEqual(parseRepository('JuniMods/ImplPlanViewer'), {
    owner: 'JuniMods',
    repo: 'ImplPlanViewer',
  })
  assert.throws(() => parseRepository('invalid-format'), /owner\/name/)
})

test('parseDurationMs returns null for invalid ranges', () => {
  assert.equal(parseDurationMs('2026-04-05T00:00:00Z', '2026-04-05T00:01:00Z'), 60000)
  assert.equal(parseDurationMs('invalid', '2026-04-05T00:01:00Z'), null)
  assert.equal(parseDurationMs('2026-04-05T00:01:00Z', '2026-04-05T00:00:00Z'), null)
})

test('summarizeRun flags failed jobs and duration threshold breaches', () => {
  const summary = summarizeRun({
    run: {
      id: 1,
      name: 'Build and Deploy',
      run_number: 5,
      html_url: 'https://example.test/runs/1',
      status: 'completed',
      conclusion: 'success',
      event: 'push',
      head_branch: 'main',
      run_started_at: '2026-04-05T00:00:00Z',
      updated_at: '2026-04-05T00:20:00Z',
    },
    jobs: [
      {
        name: 'Build',
        status: 'completed',
        conclusion: 'success',
        started_at: '2026-04-05T00:00:00Z',
        completed_at: '2026-04-05T00:10:00Z',
      },
      {
        name: 'Deploy',
        status: 'completed',
        conclusion: 'failure',
        started_at: '2026-04-05T00:10:00Z',
        completed_at: '2026-04-05T00:20:00Z',
      },
    ],
    maxDurationMinutes: 15,
  })

  assert.equal(summary.durationMinutes, 20)
  assert.equal(summary.failedJobs.length, 1)
  assert.equal(summary.warnings.length, 2)
})

test('monitorLatestDeployment reports missing workflow runs', async () => {
  const responses = new Map([
    [
      'https://api.github.com/repos/JuniMods/ImplPlanViewer/actions/runs?per_page=30',
      { workflow_runs: [] },
    ],
  ])

  const fetchImpl = async (url) => ({
    ok: true,
    json: async () => responses.get(url),
    text: async () => JSON.stringify(responses.get(url)),
  })

  const summary = await monitorLatestDeployment({
    repository: 'JuniMods/ImplPlanViewer',
    workflowName: 'Build and Deploy',
    fetchImpl,
  })

  assert.equal(summary.monitoringStatus, 'no_runs_found')
})

test('monitorLatestDeployment returns latest run summary', async () => {
  const responses = new Map([
    [
      'https://api.github.com/repos/JuniMods/ImplPlanViewer/actions/runs?per_page=30',
      {
        workflow_runs: [
          {
            id: 2,
            name: 'Build and Deploy',
            run_number: 11,
            html_url: 'https://example.test/runs/2',
            status: 'completed',
            conclusion: 'success',
            event: 'workflow_dispatch',
            head_branch: 'main',
            run_started_at: '2026-04-05T00:00:00Z',
            updated_at: '2026-04-05T00:05:00Z',
          },
        ],
      },
    ],
    [
      'https://api.github.com/repos/JuniMods/ImplPlanViewer/actions/runs/2/jobs?per_page=100',
      {
        jobs: [
          {
            name: 'Deploy',
            status: 'completed',
            conclusion: 'success',
            started_at: '2026-04-05T00:03:00Z',
            completed_at: '2026-04-05T00:05:00Z',
          },
        ],
      },
    ],
  ])

  const fetchImpl = async (url) => {
    const payload = responses.get(url)
    return {
      ok: true,
      json: async () => payload,
      text: async () => JSON.stringify(payload),
    }
  }

  const summary = await monitorLatestDeployment({
    repository: 'JuniMods/ImplPlanViewer',
    workflowName: 'Build and Deploy',
    fetchImpl,
    maxDurationMinutes: 10,
  })

  assert.equal(summary.monitoringStatus, 'ok')
  assert.equal(summary.latestRun.failedJobs.length, 0)
  assert.equal(summary.latestRun.warnings.length, 0)
})
