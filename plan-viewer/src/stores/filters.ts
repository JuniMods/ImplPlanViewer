import { defineStore } from 'pinia'

import type { FilterState, FilterUpdate, PlanMetadata, PlanType, Priority } from '../types'
import { PlanType as PlanTypeValues, Priority as PriorityValues } from '../types'

const DEFAULT_FILTER_STATE: FilterState = {
  types: [],
  priorities: [],
  scopes: [],
  completionMin: 0,
  completionMax: 100,
  searchQuery: '',
}

const clampCompletion = (value: number): number => Math.max(0, Math.min(100, value))

const unique = <T>(values: T[]): T[] => [...new Set(values)]

const normalizeTypes = (values: PlanType[]): PlanType[] => {
  const validTypes = new Set(Object.values(PlanTypeValues))
  return unique(values).filter((value): value is PlanType => validTypes.has(value))
}

const normalizePriorities = (values: Priority[]): Priority[] => {
  const validPriorities = new Set(Object.values(PriorityValues))
  return unique(values).filter((value): value is Priority => validPriorities.has(value))
}

const normalizeScopes = (values: string[]): string[] =>
  unique(values.map((scope) => scope.trim()).filter((scope) => scope.length > 0))

const normalizeRange = (min: number, max: number): Pick<FilterState, 'completionMin' | 'completionMax'> => {
  const normalizedMin = clampCompletion(min)
  const normalizedMax = clampCompletion(max)

  if (normalizedMin <= normalizedMax) {
    return { completionMin: normalizedMin, completionMax: normalizedMax }
  }

  return { completionMin: normalizedMax, completionMax: normalizedMin }
}

const parseCompletion = (value: string | null, fallback: number): number => {
  if (value === null || value.trim().length === 0) {
    return fallback
  }

  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

const extractCompletion = (plan: PlanMetadata): number | null => {
  const completion = (plan as PlanMetadata & { completion?: unknown }).completion
  return typeof completion === 'number' && Number.isFinite(completion) ? completion : null
}

export const useFiltersStore = defineStore('filters', {
  state: (): FilterState => ({ ...DEFAULT_FILTER_STATE }),

  getters: {
    hasActiveFilters: (state): boolean =>
      state.types.length > 0 ||
      state.priorities.length > 0 ||
      state.scopes.length > 0 ||
      state.completionMin > DEFAULT_FILTER_STATE.completionMin ||
      state.completionMax < DEFAULT_FILTER_STATE.completionMax ||
      state.searchQuery.length > 0,

    activeFilterCount: (state): number =>
      state.types.length +
      state.priorities.length +
      state.scopes.length +
      (state.completionMin > DEFAULT_FILTER_STATE.completionMin ? 1 : 0) +
      (state.completionMax < DEFAULT_FILTER_STATE.completionMax ? 1 : 0) +
      (state.searchQuery.length > 0 ? 1 : 0),

    filterFunction: (state) => (plan: PlanMetadata): boolean => {
      if (state.types.length > 0 && !state.types.includes(plan.type)) {
        return false
      }

      if (state.priorities.length > 0 && !state.priorities.includes(plan.priority)) {
        return false
      }

      const normalizedPlanScope = plan.scope.toLowerCase()
      if (
        state.scopes.length > 0 &&
        !state.scopes.some((scope) => normalizedPlanScope.includes(scope.toLowerCase()))
      ) {
        return false
      }

      const completion = extractCompletion(plan)
      if (completion !== null && (completion < state.completionMin || completion > state.completionMax)) {
        return false
      }

      const normalizedQuery = state.searchQuery.trim().toLowerCase()
      if (!normalizedQuery) {
        return true
      }

      const searchableContent = [plan.type, plan.priority, plan.scope].join(' ').toLowerCase()
      return searchableContent.includes(normalizedQuery)
    },
  },

  actions: {
    patchFilters(update: FilterUpdate): void {
      if (update.types !== undefined) {
        this.types = normalizeTypes(update.types)
      }

      if (update.priorities !== undefined) {
        this.priorities = normalizePriorities(update.priorities)
      }

      if (update.scopes !== undefined) {
        this.scopes = normalizeScopes(update.scopes)
      }

      if (update.completionMin !== undefined || update.completionMax !== undefined) {
        const nextRange = normalizeRange(
          update.completionMin ?? this.completionMin,
          update.completionMax ?? this.completionMax,
        )
        this.completionMin = nextRange.completionMin
        this.completionMax = nextRange.completionMax
      }

      if (update.searchQuery !== undefined) {
        this.searchQuery = update.searchQuery.trim()
      }
    },

    setTypes(types: PlanType[]): void {
      this.types = normalizeTypes(types)
    },

    setPriorities(priorities: Priority[]): void {
      this.priorities = normalizePriorities(priorities)
    },

    setScopes(scopes: string[]): void {
      this.scopes = normalizeScopes(scopes)
    },

    setCompletionRange(min: number, max: number): void {
      const normalized = normalizeRange(min, max)
      this.completionMin = normalized.completionMin
      this.completionMax = normalized.completionMax
    },

    setSearchQuery(query: string): void {
      this.searchQuery = query.trim()
    },

    clearFilters(): void {
      this.types = []
      this.priorities = []
      this.scopes = []
      this.completionMin = DEFAULT_FILTER_STATE.completionMin
      this.completionMax = DEFAULT_FILTER_STATE.completionMax
      this.searchQuery = DEFAULT_FILTER_STATE.searchQuery
    },

    applyFromUrlQuery(query: URLSearchParams): void {
      this.types = normalizeTypes(query.getAll('type') as PlanType[])
      this.priorities = normalizePriorities(query.getAll('priority') as Priority[])
      this.scopes = normalizeScopes(query.getAll('scope'))

      const min = parseCompletion(query.get('completionMin'), DEFAULT_FILTER_STATE.completionMin)
      const max = parseCompletion(query.get('completionMax'), DEFAULT_FILTER_STATE.completionMax)

      this.setCompletionRange(min, max)
      this.searchQuery = query.get('q')?.trim() ?? DEFAULT_FILTER_STATE.searchQuery
    },

    toUrlQuery(): URLSearchParams {
      const query = new URLSearchParams()

      this.types.forEach((type) => query.append('type', type))
      this.priorities.forEach((priority) => query.append('priority', priority))
      this.scopes.forEach((scope) => query.append('scope', scope))

      if (this.completionMin > DEFAULT_FILTER_STATE.completionMin) {
        query.set('completionMin', String(this.completionMin))
      }

      if (this.completionMax < DEFAULT_FILTER_STATE.completionMax) {
        query.set('completionMax', String(this.completionMax))
      }

      if (this.searchQuery) {
        query.set('q', this.searchQuery)
      }

      return query
    },
  },
})
