import {
  getCurrentScope,
  onScopeDispose,
  watch,
  type WatchSource,
  type WatchStopHandle,
} from 'vue'

export interface UseRouteSyncOptions<TRouteState, TStoreState> {
  enabled?: boolean
  getRouteState: () => TRouteState
  applyRouteState: (state: TRouteState) => void
  getStoreState: () => TStoreState
  applyStoreStateToRoute: (state: TStoreState) => void | Promise<void>
  watchRoute: WatchSource | WatchSource[]
  watchStore: WatchSource | WatchSource[]
  serializeRouteState: (state: TRouteState) => string
  serializeStoreState: (state: TStoreState) => string
  watchRouteDeep?: boolean
  watchStoreDeep?: boolean
}

export interface UseRouteSyncResult {
  syncFromRoute: () => void
  syncToRoute: () => Promise<void>
  cleanup: () => void
}

const toWatchSourceList = (source: WatchSource | WatchSource[]): WatchSource[] =>
  Array.isArray(source) ? source : [source]

export const useRouteSync = <TRouteState, TStoreState>(
  options: UseRouteSyncOptions<TRouteState, TStoreState>,
): UseRouteSyncResult => {
  const stopHandles: WatchStopHandle[] = []
  let synchronizedSignature = ''

  const syncFromRoute = (): void => {
    const routeState = options.getRouteState()
    synchronizedSignature = options.serializeRouteState(routeState)
    options.applyRouteState(routeState)
  }

  const syncToRoute = async (): Promise<void> => {
    const storeState = options.getStoreState()
    const nextSignature = options.serializeStoreState(storeState)

    if (nextSignature === synchronizedSignature) {
      return
    }

    synchronizedSignature = nextSignature
    await options.applyStoreStateToRoute(storeState)
  }

  if (options.enabled !== false) {
    syncFromRoute()

    stopHandles.push(
      watch(
        toWatchSourceList(options.watchRoute),
        () => {
          const routeState = options.getRouteState()
          const nextSignature = options.serializeRouteState(routeState)

          if (nextSignature === synchronizedSignature) {
            return
          }

          synchronizedSignature = nextSignature
          options.applyRouteState(routeState)
        },
        { deep: options.watchRouteDeep ?? true },
      ),
    )

    stopHandles.push(
      watch(
        toWatchSourceList(options.watchStore),
        () => {
          void syncToRoute()
        },
        { deep: options.watchStoreDeep ?? false },
      ),
    )
  }

  const cleanup = (): void => {
    stopHandles.forEach((stop) => stop())
    stopHandles.length = 0
  }

  if (getCurrentScope()) {
    onScopeDispose(cleanup)
  }

  return {
    syncFromRoute,
    syncToRoute,
    cleanup,
  }
}
