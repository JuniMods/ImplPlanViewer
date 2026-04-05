import { createSSRApp, defineComponent } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it } from 'vitest'

import LoadingSpinner from '../../../src/components/common/LoadingSpinner.vue'

const renderSpinner = async (template = '<LoadingSpinner />'): Promise<string> => {
  const root = defineComponent({
    components: { LoadingSpinner },
    template,
  })

  return renderToString(createSSRApp(root))
}

describe('LoadingSpinner', () => {
  it('renders spinner mode with default accessible label', async () => {
    const html = await renderSpinner()

    expect(html).toContain('data-testid="loading-spinner"')
    expect(html).toContain('loading-spinner__indicator')
    expect(html).toContain('Loading…')
    expect(html).not.toContain('data-testid="loading-skeleton"')
  })

  it('renders skeleton mode and guards against invalid skeleton line counts', async () => {
    const html = await renderSpinner(
      '<LoadingSpinner variant="skeleton" :skeleton-lines="0" label="Fetching plans" />',
    )

    expect(html).toContain('data-testid="loading-skeleton"')
    expect(html).toContain('Fetching plans')
    expect((html.match(/loading-spinner__skeleton-line/g) ?? []).length).toBe(1)
  })
})
