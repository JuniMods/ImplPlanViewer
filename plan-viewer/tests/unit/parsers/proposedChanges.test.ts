import { describe, expect, it } from 'vitest'

import { parseProposedChanges } from '../../../src/utils/parsers/proposedChanges'

describe('parseProposedChanges', () => {
  it('parses numbered proposed changes with what/why/how values', () => {
    const result = parseProposedChanges(`
### 1. Authentication Module 🔐

- **What:** Add JWT-based authentication
- **Why:** Current session-based auth doesn't scale
- **How:** Use passport.js with JWT strategy

### 2. CI Pipeline
- **What:** Add lint and test stages
- **Why:** Catch regressions earlier
- **How:** Run npm run lint and npm run test in workflow
`)

    expect(result).toEqual([
      {
        heading: 'Authentication Module',
        emoji: '🔐',
        what: 'Add JWT-based authentication',
        why: "Current session-based auth doesn't scale",
        how: 'Use passport.js with JWT strategy',
      },
      {
        heading: 'CI Pipeline',
        what: 'Add lint and test stages',
        why: 'Catch regressions earlier',
        how: 'Run npm run lint and npm run test in workflow',
      },
    ])
  })

  it('supports multi-line values and case-insensitive field names', () => {
    const result = parseProposedChanges(`
### 1. Rendering
- **WHAT:** Replace plain text renderer
  with markdown-it for richer output
- **Why:** Preserve intended formatting

  including nested bullet lists
- **how:** Introduce a renderer utility
  and wire it in the plan details view
`)

    expect(result).toEqual([
      {
        heading: 'Rendering',
        what: 'Replace plain text renderer\n  with markdown-it for richer output',
        why: 'Preserve intended formatting\n\n  including nested bullet lists',
        how: 'Introduce a renderer utility\n  and wire it in the plan details view',
      },
    ])
  })

  it('returns empty strings for missing fields and empty list for missing headings', () => {
    const withMissingFields = parseProposedChanges(`
### Monitoring
- **What:** Add dashboard
`)

    expect(withMissingFields).toEqual([
      {
        heading: 'Monitoring',
        what: 'Add dashboard',
        why: '',
        how: '',
      },
    ])

    expect(parseProposedChanges('- **What:** No change heading')).toEqual([])
  })

  it('keeps heading text when trailing emoji detection would remove all text', () => {
    const result = parseProposedChanges(`
### 🧪
- **What:** Add parser tests
`)

    expect(result).toEqual([
      {
        heading: '🧪',
        what: 'Add parser tests',
        why: '',
        how: '',
      },
    ])
  })
})
