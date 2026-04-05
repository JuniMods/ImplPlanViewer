/* eslint-disable vue/one-component-per-file */
import { createPinia } from 'pinia'
import { createSSRApp, defineComponent, type Component } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it, vi } from 'vitest'

import App from '../../src/App.vue'

vi.mock('vue-router', () => ({
  RouterView: defineComponent({
    name: 'RouterViewStub',
    template: '<div data-testid="router-view" />',
  }),
}))

const renderApp = async (rootComponent: Component) => {
  const app = createSSRApp(rootComponent)
  app.use(createPinia())
  return renderToString(app)
}

describe('App layout wrapper', () => {
  it('renders default header/footer and router content', async () => {
    const html = await renderApp(App)

    expect(html).toContain('Implementation Plan Viewer')
    expect(html).toContain('Built for AI-assisted development workflows')
    expect(html).toContain('Skip to main content')
    expect(html).toContain('id="main-content"')
    expect(html).toContain('data-testid="error-boundary"')
    expect(html).toContain('data-testid="router-view"')
  })

  it('allows custom header/footer slot content overrides', async () => {
    const WrappedApp = defineComponent({
      components: { App },
      template: `
        <App>
          <template #header>
            <div data-testid="custom-header">Custom Header</div>
          </template>
          <template #footer>
            <div data-testid="custom-footer">Custom Footer</div>
          </template>
        </App>
      `,
    })

    const html = await renderApp(WrappedApp)

    expect(html).toContain('data-testid="custom-header"')
    expect(html).toContain('data-testid="custom-footer"')
    expect(html).not.toContain('Implementation Plan Viewer')
    expect(html).not.toContain('Built for AI-assisted development workflows')
  })
})
