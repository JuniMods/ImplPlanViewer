import { createSSRApp, defineComponent } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it } from 'vitest'

import ErrorBoundary from '../../../src/components/common/ErrorBoundary.vue'

const renderBoundary = async (template = '<ErrorBoundary><div data-testid="safe-content">Safe</div></ErrorBoundary>') =>
  renderToString(
    createSSRApp(
      defineComponent({
        components: { ErrorBoundary },
        template,
      }),
    ),
  )

describe('ErrorBoundary', () => {
  it('renders slot content while no descendant error occurs', async () => {
    const html = await renderBoundary()

    expect(html).toContain('data-testid="error-boundary-content"')
    expect(html).toContain('data-testid="safe-content"')
    expect(html).not.toContain('data-testid="error-boundary-fallback"')
  })

  it('renders fallback with error details for provided errors', async () => {
    const html = await renderBoundary(`
      <ErrorBoundary :error="new Error('Exploded while rendering')" />
    `)

    expect(html).toContain('data-testid="error-boundary-fallback"')
    expect(html).toContain('Something went wrong')
    expect(html).toContain('Exploded while rendering')
    expect(html).toContain('Try again')
  })
})
