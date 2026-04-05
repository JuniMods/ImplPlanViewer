import { describe, expect, it } from 'vitest'

import type { GraphNode } from '../../../../src/types'
import { GraphNodeType, ScopeAreaChangeType } from '../../../../src/types'
import { NODE_RADIUS_RANGE, getNodeFill, scaleNodeRadii } from '../../../../src/utils/d3'

const nodes: GraphNode[] = [
  {
    id: 'plan-root',
    label: 'Implementation Plan',
    type: GraphNodeType.PLAN,
    mentions: 9,
    radius: 30,
  },
  {
    id: 'scope-area-auth',
    label: 'Auth',
    type: GraphNodeType.AREA,
    changeType: ScopeAreaChangeType.ADD,
    mentions: 1,
    radius: 16,
  },
  {
    id: 'scope-area-api',
    label: 'API',
    type: GraphNodeType.AREA,
    changeType: ScopeAreaChangeType.MODIFY,
    mentions: 4,
    radius: 16,
  },
]

describe('scaleNodeRadii', () => {
  it('scales node radii by mentions using the configured range', () => {
    const scaledNodes = scaleNodeRadii(nodes)

    expect(scaledNodes).toHaveLength(3)
    expect(scaledNodes).not.toBe(nodes)
    expect(scaledNodes[0]?.radius).toBeCloseTo(NODE_RADIUS_RANGE[1], 5)
    expect(scaledNodes[1]?.radius).toBeCloseTo(NODE_RADIUS_RANGE[0], 5)
    expect(scaledNodes[2]?.radius).toBeGreaterThan(NODE_RADIUS_RANGE[0])
    expect(scaledNodes[2]?.radius).toBeLessThan(NODE_RADIUS_RANGE[1])
  })

  it('throws when a node payload is invalid', () => {
    expect(() => scaleNodeRadii([{ ...nodes[0], mentions: 0 }, nodes[1], nodes[2]])).toThrow(
      'Invalid graph node payload',
    )
  })
})

describe('getNodeFill', () => {
  it('returns semantic colors for plan and change types', () => {
    expect(getNodeFill(nodes[0]!)).toBe('var(--accent)')
    expect(getNodeFill(nodes[1]!)).toBe('#16a34a')
    expect(getNodeFill(nodes[2]!)).toBe('#f59e0b')
    expect(
      getNodeFill({
        ...nodes[2]!,
        changeType: ScopeAreaChangeType.REMOVE,
      }),
    ).toBe('#dc2626')
  })

  it('falls back to the default area color when change type is absent', () => {
    expect(getNodeFill({ ...nodes[1]!, changeType: undefined })).toBe(
      'color-mix(in srgb, var(--accent) 55%, var(--bg))',
    )
  })
})
