import { createSSRApp, defineComponent } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it } from 'vitest'

import NotesSection from '../../../../src/components/detail/NotesSection.vue'

const renderSection = async (notes = ''): Promise<string> => {
  const root = defineComponent({
    components: { NotesSection },
    setup() {
      return { notes }
    },
    template: '<NotesSection :notes="notes" />',
  })

  return renderToString(createSSRApp(root))
}

describe('NotesSection', () => {
  it('renders markdown notes content in a collapsible section', async () => {
    const html = await renderSection(
      [
        'Tradeoff: use parser abstraction over direct regex in UI.',
        '',
        'Track follow-up in [issue #99](https://example.com/issues/99) and keep `notes` synchronized.',
      ].join('\n'),
    )

    expect(html).toContain('data-testid="notes-section"')
    expect(html).toContain('data-testid="notes-section-summary"')
    expect(html).toContain('Notes')
    expect(html).toContain('data-testid="notes-section-content"')
    expect(html).toContain('Tradeoff: use parser abstraction over direct regex in UI.')
    expect(html).toContain('href="https://example.com/issues/99"')
    expect(html).toContain('class="inline-code"')
    expect(html).not.toContain('<details class="notes-section__panel" open')
  })

  it('shows fallback when notes are missing', async () => {
    const html = await renderSection('   ')

    expect(html).toContain('data-testid="notes-section-fallback"')
    expect(html).toContain('No additional notes provided yet.')
  })
})
