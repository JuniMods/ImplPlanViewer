import { createSSRApp, defineComponent } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it } from 'vitest'

import SuccessCriteria from '../../../../src/components/detail/SuccessCriteria.vue'
import type { Criterion } from '../../../../src/types'

const renderCriteria = async (criteria: Criterion[]): Promise<string> => {
  const root = defineComponent({
    components: { SuccessCriteria },
    setup() {
      return { criteria }
    },
    template: '<SuccessCriteria :criteria="criteria" />',
  })

  return renderToString(createSSRApp(root))
}

describe('SuccessCriteria', () => {
  it('renders criteria checklist with progress summary', async () => {
    const html = await renderCriteria([
      { text: 'Unit deliverable is implemented', completed: true },
      { text: 'Behavior matches intended scope', completed: false },
      { text: 'Dependency contracts are satisfied', completed: true },
    ])

    expect(html).toContain('data-testid="success-criteria"')
    expect(html).toContain('Success Criteria')
    expect(html).toContain('2/3 criteria complete (67%)')
    expect(html).toContain('data-testid="success-criteria-progressbar"')
    expect(html).toContain('aria-valuenow="67"')
    expect(html).toContain('width:67%')
    expect(html).toContain('Unit deliverable is implemented')
    expect(html).toContain('Behavior matches intended scope')
    expect(html).toContain('Dependency contracts are satisfied')
    expect(html).toContain('✓')
    expect(html).toContain('○')
  })

  it('renders empty state when criteria are missing', async () => {
    const html = await renderCriteria([])

    expect(html).toContain('No success criteria available yet.')
    expect(html).toContain('data-testid="success-criteria-empty"')
    expect(html).toContain('No success criteria defined.')
    expect(html).toContain('aria-valuenow="0"')
    expect(html).toContain('width:0%')
  })
})
