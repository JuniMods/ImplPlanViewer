import { createPinia } from 'pinia'
import { createSSRApp, defineComponent } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it } from 'vitest'

import ThemeToggle from '../../../src/components/common/ThemeToggle.vue'
import { useThemeStore } from '../../../src/stores'
import { ThemeMode } from '../../../src/types'

const renderToggle = async (mode?: ThemeMode | 'unexpected'): Promise<string> => {
  const pinia = createPinia()
  const root = defineComponent({
    components: { ThemeToggle },
    setup() {
      if (mode) {
        const themeStore = useThemeStore()
        if (mode === 'unexpected') {
          themeStore.mode = mode as ThemeMode
        } else {
          themeStore.setMode(mode)
        }
      }
    },
    template: '<ThemeToggle />',
  })

  const app = createSSRApp(root)
  app.use(pinia)
  return renderToString(app)
}

describe('ThemeToggle', () => {
  it('renders light and dark icons with matching labels', async () => {
    const lightHtml = await renderToggle(ThemeMode.LIGHT)
    const darkHtml = await renderToggle(ThemeMode.DARK)

    expect(lightHtml).toContain('☀️')
    expect(lightHtml).toContain('Switch theme (current: light)')
    expect(darkHtml).toContain('🌙')
    expect(darkHtml).toContain('Switch theme (current: dark)')
  })

  it('falls back to system presentation for unexpected mode values', async () => {
    const html = await renderToggle('unexpected')

    expect(html).toContain('🖥️')
    expect(html).toContain('Switch theme (current: system)')
  })
})
