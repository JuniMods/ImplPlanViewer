import * as d3 from 'd3'

import type { GraphNode } from '../../types'

import type { ScopeSimulationLink } from './forceSimulation'

export interface DragBehaviorConfig {
  getSimulation: () => d3.Simulation<GraphNode, ScopeSimulationLink> | null
  alphaTarget?: number
}

export const createDragBehavior = ({
  getSimulation,
  alphaTarget = 0.2,
}: DragBehaviorConfig): d3.DragBehavior<SVGCircleElement, GraphNode, GraphNode> =>
  d3
    .drag<SVGCircleElement, GraphNode, GraphNode>()
    .subject((_event: unknown, node: GraphNode) => node)
    .on('start', (event: d3.D3DragEvent<SVGCircleElement, GraphNode, GraphNode>, node: GraphNode) => {
      if (!event.active) {
        getSimulation()?.alphaTarget(alphaTarget).restart()
      }
      node.fx = node.x
      node.fy = node.y
    })
    .on('drag', (event: d3.D3DragEvent<SVGCircleElement, GraphNode, GraphNode>, node: GraphNode) => {
      node.fx = event.x
      node.fy = event.y
    })
    .on('end', (event: d3.D3DragEvent<SVGCircleElement, GraphNode, GraphNode>, node: GraphNode) => {
      if (!event.active) {
        getSimulation()?.alphaTarget(0)
      }
      node.fx = null
      node.fy = null
    })

export interface ZoomBehaviorConfig {
  viewport: d3.Selection<SVGGElement, unknown, null, undefined>
  minScale?: number
  maxScale?: number
}

export const createZoomBehavior = ({
  viewport,
  minScale = 0.5,
  maxScale = 3,
}: ZoomBehaviorConfig): d3.ZoomBehavior<SVGSVGElement, unknown> =>
  d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([minScale, maxScale])
    .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
      viewport.attr('transform', event.transform.toString())
    })

const TYPE_LABELS: Record<GraphNode['type'], string> = {
  plan: 'Plan',
  area: 'Scope area',
}

export const getTooltipContent = (node: GraphNode): string =>
  `${node.label} · ${TYPE_LABELS[node.type]} · ${node.mentions} mention(s)`

export interface TooltipPosition {
  left: number
  top: number
}

export const getTooltipPosition = (event: MouseEvent, container: HTMLElement): TooltipPosition => {
  const bounds = container.getBoundingClientRect()
  const offsetX = 12
  const offsetY = 12
  const nextLeft = event.clientX - bounds.left + offsetX
  const nextTop = event.clientY - bounds.top + offsetY

  return {
    left: Number.isFinite(nextLeft) ? nextLeft : offsetX,
    top: Number.isFinite(nextTop) ? nextTop : offsetY,
  }
}
