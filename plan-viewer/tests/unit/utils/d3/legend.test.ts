import { describe, expect, it } from 'vitest'

import {
  SCOPE_IMPACT_LEGEND_ITEMS,
  SCOPE_IMPACT_MAP_CONTROL_HINTS,
  getLegendSwatchColor,
} from '../../../../src/utils/d3'

describe('SCOPE_IMPACT_LEGEND_ITEMS', () => {
  it('exposes plan and all scope change types in display order', () => {
    expect(SCOPE_IMPACT_LEGEND_ITEMS.map((item) => item.label)).toEqual([
      'Plan',
      'Add',
      'Modify',
      'Remove',
    ])
  })
})

describe('getLegendSwatchColor', () => {
  it('matches the expected semantic palette', () => {
    expect(getLegendSwatchColor(SCOPE_IMPACT_LEGEND_ITEMS[0]!)).toBe('var(--accent)')
    expect(getLegendSwatchColor(SCOPE_IMPACT_LEGEND_ITEMS[1]!)).toBe('#16a34a')
    expect(getLegendSwatchColor(SCOPE_IMPACT_LEGEND_ITEMS[2]!)).toBe('#f59e0b')
    expect(getLegendSwatchColor(SCOPE_IMPACT_LEGEND_ITEMS[3]!)).toBe('#dc2626')
  })
})

describe('SCOPE_IMPACT_MAP_CONTROL_HINTS', () => {
  it('includes all supported graph interactions', () => {
    expect(SCOPE_IMPACT_MAP_CONTROL_HINTS).toEqual([
      'Drag nodes',
      'Scroll to zoom',
      'Drag canvas to pan',
    ])
  })
})
