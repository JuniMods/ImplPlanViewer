import { createSSRApp, defineComponent } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it } from 'vitest'

import AppFooter from '../../../src/components/common/AppFooter.vue'

const renderFooter = async (): Promise<string> => {
  const root = defineComponent({
    components: { AppFooter },
    template: '<AppFooter />',
  })

  return renderToString(createSSRApp(root))
}

describe('AppFooter', () => {
  it('renders attribution and source links', async () => {
    const html = await renderFooter()

    expect(html).toContain('data-testid="app-footer"')
    expect(html).toContain('Built for AI-assisted development workflows')
    expect(html).toContain('©')
    expect(html).toContain('https://github.com/JuniMods/ImplPlanViewer')
    expect(html).toContain('https://github.com/JuniMods')
  })
})
