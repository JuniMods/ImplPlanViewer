import { createSSRApp, defineComponent } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it } from 'vitest'

import ObjectiveBlock from '../../../../src/components/detail/ObjectiveBlock.vue'

const renderBlock = async (props: { objective: string; currentState?: string }): Promise<string> => {
  const root = defineComponent({
    components: { ObjectiveBlock },
    setup() {
      return { props }
    },
    template: '<ObjectiveBlock :objective="props.objective" :current-state="props.currentState" />',
  })

  return renderToString(createSSRApp(root))
}

describe('ObjectiveBlock', () => {
  it('renders objective markdown and optional current state markdown', async () => {
    const html = await renderBlock({
      objective: 'Fix [portal](https://example.com).\n\n```ts\nconst solved = true\n```',
      currentState: 'Current path uses `legacy` implementation.',
    })

    expect(html).toContain('data-testid="objective-block"')
    expect(html).toContain('Problem / Objective')
    expect(html).toContain('data-testid="objective-content"')
    expect(html).toContain('href="https://example.com"')
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noopener noreferrer"')
    expect(html).toContain('class="shiki')
    expect(html).toContain('Current State')
    expect(html).toContain('class="inline-code"')
  })

  it('shows fallback text when objective is empty and hides blank current state', async () => {
    const html = await renderBlock({
      objective: '   ',
      currentState: '   ',
    })

    expect(html).toContain('No problem/objective details available.')
    expect(html).not.toContain('Current State')
    expect(html).toContain('data-testid="objective-content-fallback"')
  })
})
