import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Router } from 'vue-router'

import { getAnalyticsConfig, registerPageViewTracking } from '../../../src/utils/analytics'

describe('analytics utilities', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('enables analytics only when explicitly configured', () => {
    expect(getAnalyticsConfig({ VITE_ANALYTICS_ENABLED: 'true', VITE_ANALYTICS_MEASUREMENT_ID: 'G-123' })).toEqual({
      enabled: true,
      measurementId: 'G-123',
    })

    expect(getAnalyticsConfig({ VITE_ANALYTICS_ENABLED: 'true', VITE_ANALYTICS_MEASUREMENT_ID: '' }).enabled).toBe(
      false,
    )
  })

  it('registers page-view tracking when gtag is available', () => {
    const afterEach = vi.fn()
    const router = { afterEach } as unknown as Router
    const gtag = vi.fn()
    vi.stubGlobal('window', { gtag })
    vi.stubGlobal('document', { title: 'Plans' })

    const registered = registerPageViewTracking(router, { enabled: true, measurementId: 'G-123' })

    expect(registered).toBe(true)
    expect(afterEach).toHaveBeenCalledOnce()

    const callback = afterEach.mock.calls[0][0] as (to: { fullPath: string; name?: string }) => void
    callback({ fullPath: '/repo/001', name: 'plan-detail' })

    expect(gtag).toHaveBeenCalledWith('event', 'page_view', {
      send_to: 'G-123',
      page_path: '/repo/001',
      page_title: 'Plans',
    })
  })

  it('does not register tracking without runtime gtag', () => {
    const afterEach = vi.fn()
    const router = { afterEach } as unknown as Router
    vi.stubGlobal('window', {})

    const registered = registerPageViewTracking(router, { enabled: true, measurementId: 'G-123' })

    expect(registered).toBe(false)
    expect(afterEach).not.toHaveBeenCalled()
  })
})
