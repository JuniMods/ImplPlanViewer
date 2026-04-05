import { createSSRApp, defineComponent } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it } from 'vitest'

import RolloutPanel from '../../../../src/components/detail/RolloutPanel.vue'

const renderPanel = async (plan = ''): Promise<string> => {
  const root = defineComponent({
    components: { RolloutPanel },
    setup() {
      return { plan }
    },
    template: '<RolloutPanel :plan="plan" />',
  })

  return renderToString(createSSRApp(root))
}

describe('RolloutPanel', () => {
  it('renders markdown rollout content', async () => {
    const html = await renderPanel(
      [
        '- Deploy behind feature flag',
        '- Roll out incrementally to 10%, 50%, then 100%',
        '',
        'Track metrics in [release dashboard](https://example.com/release) and keep `rollback` ready.',
      ].join('\n'),
    )

    expect(html).toContain('data-testid="rollout-panel"')
    expect(html).toContain('Rollout')
    expect(html).toContain('data-testid="rollout-panel-content"')
    expect(html).toContain('Deploy behind feature flag')
    expect(html).toContain('Roll out incrementally to 10%, 50%, then 100%')
    expect(html).toContain('class="inline-code"')
    expect(html).toContain('href="https://example.com/release"')
  })

  it('shows fallback when rollout plan is missing', async () => {
    const html = await renderPanel('   ')

    expect(html).toContain('data-testid="rollout-panel-fallback"')
    expect(html).toContain('No rollout plan provided yet.')
  })
})
