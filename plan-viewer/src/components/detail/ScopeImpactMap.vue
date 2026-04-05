<script setup lang="ts">
import * as d3 from 'd3'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import type { GraphLink, GraphNode, ScopeArea } from '../../types'
import { GraphNodeType } from '../../types'
import {
  createDragBehavior,
  createForceSimulation,
  createZoomBehavior,
  getLinkCoordinates,
  SCOPE_IMPACT_LEGEND_ITEMS,
  SCOPE_IMPACT_MAP_CONTROL_HINTS,
  getTooltipContent,
  getTooltipPosition,
  renderLinks,
  renderNodes,
  scaleNodeRadii,
  type ScopeSimulationLink,
} from '../../utils/d3'

const props = withDefaults(
  defineProps<{
    scopeAreas?: ScopeArea[]
    planLabel?: string
  }>(),
  {
    scopeAreas: () => [],
    planLabel: 'Implementation Plan',
  },
)

const svgRef = ref<SVGSVGElement | null>(null)
const rootRef = ref<HTMLElement | null>(null)
const renderError = ref<string | null>(null)
const simulation = ref<d3.Simulation<GraphNode, ScopeSimulationLink> | null>(null)
const tooltipRef = ref<HTMLDivElement | null>(null)
const resizeTimeout = ref<ReturnType<typeof setTimeout> | null>(null)
const legendItems = SCOPE_IMPACT_LEGEND_ITEMS
const controlHints = SCOPE_IMPACT_MAP_CONTROL_HINTS

const normalizedAreas = computed<ScopeArea[]>(() => {
  const merged = new Map<string, ScopeArea>()

  for (const area of props.scopeAreas) {
    const normalizedName = area.name.trim()

    if (normalizedName.length === 0) {
      continue
    }

    const key = normalizedName.toLowerCase()
    const mentions = Number.isFinite(area.mentions) && area.mentions > 0 ? area.mentions : 1
    const existing = merged.get(key)

    if (!existing) {
      merged.set(key, {
        ...area,
        name: normalizedName,
        mentions,
      })
      continue
    }

    existing.mentions += mentions

    if (existing.changeType === undefined && area.changeType !== undefined) {
      existing.changeType = area.changeType
    }
  }

  return [...merged.values()]
})

const totalMentions = computed(() =>
  normalizedAreas.value.reduce((total, area) => total + area.mentions, 0),
)

const topArea = computed(() => {
  if (normalizedAreas.value.length === 0) {
    return null
  }

  return [...normalizedAreas.value].sort((left, right) => right.mentions - left.mentions)[0]
})

const graphData = computed<{ nodes: GraphNode[]; links: GraphLink[] }>(() => {
  const planNode: GraphNode = {
    id: 'plan-root',
    label: props.planLabel,
    type: GraphNodeType.PLAN,
    mentions: Math.max(1, totalMentions.value),
    radius: 30,
  }

  const areaNodes: GraphNode[] = normalizedAreas.value.map((area) => ({
    id: `scope-area-${area.name.toLowerCase().replace(/\s+/gu, '-')}`,
    label: area.name,
    type: GraphNodeType.AREA,
    changeType: area.changeType,
    mentions: Math.max(1, area.mentions),
    radius: 12 + Math.min(area.mentions, 10) * 1.8,
  }))

  const links: GraphLink[] = areaNodes.map((areaNode) => ({
    source: planNode.id,
    target: areaNode.id,
    value: Math.max(1, areaNode.mentions),
  }))

  return {
    nodes: [planNode, ...areaNodes],
    links,
  }
})

const stopSimulation = (): void => {
  simulation.value?.stop()
  simulation.value = null
}

const resetTooltip = (): void => {
  tooltipRef.value?.remove()
  tooltipRef.value = null
}

const clearResizeTimeout = (): void => {
  if (resizeTimeout.value !== null) {
    clearTimeout(resizeTimeout.value)
    resizeTimeout.value = null
  }
}

