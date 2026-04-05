import { createSSRApp, defineComponent } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it } from 'vitest'

import ErrorView from '../../../src/views/ErrorView.vue'

const renderErrorView = async (path = '/error'): Promise<string> => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/error', component: ErrorView }],
  })

  await router.push(path)
  await router.isReady()

  const root = defineComponent({
    components: { ErrorView },
    template: '<ErrorView />',
  })

  const app = createSSRApp(root)
  app.use(router)
  return renderToString(app)
}

describe('ErrorView', () => {
  it('renders a fallback page with a home link', async () => {
    const html = await renderErrorView()

    expect(html).toContain('data-testid="error-view"')
    expect(html).toContain('Something went wrong')
    expect(html).toContain('data-testid="error-view-home-link"')
    expect(html).toContain('href="/"')
  })

  it('renders error details when a query message is present', async () => {
    const html = await renderErrorView('/error?message=Manifest%20missing')

    expect(html).toContain('data-testid="error-view-details"')
    expect(html).toContain('Manifest missing')
  })
})
