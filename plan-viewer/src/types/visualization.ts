import type { ScopeAreaChangeType } from './plan'
import { isScopeAreaChangeType } from './plan'

export const GraphNodeType = {
  PLAN: 'plan',
  AREA: 'area',
} as const

export type GraphNodeType = (typeof GraphNodeType)[keyof typeof GraphNodeType]

export interface GraphNode {
  id: string
  label: string
  type: GraphNodeType
  changeType?: ScopeAreaChangeType
  mentions: number
  radius: number
  x?: number
  y?: number
  vx?: number
  vy?: number
  fx?: number | null
  fy?: number | null
}

export interface GraphLink {
  source: string | GraphNode
  target: string | GraphNode
  value: number
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const hasString = (value: Record<string, unknown>, key: string): boolean =>
  typeof value[key] === 'string'

const hasFiniteNumber = (value: Record<string, unknown>, key: string): boolean =>
  typeof value[key] === 'number' && Number.isFinite(value[key] as number)

const hasOptionalFiniteNumber = (value: Record<string, unknown>, key: string): boolean =>
  value[key] === undefined || hasFiniteNumber(value, key)

const hasOptionalFiniteNumberOrNull = (value: Record<string, unknown>, key: string): boolean =>
  value[key] === undefined || value[key] === null || hasFiniteNumber(value, key)

const graphNodeTypeValues = Object.values(GraphNodeType) as string[]

export const isGraphNodeType = (value: unknown): value is GraphNodeType =>
  typeof value === 'string' && graphNodeTypeValues.includes(value)

export const isGraphNode = (value: unknown): value is GraphNode => {
  if (!isObject(value)) {
    return false
  }

  return (
    hasString(value, 'id') &&
    hasString(value, 'label') &&
    isGraphNodeType(value.type) &&
    (value.changeType === undefined || isScopeAreaChangeType(value.changeType)) &&
    hasFiniteNumber(value, 'mentions') &&
    (value.mentions as number) > 0 &&
    hasFiniteNumber(value, 'radius') &&
    (value.radius as number) > 0 &&
    hasOptionalFiniteNumber(value, 'x') &&
    hasOptionalFiniteNumber(value, 'y') &&
    hasOptionalFiniteNumber(value, 'vx') &&
    hasOptionalFiniteNumber(value, 'vy') &&
    hasOptionalFiniteNumberOrNull(value, 'fx') &&
    hasOptionalFiniteNumberOrNull(value, 'fy')
  )
}

export const isGraphLink = (value: unknown): value is GraphLink => {
  if (!isObject(value)) {
    return false
  }

  const sourceIsValid = typeof value.source === 'string' || isGraphNode(value.source)
  const targetIsValid = typeof value.target === 'string' || isGraphNode(value.target)

  return sourceIsValid && targetIsValid && hasFiniteNumber(value, 'value') && (value.value as number) > 0
}

export const assertGraphNode = (value: unknown): asserts value is GraphNode => {
  if (!isGraphNode(value)) {
    throw new TypeError('Invalid graph node payload')
  }
}

export const assertGraphLink = (value: unknown): asserts value is GraphLink => {
  if (!isGraphLink(value)) {
    throw new TypeError('Invalid graph link payload')
  }
}
