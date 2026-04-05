import { describe, expect, it } from 'vitest'

import { ScopeAreaChangeType, ScopeAreaSource } from '../../../src/types'
import { parseScopeAreas } from '../../../src/utils/parsers/scopeAreas'

describe('parseScopeAreas', () => {
  it('extracts and deduplicates areas from frontmatter scope and proposed change headings', () => {
    const result = parseScopeAreas(`
# Implementation Plan: Demo

> **Type:** feature
> **Scope:** Auth module, CI pipeline
> **Priority:** high

## Proposed Changes

### 1. Auth module
- **What:** Add Auth module tests
- **Why:** Improve reliability
- **How:** Expand auth module checks

### 2. Data Layer
- **What:** Modify Data Layer caching
- **Why:** Better performance
- **How:** Refactor data layer service

Data Layer metrics should be added later.
`)

    expect(result).toEqual([
      {
        name: 'Auth module',
        source: ScopeAreaSource.FRONTMATTER,
        changeType: ScopeAreaChangeType.ADD,
        mentions: 4,
      },
      {
        name: 'CI pipeline',
        source: ScopeAreaSource.FRONTMATTER,
        mentions: 1,
      },
      {
        name: 'Data Layer',
        source: ScopeAreaSource.HEADING,
        changeType: ScopeAreaChangeType.MODIFY,
        mentions: 4,
      },
    ])
  })

  it('infers heading change types from wording with remove taking precedence', () => {
    const result = parseScopeAreas(`
# Implementation Plan: Demo

> **Scope:** Legacy API

## Proposed Changes

### Cleanup Legacy API
- **What:** Remove and replace old endpoints
- **Why:** Improve maintainability
- **How:** Delete deprecated handlers
`)

    expect(result).toEqual([
      {
        name: 'Legacy API',
        source: ScopeAreaSource.FRONTMATTER,
        mentions: 2,
      },
      {
        name: 'Cleanup Legacy API',
        source: ScopeAreaSource.HEADING,
        changeType: ScopeAreaChangeType.REMOVE,
        mentions: 1,
      },
    ])
  })

  it('returns an empty list when no scope field and no change headings are present', () => {
    const result = parseScopeAreas(`
# Implementation Plan: Demo

## Proposed Changes

- **What:** Add parser support
`)

    expect(result).toEqual([])
  })

  it('splits scope values by separators and deduplicates names case-insensitively', () => {
    const result = parseScopeAreas(`
> **Scope:** "Data Layer"; API and \`data layer\`

## Proposed Changes
### 1. API
- **What:** Improve API pagination
- **How:** Update API handlers
`)

    expect(result).toEqual([
      {
        name: 'Data Layer',
        source: ScopeAreaSource.FRONTMATTER,
        mentions: 2,
      },
      {
        name: 'API',
        source: ScopeAreaSource.FRONTMATTER,
        changeType: ScopeAreaChangeType.MODIFY,
        mentions: 4,
      },
    ])
  })
})
