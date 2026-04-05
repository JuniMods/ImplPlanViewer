import { GraphNodeType, ScopeAreaChangeType, type GraphNode } from '../../types'

import { getNodeFill } from './nodeRenderer'

export type ScopeImpactLegendItemId = 'plan' | ScopeAreaChangeType

export interface ScopeImpactLegendItem {
  id: ScopeImpactLegendItemId
  label: string
  swatchModifier: 'plan' | 'add' | 'modify' | 'remove'
}

const createLegendNode = (
  type: GraphNodeType,
  changeType?: ScopeAreaChangeType,
): GraphNode => ({
  id: `${type}-${changeType ?? 'default'}`,
  label: 'Legend item',
  type,
  changeType,
  mentions: 1,
  radius: 12,
})

export const getLegendSwatchColor = (item: ScopeImpactLegendItem): string => {
  if (item.id === 'plan') {
    return getNodeFill(createLegendNode(GraphNodeType.PLAN))
  }

  return getNodeFill(createLegendNode(GraphNodeType.AREA, item.id))
}

export const SCOPE_IMPACT_LEGEND_ITEMS: ScopeImpactLegendItem[] = [
  {
    id: 'plan',
    label: 'Plan',
    swatchModifier: 'plan',
  },
  {
    id: ScopeAreaChangeType.ADD,
    label: 'Add',
    swatchModifier: 'add',
  },
  {
    id: ScopeAreaChangeType.MODIFY,
    label: 'Modify',
    swatchModifier: 'modify',
  },
  {
    id: ScopeAreaChangeType.REMOVE,
    label: 'Remove',
    swatchModifier: 'remove',
  },
]

export const SCOPE_IMPACT_MAP_CONTROL_HINTS: string[] = ['Drag nodes', 'Scroll to zoom', 'Drag canvas to pan']
