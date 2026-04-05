import { describe, expect, it } from 'vitest'

import type { GraphLink, GraphNode } from '../../../../src/types'
import { GraphNodeType } from '../../../../src/types'
import { createForceSimulation } from '../../../../src/utils/d3'

const nodes: GraphNode[] = [
  {
    id: 'plan-root',
    label: 'Implementation Plan',
    type: GraphNodeType.PLAN,
    mentions: 5,
    radius: 30,
  },
  {
    id: 'scope-area-api',
    label: 'API',
    type: GraphNodeType.AREA,
    mentions: 3,
    radius: 16,
  },
]

const links: GraphLink[] = [
  {
    source: 'plan-root',
    target: 'scope-area-api',
    value: 3,
  },
]

describe('createForceSimulation', () => {
  it('creates simulation setup with all expected forces', () => {
    const setup = createForceSimulation({
      width: 800,
      height: 360,
      nodes,
      links,
    })

    expect(setup.nodes).toHaveLength(2)
    expect(setup.links).toHaveLength(1)
    expect(setup.nodes).not.toBe(nodes)
    expect(setup.links).not.toBe(links)
    expect(setup.simulation.force('link')).toBeTruthy()
    expect(setup.simulation.force('charge')).toBeTruthy()
    expect(setup.simulation.force('center')).toBeTruthy()
    expect(setup.simulation.force('collision')).toBeTruthy()

    setup.simulation.stop()
  })

  it('throws when simulation dimensions are invalid', () => {
    expect(() =>
      createForceSimulation({
        width: 0,
        height: 360,
        nodes,
        links,
      }),
    ).toThrow('Force simulation width must be a finite number greater than zero')
  })

  it('throws when a node payload is invalid', () => {
    expect(() =>
      createForceSimulation({
        width: 800,
        height: 360,
        nodes: [{ ...nodes[0], radius: 0 }, nodes[1]],
        links,
      }),
    ).toThrow('Invalid graph node payload')
  })
})
