const test = require('node:test')
const assert = require('node:assert/strict')

const {
  discoverRepositories,
  parseCsv,
} = require('../../scripts/discover-repositories.js')

test('parseCsv trims and removes empty values', () => {
  assert.deepEqual(parseCsv('a, b ,,c'), ['a', 'b', 'c'])
})

test('discovers repositories in topic mode and keeps only repos with plans', async () => {
  const requests = []
  const responses = new Map([
    [
      'https://api.github.com/search/repositories?q=topic%3Aimpl-plan-viewer%20archived%3Afalse&per_page=100&page=1',
      {
        items: [
          {
            id: 1,
            name: 'Alpha',
            full_name: 'JuniMods/Alpha',
            description: null,
            html_url: 'https://github.com/JuniMods/Alpha',
            default_branch: 'main',
            private: false,
            archived: false,
            disabled: false,
            topics: ['impl-plan-viewer'],
            updated_at: '2026-01-02T00:00:00.000Z',
          },
          {
            id: 2,
            name: 'Beta',
            full_name: 'JuniMods/Beta',
            description: null,
            html_url: 'https://github.com/JuniMods/Beta',
            default_branch: 'main',
            private: false,
            archived: false,
            disabled: false,
            topics: ['impl-plan-viewer'],
            updated_at: '2026-01-01T00:00:00.000Z',
          },
        ],
      },
    ],
    ['https://api.github.com/repos/JuniMods/Alpha/contents/implementation-plans', [{ type: 'file' }]],
    ['https://api.github.com/repos/JuniMods/Beta/contents/implementation-plans', null],
  ])

  const originalFetch = global.fetch
  global.fetch = async (url) => {
    requests.push(url)
    if (!responses.has(url)) {
      throw new Error(`Unexpected URL: ${url}`)
    }

    const payload = responses.get(url)
    if (payload === null) {
      return { ok: false, status: 404, text: async () => 'Not found' }
    }

    return {
      ok: true,
      status: 200,
      json: async () => payload,
      text: async () => JSON.stringify(payload),
    }
  }

  try {
    const result = await discoverRepositories({
      discoveryMode: 'topic',
      topic: 'impl-plan-viewer',
      includeRepos: [],
      excludeRepos: [],
    })

    assert.equal(result.count, 1)
    assert.equal(result.repositories[0].fullName, 'JuniMods/Alpha')
    assert.match(result.cacheKey, /^topic:/)
    assert.equal(requests.length, 3)
  } finally {
    global.fetch = originalFetch
  }
})

test('applies include and exclude filters before checking plans directory', async () => {
  const originalFetch = global.fetch
  const calls = []
  global.fetch = async (url) => {
    calls.push(url)
    if (url.includes('/search/repositories')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          items: [
            {
              id: 1,
              name: 'Alpha',
              full_name: 'JuniMods/Alpha',
              description: null,
              html_url: 'https://github.com/JuniMods/Alpha',
              default_branch: 'main',
              private: false,
              archived: false,
              disabled: false,
              topics: [],
              updated_at: '2026-01-01T00:00:00.000Z',
            },
            {
              id: 2,
              name: 'Beta',
              full_name: 'JuniMods/Beta',
              description: null,
              html_url: 'https://github.com/JuniMods/Beta',
              default_branch: 'main',
              private: false,
              archived: false,
              disabled: false,
              topics: [],
              updated_at: '2026-01-01T00:00:00.000Z',
            },
          ],
        }),
        text: async () => '',
      }
    }

    return {
      ok: true,
      status: 200,
      json: async () => [{ type: 'file' }],
      text: async () => '',
    }
  }

  try {
    const result = await discoverRepositories({
      discoveryMode: 'topic',
      topic: 'impl-plan-viewer',
      includeRepos: ['JuniMods/Alpha', 'JuniMods/Beta'],
      excludeRepos: ['JuniMods/Beta'],
    })

    assert.equal(result.count, 1)
    assert.equal(result.repositories[0].fullName, 'JuniMods/Alpha')
    assert.equal(
      calls.filter((url) => url.includes('/contents/implementation-plans')).length,
      1,
    )
  } finally {
    global.fetch = originalFetch
  }
})
