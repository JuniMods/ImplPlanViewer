import { createSSRApp, defineComponent } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it } from 'vitest'

import PhaseTimeline from '../../../../src/components/detail/PhaseTimeline.vue'
import type { Phase } from '../../../../src/types'

const renderTimeline = async (phases: Phase[]): Promise<string> => {
  const root = defineComponent({
    components: { PhaseTimeline },
    setup() {
      return { phases }
    },
    template: '<PhaseTimeline :phases="phases" />',
  })

  return renderToString(createSSRApp(root))
}

describe('PhaseTimeline', () => {
  it('renders phases with aggregate progress and step states', async () => {
    const html = await renderTimeline([
      {
        number: 1,
        name: 'Foundation',
        steps: [
          { text: 'Create/update target files', completed: true },
          { text: 'Implement core timeline UI', completed: false },
        ],
      },
      {
        number: 2,
        name: 'Validation',
        steps: [{ text: 'Add unit tests', completed: true }],
      },
    ])

    expect(html).toContain('data-testid="phase-timeline"')
    expect(html).toContain('Phase Timeline')
    expect(html).toContain('2/3 steps complete (67%)')
    expect(html).toContain('Phase 1')
    expect(html).toContain('Foundation')
    expect(html).toContain('Phase 2')
    expect(html).toContain('Validation')
    expect(html).toContain('Create/update target files')
    expect(html).toContain('Implement core timeline UI')
    expect(html).toContain('Add unit tests')
    expect(html).toContain('✓')
    expect(html).toContain('○')
  })

  it('shows empty state when no phases are available', async () => {
    const html = await renderTimeline([])

    expect(html).toContain('No implementation steps available yet.')
    expect(html).toContain('data-testid="phase-timeline-empty"')
    expect(html).toContain('No phases defined.')
  })
})