const renderGraph = (): void => {
  if (!svgRef.value) {
    return
  }

  stopSimulation()
  resetTooltip()
  renderError.value = null

  const svg = d3.select(svgRef.value)
  svg.selectAll('*').remove()
  svg.on('.zoom', null)

  if (normalizedAreas.value.length === 0) {
    return
  }

  try {
    const width = Math.max(640, Math.round(svgRef.value.clientWidth || 0))
    const height = 360

    svg.attr('viewBox', `0 0 ${width} ${height}`).attr('role', 'img').attr('aria-label', 'Scope impact map')
    const viewport = svg.append('g').attr('class', 'scope-impact-map__viewport')
    const tooltipContainer = rootRef.value ?? svgRef.value.parentElement
    const tooltip = tooltipContainer
      ? d3
          .select(tooltipContainer)
          .append('div')
          .attr('class', 'scope-impact-map__tooltip')
          .attr('role', 'status')
          .style('position', 'absolute')
          .style('pointer-events', 'none')
          .style('opacity', '0')
      : null

    if (tooltip?.node()) {
      tooltipRef.value = tooltip.node()
    }

    const { simulation: scopeSimulation, links, nodes } = createForceSimulation({
      width,
      height,
      nodes: scaleNodeRadii(graphData.value.nodes),
      links: graphData.value.links,
    })

    const linkSelection = renderLinks({ container: viewport, links })

    const labelSelection = viewport
      .append('g')
      .attr('fill', 'var(--text-h)')
      .attr('font-size', 12)
      .attr('font-family', 'Inter, system-ui, sans-serif')
      .selectAll<SVGTextElement, GraphNode>('text')
      .data(nodes)
      .join('text')
      .text((node: GraphNode) => node.label)
      .attr('text-anchor', 'middle')
      .attr('dy', (node: GraphNode) => (node.type === GraphNodeType.PLAN ? 4 : node.radius + 14))

    const nodeSelection = renderNodes({ container: viewport, nodes })

    nodeSelection.append('title').text((node: GraphNode) => `${node.label}: ${node.mentions} mention(s)`)

    const connectedNodeIdsById = new Map<string, Set<string>>()
    for (const link of links) {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id
      const targetId = typeof link.target === 'string' ? link.target : link.target.id

      if (!connectedNodeIdsById.has(sourceId)) {
        connectedNodeIdsById.set(sourceId, new Set<string>())
      }
      if (!connectedNodeIdsById.has(targetId)) {
        connectedNodeIdsById.set(targetId, new Set<string>())
      }

      connectedNodeIdsById.get(sourceId)?.add(targetId)
      connectedNodeIdsById.get(targetId)?.add(sourceId)
    }

    let activeNodeId: string | null = null
    const applyHighlightState = (): void => {
      linkSelection
        .attr('stroke-opacity', (link: ScopeSimulationLink) => {
          if (!activeNodeId) {
            return 0.8
          }

          const sourceId = typeof link.source === 'string' ? link.source : link.source.id
          const targetId = typeof link.target === 'string' ? link.target : link.target.id
          return sourceId === activeNodeId || targetId === activeNodeId ? 1 : 0.14
        })
        .attr('stroke', (link: ScopeSimulationLink) => {
          if (!activeNodeId) {
            return 'color-mix(in srgb, var(--accent) 30%, var(--border))'
          }

          const sourceId = typeof link.source === 'string' ? link.source : link.source.id
          const targetId = typeof link.target === 'string' ? link.target : link.target.id
          return sourceId === activeNodeId || targetId === activeNodeId
            ? 'color-mix(in srgb, var(--accent) 55%, #fff)'
            : 'color-mix(in srgb, var(--accent) 10%, var(--border))'
        })
        .attr('stroke-width', (link: ScopeSimulationLink) => {
          if (!activeNodeId) {
            return 1 + Math.min(link.value, 5)
          }

          const sourceId = typeof link.source === 'string' ? link.source : link.source.id
          const targetId = typeof link.target === 'string' ? link.target : link.target.id
          const isConnected = sourceId === activeNodeId || targetId === activeNodeId
          return (1 + Math.min(link.value, 5)) * (isConnected ? 1.15 : 0.7)
        })

      nodeSelection
        .attr('opacity', (node: GraphNode) => {
          if (!activeNodeId) {
            return 1
          }

          const connected = connectedNodeIdsById.get(activeNodeId)
          return node.id === activeNodeId || connected?.has(node.id) ? 1 : 0.35
        })
        .attr('stroke-width', (node: GraphNode) => (activeNodeId && node.id === activeNodeId ? 3 : 1.5))

      labelSelection.attr('opacity', (node: GraphNode) => {
        if (!activeNodeId) {
          return 1
        }

        const connected = connectedNodeIdsById.get(activeNodeId)
        return node.id === activeNodeId || connected?.has(node.id) ? 1 : 0.45
      })
    }

    const drag = createDragBehavior({
      getSimulation: () => simulation.value,
    })

    nodeSelection.call(drag)
    nodeSelection
      .on('click', (event: MouseEvent, node: GraphNode) => {
        event.stopPropagation()
        activeNodeId = activeNodeId === node.id ? null : node.id
        applyHighlightState()
      })
      .on('mouseenter', (event: MouseEvent, node: GraphNode) => {
        if (!tooltip) {
          return
        }

        const position = getTooltipPosition(event, tooltipContainer!)
        tooltip
          .text(getTooltipContent(node))
          .style('left', `${position.left}px`)
          .style('top', `${position.top}px`)
          .style('opacity', '1')
      })
      .on('mousemove', (event: MouseEvent) => {
        if (!tooltip) {
          return
        }

        const position = getTooltipPosition(event, tooltipContainer!)
        tooltip.style('left', `${position.left}px`).style('top', `${position.top}px`)
      })
      .on('mouseleave', () => {
        tooltip?.style('opacity', '0')
      })

    svg.on('click', () => {
      if (!activeNodeId) {
        return
      }

      activeNodeId = null
      applyHighlightState()
    })

    svg.call(createZoomBehavior({ viewport }))
    applyHighlightState()

    simulation.value = scopeSimulation.on('tick', () => {
        linkSelection
          .attr('x1', (link: ScopeSimulationLink) => getLinkCoordinates(link).x1)
          .attr('y1', (link: ScopeSimulationLink) => getLinkCoordinates(link).y1)
          .attr('x2', (link: ScopeSimulationLink) => getLinkCoordinates(link).x2)
          .attr('y2', (link: ScopeSimulationLink) => getLinkCoordinates(link).y2)

        nodeSelection
          .attr('cx', (node: GraphNode) => node.x ?? 0)
          .attr('cy', (node: GraphNode) => node.y ?? 0)

        labelSelection
          .attr('x', (node: GraphNode) => node.x ?? 0)
          .attr('y', (node: GraphNode) => node.y ?? 0)
      })
  } catch {
    renderError.value = 'Unable to render scope impact map.'
  }
}

