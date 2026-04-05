import * as d3 from 'd3'

import type { GraphLink, GraphNode } from '../../types'
import { isGraphLink } from '../../types'

import type { ScopeSimulationLink } from './forceSimulation'

const LINK_STROKE = 'color-mix(in srgb, var(--accent) 30%, var(--border))'
const LINK_STROKE_OPACITY = 0.8

const validateLinks = (links: GraphLink[]): void => {
  for (const link of links) {
    if (!isGraphLink(link)) {
      throw new TypeError('Invalid graph link payload')
    }
  }
}

export const getLinkStrokeWidth = (link: GraphLink): number => 1 + Math.min(link.value, 5)

const resolveNode = (endpoint: string | GraphNode): GraphNode | null =>
  typeof endpoint === 'string' ? null : endpoint

export interface LinkCoordinates {
  x1: number
  y1: number
  x2: number
  y2: number
}

export const getLinkCoordinates = (link: ScopeSimulationLink): LinkCoordinates => {
  const source = resolveNode(link.source)
  const target = resolveNode(link.target)

  return {
    x1: source?.x ?? 0,
    y1: source?.y ?? 0,
    x2: target?.x ?? 0,
    y2: target?.y ?? 0,
  }
}

export interface RenderLinksConfig {
  container: d3.Selection<SVGSVGElement | SVGGElement, unknown, null, undefined>
  links: ScopeSimulationLink[]
}

export const renderLinks = ({
  container,
  links,
}: RenderLinksConfig): d3.Selection<SVGLineElement, ScopeSimulationLink, SVGGElement, unknown> => {
  validateLinks(links)

  return container
    .append('g')
    .attr('stroke', LINK_STROKE)
    .attr('stroke-opacity', LINK_STROKE_OPACITY)
    .selectAll<SVGLineElement, ScopeSimulationLink>('line')
    .data(links)
    .join('line')
    .attr('stroke-width', (link: ScopeSimulationLink) => getLinkStrokeWidth(link))
}
