import { createSSRApp, defineComponent } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it } from 'vitest'

import NotFoundView from '../../../src/views/NotFoundView.vue'

const renderNotFoundView = async (): Promise<string> => {
  const root = defineComponent({
    components: { NotFoundView },
    template: '<NotFoundView />',
  })

  const app = createSSRApp(root)
  return renderToString(app)
}

describe('NotFoundView', () => {
  it('renders a 404 page with a link back to home', async () => {
    const html = await renderNotFoundView()

    expect(html).toContain('data-testid="not-found-view"')
    expect(html).toContain('404 — Page not found')
    expect(html).toContain('data-testid="not-found-home-link"')
    expect(html).toContain('href="/"')
  })
})