const renderGraphDebounced = (): void => {
  clearResizeTimeout()
  resizeTimeout.value = setTimeout(() => {
    renderGraph()
    resizeTimeout.value = null
  }, 120)
}

watch(graphData, () => {
  renderGraph()
})

onMounted(() => {
  renderGraph()
  window.addEventListener('resize', renderGraphDebounced)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', renderGraphDebounced)
  clearResizeTimeout()
  stopSimulation()
  resetTooltip()
})
</script>

<template>
  <section ref="rootRef" class="scope-impact-map" data-testid="scope-impact-map">
    <header class="scope-impact-map__header">
      <h2 class="scope-impact-map__title">Scope Impact Map</h2>
      <p class="scope-impact-map__summary" data-testid="scope-impact-map-summary">
        <template v-if="normalizedAreas.length > 0">
          {{ normalizedAreas.length }} areas · {{ totalMentions }} mentions · Highest impact: {{ topArea?.name }}
        </template>
        <template v-else>No scope areas detected yet.</template>
      </p>
    </header>

    <div
      class="scope-impact-map__legend"
      data-testid="scope-impact-map-legend"
      role="list"
      aria-label="Legend"
    >
      <span
        v-for="item in legendItems"
        :key="item.id"
        class="scope-impact-map__legend-item"
        role="listitem"
      >
        <i class="scope-impact-map__swatch" :class="`scope-impact-map__swatch--${item.swatchModifier}`" />
        {{ item.label }}
      </span>
    </div>
    <p class="scope-impact-map__controls" data-testid="scope-impact-map-controls">
      Controls: {{ controlHints.join(' · ') }}
    </p>

    <p v-if="renderError" class="scope-impact-map__error" data-testid="scope-impact-map-error">{{ renderError }}</p>

    <p v-if="normalizedAreas.length === 0" class="scope-impact-map__empty" data-testid="scope-impact-map-empty">
      Add scope frontmatter or proposed change headings to populate this graph.
    </p>

    <svg
      v-else
      ref="svgRef"
      class="scope-impact-map__canvas"
      data-testid="scope-impact-map-canvas"
      preserveAspectRatio="xMidYMid meet"
    />
  </section>
</template>

<style scoped>
.scope-impact-map {
  position: relative;
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  background: var(--bg);
  padding: 1rem;
  display: grid;
  gap: 0.9rem;
}

.scope-impact-map__header {
  display: grid;
  gap: 0.35rem;
}

.scope-impact-map__title {
  margin: 0;
  font-size: 1.1rem;
  color: var(--text-h);
}

.scope-impact-map__summary,
.scope-impact-map__controls,
.scope-impact-map__empty,
.scope-impact-map__error {
  margin: 0;
  color: var(--text-m, var(--text));
}

.scope-impact-map__error {
  color: #dc2626;
}

.scope-impact-map__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  color: var(--text);
  font-size: 0.85rem;
}

.scope-impact-map__legend-item {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.scope-impact-map__swatch {
  display: inline-block;
  width: 0.8rem;
  height: 0.8rem;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--bg) 75%, var(--border));
}

.scope-impact-map__swatch--plan {
  background: var(--accent);
}

.scope-impact-map__swatch--add {
  background: #16a34a;
}

.scope-impact-map__swatch--modify {
  background: #f59e0b;
}

.scope-impact-map__swatch--remove {
  background: #dc2626;
}

.scope-impact-map__canvas {
  width: 100%;
  min-height: 20rem;
  border-radius: 0.6rem;
  border: 1px solid color-mix(in srgb, var(--accent) 20%, var(--border));
  background: color-mix(in srgb, var(--accent) 4%, var(--bg));
}

:deep(.scope-impact-map__tooltip) {
  padding: 0.35rem 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-h);
  background: color-mix(in srgb, var(--bg) 92%, #000);
  border: 1px solid var(--border);
  box-shadow: 0 6px 20px rgb(0 0 0 / 0.2);
  transition: opacity 120ms ease-in-out;
  z-index: 4;
  max-width: 16rem;
}
</style>
