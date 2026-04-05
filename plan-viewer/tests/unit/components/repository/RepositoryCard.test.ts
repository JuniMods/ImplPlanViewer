import { createSSRApp, defineComponent } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it } from 'vitest'

import RepositoryCard from '../../../../src/components/repository/RepositoryCard.vue'
import type { Repository } from '../../../../src/types'

const repository: Repository = {
  id: 1,
  name: 'Alpha',
  fullName: 'JuniMods/Alpha',
  description: 'Primary implementation plans',
  htmlUrl: 'https://github.com/JuniMods/Alpha',
  defaultBranch: 'main',
  private: true,
  archived: true,
  disabled: false,
  topics: ['planning', 'frontend'],
  planCount: 7,
  updatedAt: '2026-01-03T10:00:00.000Z',
}

const renderCard = async (item: Repository | null): Promise<string> => {
  const root = defineComponent({
    components: { RepositoryCard },
    setup() {
      return { item }
    },
    template: '<RepositoryCard :repository="item" />',
  })

  return renderToString(createSSRApp(root))
}

describe('RepositoryCard', () => {
  it('renders repository metadata', async () => {
    const html = await renderCard(repository)

    expect(html).toContain('data-testid="repository-card"')
    expect(html).toContain('Alpha')
    expect(html).toContain('JuniMods/Alpha')
    expect(html).toContain('Private')
    expect(html).toContain('Primary implementation plans')
    expect(html).toContain('planning')
    expect(html).toContain('frontend')
    expect(html).toContain('2026-01-03')
    expect(html).toContain('Archived')
    expect(html).toContain('https://github.com/JuniMods/Alpha')
  })

  it('renders empty state without repository', async () => {
    const html = await renderCard(null)

    expect(html).toContain('Select a repository to view details.')
  })
})
