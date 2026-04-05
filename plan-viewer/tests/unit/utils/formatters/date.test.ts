import { describe, expect, it } from 'vitest'

import { formatDate } from '../../../../src/utils/formatters/date'

describe('formatDate', () => {
  it('formats an ISO timestamp as YYYY-MM-DD', () => {
    expect(formatDate('2024-04-04T12:34:56.000Z')).toBe('2024-04-04')
  })

  it('keeps a plain ISO date unchanged', () => {
    expect(formatDate('2024-04-04')).toBe('2024-04-04')
  })

  it('returns an empty string for invalid values', () => {
    expect(formatDate('not-a-date')).toBe('')
    expect(formatDate('')).toBe('')
    expect(formatDate(null)).toBe('')
  })

  it('formats Date instances and rejects invalid Date objects', () => {
    expect(formatDate(new Date('2024-12-24T08:00:00.000Z'))).toBe('2024-12-24')
    expect(formatDate(new Date('invalid'))).toBe('')
  })
})
