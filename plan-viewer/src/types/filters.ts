import type { PlanType, Priority } from './plan'
import { isPlanType, isPriority } from './plan'

export interface FilterState {
  types: PlanType[]
  priorities: Priority[]
  scopes: string[]
  completionMin: number
  completionMax: number
  searchQuery: string
}

export type FilterUpdate = Partial<FilterState>

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const hasString = (value: Record<string, unknown>, key: string): boolean =>
  typeof value[key] === 'string'

const hasStringArray = (value: Record<string, unknown>, key: string): boolean =>
  Array.isArray(value[key]) && (value[key] as unknown[]).every((entry) => typeof entry === 'string')

const isCompletionValue = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100

export const isFilterState = (value: unknown): value is FilterState => {
  if (!isObject(value)) {
    return false
  }

  return (
    Array.isArray(value.types) &&
    value.types.every((entry) => isPlanType(entry)) &&
    Array.isArray(value.priorities) &&
    value.priorities.every((entry) => isPriority(entry)) &&
    hasStringArray(value, 'scopes') &&
    isCompletionValue(value.completionMin) &&
    isCompletionValue(value.completionMax) &&
    value.completionMin <= value.completionMax &&
    hasString(value, 'searchQuery')
  )
}

export const assertFilterState = (value: unknown): asserts value is FilterState => {
  if (!isFilterState(value)) {
    throw new TypeError('Invalid filter state payload')
  }
}
