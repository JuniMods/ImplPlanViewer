import { describe, expect, it } from 'vitest'

import type { GraphLink, GraphNode } from '../../../../src/types'
import { GraphNodeType } from '../../../../src/types'
import type { ScopeSimulationLink } from '../../../../src/utils/d3'
import { getLinkCoordinates, getLinkStrokeWidth } from '../../../../src/utils/d3'

const planNode: GraphNode = {
  id: 'plan-root',
  label: 'Implementation Plan',
  type: GraphNodeType.PLAN,
  mentions: 6,
  radius: 32,
}

const areaNode: GraphNode = {
  id: 'scope-area-auth',
  label: 'Auth',
  type: GraphNodeType.AREA,
  mentions: 3,
  radius: 18,
}

describe('getLinkStrokeWidth', () => {
  it('maps link value to a bounded stroke width', () => {
    expect(getLinkStrokeWidth({ source: 'plan-root', target: 'scope-area-auth', value: 1 })).toBe(2)
    expect(getLinkStrokeWidth({ source: 'plan-root', target: 'scope-area-auth', value: 10 })).toBe(6)
  })
})

describe('getLinkCoordinates', () => {
  it('returns coordinates from resolved graph nodes', () => {
    const link: ScopeSimulationLink = {
      source: { ...planNode, x: 20, y: 25 },
      target: { ...areaNode, x: 120, y: 140 },
      value: 2,
    }

    expect(getLinkCoordinates(link)).toEqual({
      x1: 20,
      y1: 25,
      x2: 120,
      y2: 140,
    })
  })

  it('falls back to zero coordinates when endpoints are unresolved ids', () => {
    const unresolved: GraphLink = { source: 'plan-root', target: 'scope-area-auth', value: 2 }

    expect(getLinkCoordinates(unresolved as ScopeSimulationLink)).toEqual({
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 0,
    })
  })
})
