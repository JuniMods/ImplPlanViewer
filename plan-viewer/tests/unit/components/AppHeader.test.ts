import { createPinia } from 'pinia'
import { createSSRApp, defineComponent } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it } from 'vitest'

import AppHeader from '../../../src/components/common/AppHeader.vue'
import { useRepositoriesStore } from '../../../src/stores'
import type { RepositoriesManifest } from '../../../src/types'

const repositoriesManifest: RepositoriesManifest = {
  version: '1.0.0',
  generatedAt: '2026-01-01T00:00:00.000Z',
  totalRepositories: 2,
  repositories: [
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
  ],
}

const renderHeader = async (loadRepositories = true): Promise<string> => {
  const pinia = createPinia()
  const root = defineComponent({
    components: { AppHeader },
    setup() {
      if (loadRepositories) {
        const repositoriesStore = useRepositoriesStore()
        repositoriesStore.loadRepositories(repositoriesManifest)
      }
    },
    template: '<AppHeader />',
  })

  const app = createSSRApp(root)
  app.use(pinia)
  return renderToString(app)
}

describe('AppHeader', () => {
  it('renders brand, navigation, global search, theme toggle, and source link', async () => {
    const html = await renderHeader()

    expect(html).toContain('Implementation Plan Viewer')
    expect(html).toContain('Home')
    expect(html).toContain('Plans')
    expect(html).toContain('data-testid="repository-select"')
    expect(html).toContain('data-testid="repository-stats"')
    expect(html).toContain('Last updated')
    expect(html).toContain('Beta (5)')
    expect(html).toContain('Alpha (2)')
    expect(html).toContain('data-testid="global-search"')
    expect(html).toContain('aria-controls="global-search"')
    expect(html).toContain('aria-expanded="false"')
    expect(html).toContain('data-testid="theme-toggle"')
    expect(html).toContain('https://github.com/JuniMods/ImplPlanViewer')
    expect(html).toContain('Open project source on GitHub (opens in a new tab)')
  })

  it('shows empty-state selector option when no repositories are loaded', async () => {
    const html = await renderHeader(false)

    expect(html).toContain('No repositories available')
    expect(html).toContain('No repository selected.')
    expect(html).toContain('disabled')
  })
})
