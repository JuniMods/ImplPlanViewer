import { describe, expect, it } from 'vitest'

import { truncateText } from '../../../../src/utils/formatters/text'

describe('truncateText', () => {
  it('returns empty string for nullish or empty values', () => {
    expect(truncateText(null)).toBe('')
    expect(truncateText(undefined)).toBe('')
    expect(truncateText('   ')).toBe('')
  })

  it('returns text unchanged when no limit is reached', () => {
    expect(truncateText('Plan title', { maxChars: 20, maxLines: 2 })).toBe('Plan title')
  })

  it('truncates by maxChars and appends ellipsis', () => {
    expect(truncateText('abcdefghijklmnop', { maxChars: 10 })).toBe('abcdefghi…')
  })

  it('truncates by maxLines and appends ellipsis', () => {
    expect(truncateText('line 1\nline 2\nline 3', { maxLines: 2 })).toBe('line 1\nline 2…')
  })

  it('applies maxLines and maxChars together', () => {
    expect(truncateText('first line\nsecond line\nthird line', { maxLines: 2, maxChars: 12 })).toBe(
      'first line…',
    )
  })

  it('supports custom ellipsis', () => {
    expect(truncateText('abcdef', { maxChars: 5, ellipsis: '...' })).toBe('ab...')
  })

  it('returns empty output for non-positive limits', () => {
    expect(truncateText('value', { maxChars: 0 })).toBe('')
    expect(truncateText('line 1\nline 2', { maxLines: -1 })).toBe('')
  })

  it('handles custom ellipsis longer than maxChars', () => {
    expect(truncateText('abcdef', { maxChars: 2, ellipsis: '...' })).toBe('...')
  })
})
