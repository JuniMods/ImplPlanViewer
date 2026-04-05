import { createSSRApp, defineComponent, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it } from 'vitest'

import RepositorySelector from '../../../../src/components/repository/RepositorySelector.vue'
import type { Repository } from '../../../../src/types'

const repositories: Repository[] = [
  {
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
    planCount: 2,
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    name: 'Beta',
    fullName: 'JuniMods/Beta',
    description: null,
    htmlUrl: 'https://github.com/JuniMods/Beta',
    defaultBranch: 'main',
    private: false,
    archived: false,
    disabled: false,
    topics: [],
    planCount: 5,
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
]

const renderSelector = async (items: Repository[], modelValue = ''): Promise<string> => {
  const root = defineComponent({
    components: { RepositorySelector },
    setup() {
      const value = ref(modelValue)
      return { items, value }
    },
    template: '<RepositorySelector v-model="value" :repositories="items" />',
  })

  const app = createSSRApp(root)
  return renderToString(app)
}

describe('RepositorySelector', () => {
  it('renders autocomplete options with repository plan counts', async () => {
    const html = await renderSelector(repositories, 'JuniMods/Beta')

    expect(html).toContain('data-testid="repository-select"')
    expect(html).toContain('list="repository-select-options"')
    expect(html).toContain('JuniMods/Beta')
    expect(html).toContain('Alpha (2)')
    expect(html).toContain('Beta (5)')
  })

  it('renders disabled state and empty placeholder when list is empty', async () => {
    const html = await renderSelector([])

    expect(html).toContain('placeholder="No repositories available"')
    expect(html).toContain('disabled')
    expect(html).toContain('No repositories available')
  })
})
