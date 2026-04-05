import { describe, expect, it } from 'vitest'

import { PlanType, Priority } from '../../../src/types'
import { DEFAULT_FRONTMATTER, parseFrontmatter } from '../../../src/utils/parsers/frontmatter'

describe('parseFrontmatter', () => {
  it('extracts type scope and priority from blockquote frontmatter', () => {
    const result = parseFrontmatter(`
# Implementation Plan: Demo

> **Type:** \`bug fix\`
> **Scope:** Authentication module
> **Priority:** \`high\`
`)

    expect(result).toEqual({
      type: PlanType.BUG_FIX,
      scope: 'Authentication module',
      priority: Priority.HIGH,
    })
  })

  it('falls back to defaults for missing or invalid fields', () => {
    const result = parseFrontmatter(`
# Implementation Plan: Demo

> **Type:** \`unknown\`
> **Scope:**
`)

    expect(result).toEqual(DEFAULT_FRONTMATTER)
  })

  it('uses provided fallback values when fields are missing', () => {
    const result = parseFrontmatter('# Implementation Plan: Demo', {
      type: PlanType.REFACTOR,
      scope: 'routing',
      priority: Priority.LOW,
    })

    expect(result).toEqual({
      type: PlanType.REFACTOR,
      scope: 'routing',
      priority: Priority.LOW,
    })
  })

  it('normalizes quoted values and keeps fallback scope when scope is blank', () => {
    const result = parseFrontmatter(
      `
> **Type:** " Enhancement "
> **Scope:** "   "
> **Priority:** \`CRITICAL\`
`,
      { scope: 'data layer' },
    )

    expect(result).toEqual({
      type: PlanType.ENHANCEMENT,
      scope: 'data layer',
      priority: Priority.CRITICAL,
    })
  })
})
