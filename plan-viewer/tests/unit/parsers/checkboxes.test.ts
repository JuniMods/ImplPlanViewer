import { describe, expect, it } from 'vitest'

import { parseCheckboxes } from '../../../src/utils/parsers/checkboxes'

describe('parseCheckboxes', () => {
  it('parses checked and unchecked checkboxes and calculates completion', () => {
    const result = parseCheckboxes(`
- [x] Setup parser utilities
- [ ] Add parser tests
* [X] Export parser module
- [] Handle malformed unchecked pattern
`)

    expect(result).toEqual({
      items: [
        { text: 'Setup parser utilities', completed: true },
        { text: 'Add parser tests', completed: false },
        { text: 'Export parser module', completed: true },
        { text: 'Handle malformed unchecked pattern', completed: false },
      ],
      total: 4,
      completed: 2,
      unchecked: 2,
      completionPercentage: 50,
    })
  })

  it('counts malformed checkbox markers as unchecked', () => {
    const result = parseCheckboxes(`
- [maybe] Unexpected marker
- [X] Completed item
- [!] Also malformed
`)

    expect(result).toEqual({
      items: [
        { text: 'Unexpected marker', completed: false },
        { text: 'Completed item', completed: true },
        { text: 'Also malformed', completed: false },
      ],
      total: 3,
      completed: 1,
      unchecked: 2,
      completionPercentage: 33,
    })
  })

  it('returns zeroed summary when no checkboxes are present', () => {
    const result = parseCheckboxes('No checklist lines in this section.')

    expect(result).toEqual({
      items: [],
      total: 0,
      completed: 0,
      unchecked: 0,
      completionPercentage: 0,
    })
  })

  it('ignores non-list bracket patterns', () => {
    const result = parseCheckboxes(`
[x] Not a list item
1. [x] Also not a supported checkbox list
`)

    expect(result).toEqual({
      items: [],
      total: 0,
      completed: 0,
      unchecked: 0,
      completionPercentage: 0,
    })
  })
})
