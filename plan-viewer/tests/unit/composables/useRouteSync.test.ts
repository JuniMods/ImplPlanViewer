import { beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick, ref } from 'vue'

import { useRouteSync } from '../../../src/composables/useRouteSync'

const serializeState = (state: { params: Record<string, string>; query: Record<string, string> }): string => {
  const params = Object.entries(state.params)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}:${value}`)
    .join('|')

  const query = Object.entries(state.query)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}:${value}`)
    .join('|')

  return `${params}__${query}`
}

describe('useRouteSync composable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('hydrates store state from route state and syncs store changes back to route', async () => {
    const routeState = ref({
      params: { repoId: 'alpha' },
      query: { q: 'initial' },
    })

    const storeState = ref({
      params: { repoId: '' },
      query: { q: '' },
    })

    const applyStoreStateToRoute = vi.fn((state: { params: Record<string, string>; query: Record<string, string> }) => {
      routeState.value = {
        params: { ...state.params },
        query: { ...state.query },
      }
    })

    const scope = effectScope()
    const sync = scope.run(() =>
      useRouteSync({
        getRouteState: () => routeState.value,
        applyRouteState: (state) => {
          storeState.value = {
            params: { ...state.params },
            query: { ...state.query },
          }
        },
        getStoreState: () => storeState.value,
        applyStoreStateToRoute,
        watchRoute: routeState,
        watchStore: storeState,
        serializeRouteState: serializeState,
        serializeStoreState: serializeState,
      }),
    )

    await nextTick()

    expect(storeState.value).toEqual({
      params: { repoId: 'alpha' },
      query: { q: 'initial' },
    })

    storeState.value = {
      params: { repoId: 'beta' },
      query: { q: 'updated' },
    }

    await nextTick()

    expect(applyStoreStateToRoute).toHaveBeenCalledTimes(1)
    expect(routeState.value).toEqual({
      params: { repoId: 'beta' },
      query: { q: 'updated' },
    })

    sync?.cleanup()
    scope.stop()
  })

  it('supports disabling synchronization', async () => {
    const routeState = ref({
      params: { repoId: 'alpha' },
      query: { q: 'route' },
    })

    const storeState = ref({
      params: { repoId: '' },
      query: { q: '' },
    })

    const applyStoreStateToRoute = vi.fn()

    const scope = effectScope()
    scope.run(() =>
      useRouteSync({
        enabled: false,
        getRouteState: () => routeState.value,
        applyRouteState: (state) => {
          storeState.value = {
            params: { ...state.params },
            query: { ...state.query },
          }
        },
        getStoreState: () => storeState.value,
        applyStoreStateToRoute,
        watchRoute: routeState,
        watchStore: storeState,
        serializeRouteState: serializeState,
        serializeStoreState: serializeState,
      }),
    )

    storeState.value = {
      params: { repoId: 'beta' },
      query: { q: 'store' },
    }

    await nextTick()

    expect(storeState.value).toEqual({
      params: { repoId: 'beta' },
      query: { q: 'store' },
    })
    expect(applyStoreStateToRoute).not.toHaveBeenCalled()

    scope.stop()
  })
})
