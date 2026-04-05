import { describe, expect, it } from 'vitest'

import { PlanType, Priority } from '../../../src/types'
import { buildPlanMetadata } from '../../../src/utils/parsers/planBuilder'

describe('buildPlanMetadata', () => {
  it('builds metadata from explicit frontmatter values', () => {
    const result = buildPlanMetadata(`
# Implementation Plan: Demo

> **Type:** bug fix
> **Scope:** API Layer
> **Priority:** low

## Proposed Changes
### 1. API Layer
- **What:** Update endpoints
- **Why:** Improve compatibility
- **How:** Replace deprecated handlers
`)

    expect(result).toEqual({
      type: PlanType.BUG_FIX,
      scope: 'API Layer',
      priority: Priority.LOW,
    })
  })

  it('infers scope from parsed change areas when scope frontmatter is missing', () => {
    const result = buildPlanMetadata(`
# Implementation Plan: Demo

> **Type:** enhancement
> **Priority:** high

## Proposed Changes

### 1. CI Pipeline
- **What:** Add lint and test jobs
- **Why:** Catch regressions
- **How:** Extend workflow checks

## Implementation Steps
- [x] Add parser utilities
- [ ] Add integration wiring

## Success Criteria
- [ ] CI checks run for pull requests
`)

    expect(result).toEqual({
      type: PlanType.ENHANCEMENT,
      scope: 'CI Pipeline',
      priority: Priority.HIGH,
    })
  })

  it('uses fallback values and validates input type', () => {
    expect(() => buildPlanMetadata(42 as unknown as string)).toThrow('Plan content must be a string')

    const result = buildPlanMetadata('# Implementation Plan: Demo', {
      fallback: {
        type: PlanType.REFACTOR,
        scope: 'routing',
        priority: Priority.CRITICAL,
      },
    })

    expect(result).toEqual({
      type: PlanType.REFACTOR,
      scope: 'routing',
      priority: Priority.CRITICAL,
    })
  })

  it('prefers fallback scope when no explicit scope field exists', () => {
    const result = buildPlanMetadata(
      `
> **Type:** feature

## Proposed Changes
### UI Layer
- **What:** Improve dashboard visuals
`,
      {
        fallback: {
          scope: 'Design System',
        },
      },
    )

    expect(result.scope).toBe('Design System')
  })
})
