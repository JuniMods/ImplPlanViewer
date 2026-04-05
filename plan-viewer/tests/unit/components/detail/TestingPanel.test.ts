import { createSSRApp, defineComponent } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it } from 'vitest'

import TestingPanel from '../../../../src/components/detail/TestingPanel.vue'

const renderPanel = async (strategy = ''): Promise<string> => {
  const root = defineComponent({
    components: { TestingPanel },
    setup() {
      return { strategy }
    },
    template: '<TestingPanel :strategy="strategy" />',
  })

  return renderToString(createSSRApp(root))
}

describe('TestingPanel', () => {
  it('renders markdown strategy content', async () => {
    const html = await renderPanel(
      [
        '- Verify happy-path behavior',
        '- Trigger one failure edge case',
        '',
        'Use `vitest` for unit coverage and [CI checks](https://example.com/ci).',
      ].join('\n'),
    )

    expect(html).toContain('data-testid="testing-panel"')
    expect(html).toContain('Testing Strategy')
    expect(html).toContain('data-testid="testing-panel-content"')
    expect(html).toContain('Verify happy-path behavior')
    expect(html).toContain('Trigger one failure edge case')
    expect(html).toContain('class="inline-code"')
    expect(html).toContain('href="https://example.com/ci"')
  })

  it('shows fallback when strategy is missing', async () => {
    const html = await renderPanel('   ')

    expect(html).toContain('data-testid="testing-panel-fallback"')
    expect(html).toContain('No testing strategy provided yet.')
  })
})
