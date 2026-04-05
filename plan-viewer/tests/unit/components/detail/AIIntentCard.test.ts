import { createSSRApp, defineComponent } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it } from 'vitest'

import AIIntentCard from '../../../../src/components/detail/AIIntentCard.vue'
import type { ProposedChange } from '../../../../src/types'

const renderCard = async (props: { change: ProposedChange; index: number }): Promise<string> => {
  const root = defineComponent({
    components: { AIIntentCard },
    setup() {
      return { props }
    },
    template: '<AIIntentCard :change="props.change" :index="props.index" />',
  })

  return renderToString(createSSRApp(root))
}

describe('AIIntentCard', () => {
  it('renders heading and markdown sections for what/why/how', async () => {
    const html = await renderCard({
      index: 0,
      change: {
        heading: 'Authentication Module',
        emoji: '🔐',
        what: 'Add [JWT](https://example.com/auth) tokens.',
        why: 'Reduce reliance on `session` state.',
        how: 'Use `passport-jwt` and middleware.',
      },
    })

    expect(html).toContain('data-testid="ai-intent-card"')
    expect(html).toContain('1. Authentication Module')
    expect(html).toContain('🔐')
    expect(html).toContain('class="ai-intent-card__panel" open')
    expect(html).toContain('data-testid="ai-intent-what-content"')
    expect(html).toContain('href="https://example.com/auth"')
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noopener noreferrer"')
    expect(html).toContain('class="inline-code"')
  })

  it('uses fallbacks when heading or sections are blank and does not auto-expand non-first cards', async () => {
    const html = await renderCard({
      index: 1,
      change: {
        heading: '   ',
        what: '   ',
        why: '   ',
        how: '   ',
      },
    })

    expect(html).toContain('2. Change Area')
    expect(html).toContain('No details provided.')
    expect(html).not.toContain('<details class="ai-intent-card__panel" open')
  })
})
