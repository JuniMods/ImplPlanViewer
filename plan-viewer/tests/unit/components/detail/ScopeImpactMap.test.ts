import { createSSRApp, defineComponent } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it } from 'vitest'

import ScopeImpactMap from '../../../../src/components/detail/ScopeImpactMap.vue'
import { ScopeAreaChangeType, ScopeAreaSource, type ScopeArea } from '../../../../src/types'

const renderMap = async (scopeAreas: ScopeArea[], planLabel = 'Detail View Plan'): Promise<string> => {
  const root = defineComponent({
    components: { ScopeImpactMap },
    setup() {
      return { scopeAreas, planLabel }
    },
    template: '<ScopeImpactMap :scope-areas="scopeAreas" :plan-label="planLabel" />',
  })

  return renderToString(createSSRApp(root))
}

describe('ScopeImpactMap', () => {
  it('renders summary, legend, and graph canvas when scope areas exist', async () => {
    const html = await renderMap([
      {
        name: 'Auth module',
        source: ScopeAreaSource.FRONTMATTER,
        changeType: ScopeAreaChangeType.ADD,
        mentions: 3,
      },
      {
        name: 'API Gateway',
        source: ScopeAreaSource.HEADING,
        changeType: ScopeAreaChangeType.MODIFY,
        mentions: 2,
      },
    ])

    expect(html).toContain('data-testid="scope-impact-map"')
    expect(html).toContain('Scope Impact Map')
    expect(html).toContain('2 areas · 5 mentions · Highest impact: Auth module')
    expect(html).toContain('data-testid="scope-impact-map-legend"')
    expect(html).toContain('Plan')
    expect(html).toContain('Add')
    expect(html).toContain('Modify')
    expect(html).toContain('Remove')
    expect(html).toContain('data-testid="scope-impact-map-controls"')
    expect(html).toContain('Controls: Drag nodes · Scroll to zoom · Drag canvas to pan')
    expect(html).toContain('data-testid="scope-impact-map-canvas"')
  })

  it('shows empty state when scope areas are missing', async () => {
    const html = await renderMap([])

    expect(html).toContain('No scope areas detected yet.')
    expect(html).toContain('data-testid="scope-impact-map-empty"')
    expect(html).toContain('Add scope frontmatter or proposed change headings to populate this graph.')
    expect(html).not.toContain('data-testid="scope-impact-map-canvas"')
  })
})
