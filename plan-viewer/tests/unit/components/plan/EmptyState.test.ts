import { createSSRApp, defineComponent } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it } from 'vitest'

import EmptyState from '../../../../src/components/plan/EmptyState.vue'

const renderEmptyState = async (
  filtered = false,
  message = '',
  clearLabel = 'Clear filters',
): Promise<string> => {
  const root = defineComponent({
    components: { EmptyState },
    setup() {
      return { filtered, message, clearLabel }
    },
    template: '<EmptyState :filtered="filtered" :message="message" :clear-label="clearLabel" />',
  })

  return renderToString(createSSRApp(root))
}

describe('EmptyState', () => {
  it('renders encouragement text when repository has no plans', async () => {
    const html = await renderEmptyState()

    expect(html).toContain('data-testid="plan-empty-state"')
    expect(html).toContain('No plans yet')
    expect(html).toContain('No plans found in this repository yet. Check back soon for new implementation plans.')
    expect(html).not.toContain('data-testid="plan-empty-state-clear"')
  })

  it('renders clear filters action when filtered result is empty', async () => {
    const html = await renderEmptyState(true, 'No results for the current filters.', 'Reset filters')

    expect(html).toContain('No results')
    expect(html).toContain('No results for the current filters.')
    expect(html).toContain('data-testid="plan-empty-state-clear"')
    expect(html).toContain('Reset filters')
  })
})
