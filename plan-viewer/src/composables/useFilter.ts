import { storeToRefs } from 'pinia'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { LocationQuery, LocationQueryRaw } from 'vue-router'
import { useRoute, useRouter } from 'vue-router'

import { useFiltersStore } from '../stores'
import type { FilterUpdate } from '../types'
import { useRouteSync } from './useRouteSync'

export interface UseFilterOptions {
  syncWithUrl?: boolean
  routeQuery?: MaybeRefOrGetter<LocationQuery>
  replaceRouteQuery?: (query: LocationQueryRaw) => void | Promise<void>
}

const routeQueryToUrlSearchParams = (query: LocationQuery): URLSearchParams => {
  const params = new URLSearchParams()

  for (const [key, rawValue] of Object.entries(query)) {
    if (rawValue === null || rawValue === undefined) {
      continue
    }

    if (Array.isArray(rawValue)) {
      rawValue.forEach((value) => {
        if (value !== null && value !== undefined) {
          params.append(key, String(value))
        }
      })
      continue
    }

    params.append(key, String(rawValue))
  }

  return params
}

const urlSearchParamsToRouteQuery = (params: URLSearchParams): LocationQueryRaw => {
  const groupedValues = new Map<string, string[]>()

  params.forEach((value, key) => {
    groupedValues.set(key, [...(groupedValues.get(key) ?? []), value])
  })

  const query: LocationQueryRaw = {}

  for (const [key, values] of groupedValues.entries()) {
    query[key] = values.length === 1 ? values[0] : values
  }

  return query
}

const serializeParams = (params: URLSearchParams): string => {
  const entries: Array<[string, string]> = []

  params.forEach((value, key) => {
    entries.push([key, value])
  })

  entries.sort(([leftKey, leftValue], [rightKey, rightValue]) => {
    if (leftKey === rightKey) {
      return leftValue.localeCompare(rightValue)
    }

    return leftKey.localeCompare(rightKey)
  })

  return entries.map(([key, value]) => `${key}=${value}`).join('&')
}

export const useFilter = (options: UseFilterOptions = {}) => {
  const filtersStore = useFiltersStore()
  const { types, priorities, scopes, completionMin, completionMax, searchQuery } = storeToRefs(filtersStore)

  const shouldSyncWithUrl = options.syncWithUrl !== false
  const route = shouldSyncWithUrl && options.routeQuery === undefined ? useRoute() : null
  const router = shouldSyncWithUrl && options.replaceRouteQuery === undefined ? useRouter() : null

  const getRouteQuery = (): LocationQuery => {
    if (options.routeQuery !== undefined) {
      return toValue(options.routeQuery)
    }

    return route?.query ?? {}
  }

  const replaceRouteQuery =
    options.replaceRouteQuery ??
    ((query: LocationQueryRaw): Promise<void> =>
      router?.replace({ query }).then(() => undefined) ?? Promise.resolve())

  const routeSync = useRouteSync<URLSearchParams, URLSearchParams>({
    enabled: shouldSyncWithUrl,
    getRouteState: () => routeQueryToUrlSearchParams(getRouteQuery()),
    applyRouteState: (params) => {
      filtersStore.applyFromUrlQuery(params)
    },
    getStoreState: () => filtersStore.toUrlQuery(),
    applyStoreStateToRoute: (params) => replaceRouteQuery(urlSearchParamsToRouteQuery(params)),
    watchRoute: () => getRouteQuery(),
    watchStore: [types, priorities, scopes, completionMin, completionMax, searchQuery],
    serializeRouteState: serializeParams,
    serializeStoreState: serializeParams,
  })

  return {
    types,
    priorities,
    scopes,
    completionMin,
    completionMax,
    searchQuery,
    hasActiveFilters: computed(() => filtersStore.hasActiveFilters),
    activeFilterCount: computed(() => filtersStore.activeFilterCount),
    filterFunction: computed(() => filtersStore.filterFunction),
    applyFilters: (update: FilterUpdate): void => {
      filtersStore.patchFilters(update)
    },
    setTypes: filtersStore.setTypes,
    setPriorities: filtersStore.setPriorities,
    setScopes: filtersStore.setScopes,
    setCompletionRange: filtersStore.setCompletionRange,
    setSearchQuery: filtersStore.setSearchQuery,
    clearFilters: filtersStore.clearFilters,
    applyFromUrlQuery: filtersStore.applyFromUrlQuery,
    toUrlQuery: filtersStore.toUrlQuery,
    syncFromRoute: routeSync.syncFromRoute,
    syncToRoute: routeSync.syncToRoute,
    cleanup: routeSync.cleanup,
  }
}
