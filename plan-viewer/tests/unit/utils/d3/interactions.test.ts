import type * as d3 from 'd3'
import { describe, expect, it, vi } from 'vitest'

import type { GraphNode } from '../../../../src/types'
import { GraphNodeType } from '../../../../src/types'
import {
  createDragBehavior,
  createZoomBehavior,
  getTooltipContent,
  getTooltipPosition,
} from '../../../../src/utils/d3'

const node: GraphNode = {
  id: 'plan-root',
  label: 'Implementation Plan',
  type: GraphNodeType.PLAN,
  mentions: 3,
  radius: 30,
}

describe('createDragBehavior', () => {
  it('pins and unpins node coordinates while updating simulation alpha', () => {
    const alphaTarget = vi.fn()
    const restart = vi.fn()
    const simulation = {
      alphaTarget: (value: number) => {
        alphaTarget(value)
        return { restart }
      },
    }

    const behavior = createDragBehavior({
      getSimulation: () => simulation as never,
    })
    const start = behavior.on('start')
    const drag = behavior.on('drag')
    const end = behavior.on('end')
    const mutableNode = { ...node, x: 20, y: 30 }

    start?.({ active: false } as never, mutableNode)
    drag?.({ x: 55, y: 80 } as never, mutableNode)
    end?.({ active: false } as never, mutableNode)

    expect(alphaTarget).toHaveBeenNthCalledWith(1, 0.2)
    expect(alphaTarget).toHaveBeenNthCalledWith(2, 0)
    expect(restart).toHaveBeenCalledOnce()
    expect(mutableNode.fx).toBeNull()
    expect(mutableNode.fy).toBeNull()
  })
})

describe('createZoomBehavior', () => {
  it('uses default scale extents and exposes zoom handler', () => {
    const viewport = {
      attr: vi.fn(),
    } as unknown as d3.Selection<SVGGElement, unknown, null, undefined>
    const zoom = createZoomBehavior({ viewport })

    expect(zoom.scaleExtent()).toEqual([0.5, 3])
    expect(zoom.on('zoom')).toBeTypeOf('function')
  })
})

describe('tooltip helpers', () => {
  it('formats node details for tooltip display', () => {
    expect(getTooltipContent(node)).toBe('Implementation Plan · Plan · 3 mention(s)')
  })

  it('derives fallback-safe tooltip coordinates', () => {
    const container = {
      getBoundingClientRect: () => ({ left: 20, top: 10 }),
    } as HTMLElement

    expect(getTooltipPosition({ clientX: 80, clientY: 100 } as MouseEvent, container)).toEqual({
      left: 72,
      top: 102,
    })
  })
})
