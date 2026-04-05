import * as d3 from 'd3'

import type { GraphNode } from '../../types'
import { GraphNodeType, ScopeAreaChangeType, isGraphNode } from '../../types'

export const NODE_RADIUS_RANGE = [10, 40] as const

const DEFAULT_NODE_COLOR = 'color-mix(in srgb, var(--accent) 55%, var(--bg))'

const validateNodes = (nodes: GraphNode[]): void => {
  for (const node of nodes) {
    if (!isGraphNode(node)) {
      throw new TypeError('Invalid graph node payload')
    }
  }
}

export const scaleNodeRadii = (nodes: GraphNode[]): GraphNode[] => {
  validateNodes(nodes)

  const maxMentions = nodes.reduce((max, node) => Math.max(max, node.mentions), 1)
  const radiusScale = d3
    .scaleSqrt<number, number>()
    .domain([1, maxMentions])
    .range([...NODE_RADIUS_RANGE])

  return nodes.map((node) => ({
    ...node,
    radius: maxMentions === 1 ? NODE_RADIUS_RANGE[0] : radiusScale(node.mentions),
  }))
}

export const getNodeFill = (node: GraphNode): string => {
  if (node.type === GraphNodeType.PLAN) {
    return 'var(--accent)'
  }

  if (node.changeType === ScopeAreaChangeType.ADD) {
    return '#16a34a'
  }

  if (node.changeType === ScopeAreaChangeType.MODIFY) {
    return '#f59e0b'
  }

  if (node.changeType === ScopeAreaChangeType.REMOVE) {
    return '#dc2626'
  }

  return DEFAULT_NODE_COLOR
}

export interface RenderNodesConfig {
  container: d3.Selection<SVGSVGElement | SVGGElement, unknown, null, undefined>
  nodes: GraphNode[]
}

export const renderNodes = ({
  container,
  nodes,
}: RenderNodesConfig): d3.Selection<SVGCircleElement, GraphNode, SVGGElement, unknown> =>
  container
    .append('g')
    .attr('stroke', 'var(--bg)')
    .attr('stroke-width', 1.5)
    .selectAll<SVGCircleElement, GraphNode>('circle')
    .data(nodes)
    .join('circle')
    .attr('r', (node: GraphNode) => node.radius)
    .attr('fill', (node: GraphNode) => getNodeFill(node))
