import { createSSRApp, defineComponent } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it } from 'vitest'

import MetadataFooter from '../../../../src/components/detail/MetadataFooter.vue'
import { PlanType, Priority, type PlanMetadata, type Repository } from '../../../../src/types'

type MetadataFooterTestPlan = PlanMetadata & {
  sourceUrl?: string
  path?: string
  createdAt?: string
  updatedAt?: string
}

const repository: Repository = {
  id: 7,
  name: 'ImplPlanViewer',
  fullName: 'JuniMods/ImplPlanViewer',
  description: null,
  htmlUrl: 'https://github.com/JuniMods/ImplPlanViewer',
  defaultBranch: 'main',
  private: false,
  archived: false,
  disabled: false,
  topics: [],
  planCount: 55,
  updatedAt: '2026-01-10T15:30:00.000Z',
}

const renderFooter = async (plan: MetadataFooterTestPlan, generatedAt = ''): Promise<string> => {
  const root = defineComponent({
    components: { MetadataFooter },
    setup() {
      return { plan, repository, generatedAt }
    },
    template: '<MetadataFooter :plan="plan" :repository="repository" :generated-at="generatedAt" />',
  })

  return renderToString(createSSRApp(root))
}

describe('MetadataFooter', () => {
  it('renders source URL, created/updated dates, and generated metadata', async () => {
    const html = await renderFooter(
      {
        type: PlanType.FEATURE,
        priority: Priority.HIGH,
        scope: 'Frontend',
        sourceUrl: 'https://github.com/JuniMods/ImplPlanViewer/blob/main/implementation-plans/063_metadata_footer.md',
        createdAt: '2026-01-03T10:00:00.000Z',
        updatedAt: '2026-01-09T12:45:00.000Z',
      },
      '2026-01-11T08:30:00.000Z',
    )

    expect(html).toContain('data-testid="metadata-footer"')
    expect(html).toContain('data-testid="metadata-footer-source-url"')
    expect(html).toContain('063_metadata_footer.md')
    expect(html).toContain('data-testid="metadata-footer-created"')
    expect(html).toContain('>2026-01-03</dd>')
    expect(html).toContain('data-testid="metadata-footer-updated"')
    expect(html).toContain('>2026-01-09</dd>')
    expect(html).toContain('data-testid="metadata-footer-generated"')
    expect(html).toContain('>2026-01-11</dd>')
  })

  it('falls back to repository and unknown values when metadata is missing', async () => {
    const html = await renderFooter({
      type: PlanType.CHORE,
      priority: Priority.LOW,
      scope: '   ',
      path: 'implementation-plans/099_missing_metadata.md',
    })

    expect(html).toContain(
      'href="https://github.com/JuniMods/ImplPlanViewer/blob/main/implementation-plans/099_missing_metadata.md"',
    )
    expect(html).toContain('data-testid="metadata-footer-created"')
    expect(html).toContain('>Unknown</dd>')
    expect(html).toContain('data-testid="metadata-footer-updated"')
    expect(html).toContain('>2026-01-10</dd>')
    expect(html).toContain('data-testid="metadata-footer-generated"')
  })
})
