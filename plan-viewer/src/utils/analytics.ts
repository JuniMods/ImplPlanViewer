import type { Router } from 'vue-router'

type GtagFunction = (...args: unknown[]) => void

export interface AnalyticsConfig {
  enabled: boolean
  measurementId: string
}

export const getAnalyticsConfig = (env: Record<string, unknown>): AnalyticsConfig => {
  const enabled = String(env.VITE_ANALYTICS_ENABLED ?? '').toLowerCase() === 'true'
  const measurementId = String(env.VITE_ANALYTICS_MEASUREMENT_ID ?? '').trim()

  return {
    enabled: enabled && measurementId.length > 0,
    measurementId,
  }
}

const resolveTracker = (): GtagFunction | null => {
  if (typeof window === 'undefined') {
    return null
  }

  const candidate = (window as typeof window & { gtag?: unknown }).gtag
  return typeof candidate === 'function' ? (candidate as GtagFunction) : null
}

export const registerPageViewTracking = (router: Router, config: AnalyticsConfig): boolean => {
  if (!config.enabled) {
    return false
  }

  const tracker = resolveTracker()

  if (!tracker) {
    return false
  }

  router.afterEach((to) => {
    const pageTitle =
      typeof document !== 'undefined' && document.title.trim().length > 0
        ? document.title
        : to.name?.toString() ?? 'Unknown'

    tracker('event', 'page_view', {
      send_to: config.measurementId,
      page_path: to.fullPath,
      page_title: pageTitle,
    })
  })

  return true
}
