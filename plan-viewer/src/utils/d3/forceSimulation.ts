import * as d3 from 'd3'

import type { GraphLink, GraphNode } from '../../types'
import { isGraphLink, isGraphNode } from '../../types'

export type ScopeSimulationLink = d3.SimulationLinkDatum<GraphNode> & GraphLink

export interface ForceSimulationConfig {
  width: number
  height: number
  nodes: GraphNode[]
  links: GraphLink[]
}

export interface ForceSimulationSetup {
  nodes: GraphNode[]
  links: ScopeSimulationLink[]
  simulation: d3.Simulation<GraphNode, ScopeSimulationLink>
}

const validateDimension = (value: number, name: 'width' | 'height'): void => {
  if (!Number.isFinite(value) || value <= 0) {
    throw new TypeError(`Force simulation ${name} must be a finite number greater than zero`)
  }
}

const cloneNodes = (nodes: GraphNode[]): GraphNode[] =>
  nodes.map((node) => {
    if (!isGraphNode(node)) {
      throw new TypeError('Invalid graph node payload')
    }

    return { ...node }
  })

const cloneLinks = (links: GraphLink[]): ScopeSimulationLink[] =>
  links.map((link) => {
    if (!isGraphLink(link)) {
      throw new TypeError('Invalid graph link payload')
    }

    return { ...link }
  })

export const createForceSimulation = ({
  width,
  height,
  nodes,
  links,
}: ForceSimulationConfig): ForceSimulationSetup => {
  validateDimension(width, 'width')
  validateDimension(height, 'height')

  const simulationNodes = cloneNodes(nodes)

  if (simulationNodes.length === 0) {
    throw new TypeError('Force simulation requires at least one node')
  }

  const simulationLinks = cloneLinks(links)

  const simulation = d3
    .forceSimulation<GraphNode>(simulationNodes)
    .force(
      'link',
      d3
        .forceLink<GraphNode, ScopeSimulationLink>(simulationLinks)
        .id((node: GraphNode) => node.id)
        .distance(110)
        .strength(0.7),
    )
    .force('charge', d3.forceManyBody<GraphNode>().strength(-260))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide<GraphNode>().radius((node: GraphNode) => node.radius + 10).strength(0.9))

  return {
    nodes: simulationNodes,
    links: simulationLinks,
    simulation,
  }
}
