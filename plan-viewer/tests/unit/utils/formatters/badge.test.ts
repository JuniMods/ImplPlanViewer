import { describe, expect, it } from 'vitest'

import { getPriorityBadgeStyle, getTypeBadgeStyle } from '../../../../src/utils/formatters/badge'

describe('getTypeBadgeStyle', () => {
  it('returns badge color and variant for a known type', () => {
    expect(getTypeBadgeStyle('feature')).toEqual({
      label: 'Feature',
      color: 'plan-feature',
      variant: 'tonal',
    })
  })

  it('returns unknown badge style for invalid values', () => {
    expect(getTypeBadgeStyle('invalid')).toEqual({
      label: 'Unknown',
      color: 'grey',
      variant: 'outlined',
    })
  })

  it('normalizes whitespace and casing for known type values', () => {
    expect(getTypeBadgeStyle('  BUG FIX  ')).toEqual({
      label: 'Bug Fix',
      color: 'plan-bug',
      variant: 'tonal',
    })
  })
})

describe('getPriorityBadgeStyle', () => {
  it('returns badge color and variant for a known priority', () => {
    expect(getPriorityBadgeStyle('critical')).toEqual({
      label: 'Critical',
      color: 'priority-critical',
      variant: 'tonal',
    })
  })

  it('normalizes casing and whitespace', () => {
    expect(getPriorityBadgeStyle('  HiGh  ')).toEqual({
      label: 'High',
      color: 'priority-high',
      variant: 'tonal',
    })
  })

  it('returns unknown badge style for empty or unsupported values', () => {
    expect(getPriorityBadgeStyle('')).toEqual({
      label: 'Unknown',
      color: 'grey',
      variant: 'outlined',
    })
  })
})
