import { createSSRApp, defineComponent } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it } from 'vitest'

import RepositoryStats from '../../../../src/components/repository/RepositoryStats.vue'
import type { Repository } from '../../../../src/types'

const repository: Repository = {
  id: 1,
  name: 'Alpha',
  fullName: 'JuniMods/Alpha',
  description: null,
  htmlUrl: 'https://github.com/JuniMods/Alpha',
  defaultBranch: 'main',
  private: false,
  archived: false,
  disabled: false,
  topics: [],
  planCount: 4,
  updatedAt: '2026-01-03T10:00:00.000Z',
}

const renderStats = async (item: Repository | null): Promise<string> => {
  const root = defineComponent({
    components: { RepositoryStats },
    setup() {
      return { item }
    },
    template: '<RepositoryStats :repository="item" />',
  })

  return renderToString(createSSRApp(root))
}

describe('RepositoryStats', () => {
  it('renders plan count and last updated date for selected repository', async () => {
    const html = await renderStats(repository)

    expect(html).toContain('data-testid="repository-stats"')
    expect(html).toContain('Plans')
    expect(html).toContain('>4<')
    expect(html).toContain('Last updated')
    expect(html).toContain('2026-01-03')
  })

  it('renders unknown date when updatedAt cannot be formatted', async () => {
    const html = await renderStats({ ...repository, updatedAt: 'not-a-date' })

    expect(html).toContain('Last updated')
    expect(html).toContain('Unknown')
  })

  it('renders empty state when no repository is selected', async () => {
    const html = await renderStats(null)

    expect(html).toContain('No repository selected.')
  })
})
