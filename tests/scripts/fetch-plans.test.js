const test = require('node:test')
const assert = require('node:assert/strict')

const { fetchPlans, parseRepositoryInput } = require('../../scripts/fetch-plans.js')

test('parseRepositoryInput accepts string and object payloads', () => {
  assert.equal(parseRepositoryInput('JuniMods/Repo'), 'JuniMods/Repo')
  assert.equal(parseRepositoryInput({ fullName: 'JuniMods/Repo' }), 'JuniMods/Repo')
  assert.equal(parseRepositoryInput('{"repository":"JuniMods/Repo"}'), 'JuniMods/Repo')
})

test('fetchPlans returns markdown plans and metadata', async () => {
  const calls = []
  const content = Buffer.from('# Implementation Plan: Test', 'utf8').toString('base64')

  const originalFetch = global.fetch
  global.fetch = async (url) => {
    calls.push(url)

    if (url.endsWith('/contents/implementation-plans')) {
      return {
        ok: true,
        status: 200,
        json: async () => [
          { type: 'file', name: '001_test.md', path: 'implementation-plans/001_test.md', sha: 'a1', size: 12 },
          { type: 'file', name: 'auth_plan.md', path: 'implementation-plans/auth_plan.md', sha: 'a3', size: 10 },
          { type: 'file', name: 'TEMPLATE.md', path: 'implementation-plans/TEMPLATE.md', sha: 'a4', size: 8 },
          { type: 'file', name: 'notes.txt', path: 'implementation-plans/notes.txt', sha: 'a2', size: 4 },
        ],
        text: async () => '',
      }
    }

    if (url.includes('implementation-plans%2F001_test.md')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({ content, html_url: 'https://github.com/JuniMods/Repo/blob/main/implementation-plans/001_test.md' }),
        text: async () => '',
      }
    }

    if (url.includes('implementation-plans%2Fauth_plan.md')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({ content, html_url: 'https://github.com/JuniMods/Repo/blob/main/implementation-plans/auth_plan.md' }),
        text: async () => '',
      }
    }

    if (url.includes('implementation-plans%2FTEMPLATE.md')) {
      throw new Error('TEMPLATE.md should be ignored and never fetched')
    }

    throw new Error(`Unexpected request: ${url}`)
  }

  try {
    const result = await fetchPlans('JuniMods/Repo')
    assert.equal(result.repository, 'JuniMods/Repo')
    assert.equal(result.metadata.fileCount, 2)
    assert.equal(result.files[0].name, '001_test.md')
    assert.equal(result.files[1].name, 'auth_plan.md')
    assert.match(result.files[0].content, /Implementation Plan/)
    assert.equal(calls.length, 3)
  } finally {
    global.fetch = originalFetch
  }
})

test('fetchPlans skips binary content and returns empty array for missing directory', async () => {
  const originalFetch = global.fetch
  const binaryContent = Buffer.from([0, 1, 2]).toString('base64')

  global.fetch = async (url) => {
    if (url.includes('/contents/implementation-plans') && !url.includes('%2F')) {
      return {
        ok: true,
        status: 200,
        json: async () => [{ type: 'file', name: '001_binary.md', path: 'implementation-plans/001_binary.md', sha: 'b1', size: 3 }],
        text: async () => '',
      }
    }

    if (url.includes('implementation-plans%2F001_binary.md')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({ content: binaryContent, html_url: 'https://example.test/file' }),
        text: async () => '',
      }
    }

    return { ok: false, status: 404, json: async () => ({}), text: async () => 'Not found' }
  }

  try {
    const result = await fetchPlans('JuniMods/Repo')
    assert.equal(result.metadata.fileCount, 0)

    const missingDirectoryResult = await fetchPlans('JuniMods/Missing')
    assert.deepEqual(missingDirectoryResult.files, [])
  } finally {
    global.fetch = originalFetch
  }
})
