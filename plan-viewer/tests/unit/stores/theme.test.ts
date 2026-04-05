import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { ThemeMode, ThemePreference } from '../../../src/types'
import { useThemeStore } from '../../../src/stores/theme'

const STORAGE_KEY = 'impl-viewer-theme'

type WindowLike = {
  matchMedia?: (query: string) => { matches: boolean }
  localStorage?: Storage
}

const globalScope = globalThis as typeof globalThis & { window?: WindowLike }

const createStorageMock = (seed?: Record<string, string>): Storage => {
  const store = new Map(Object.entries(seed ?? {}))

  return {
    length: store.size,
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    removeItem: (key: string) => {
      store.delete(key)
    },
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
  } as Storage
}

describe('theme store', () => {
  const originalWindow = globalScope.window

  beforeEach(() => {
    setActivePinia(createPinia())
    globalScope.window = {
      matchMedia: () => ({ matches: false }),
      localStorage: createStorageMock(),
    }
  })

  afterEach(() => {
    if (originalWindow === undefined) {
      delete globalScope.window
      return
    }

    globalScope.window = originalWindow
  })

  it('starts with system mode and resolves effective theme', () => {
    const store = useThemeStore()

    expect(store.mode).toBe(ThemeMode.SYSTEM)
    expect(store.systemPreference).toBe(ThemePreference.LIGHT)
    expect(store.effectiveTheme).toBe(ThemePreference.LIGHT)
    expect(store.isDark).toBe(false)
  })

  it('detects system preference using matchMedia and updates dark flag', () => {
    const store = useThemeStore()

    globalScope.window = {
      ...globalScope.window,
      matchMedia: () => ({ matches: true }),
    }

    expect(store.detectSystemPreference()).toBe(ThemePreference.DARK)
    expect(store.systemPreference).toBe(ThemePreference.DARK)
    expect(store.effectiveTheme).toBe(ThemePreference.DARK)
    expect(store.isDark).toBe(true)
  })

  it('cycles mode and persists selection', () => {
    const store = useThemeStore()

    store.setMode(ThemeMode.LIGHT)
    expect(globalScope.window?.localStorage?.getItem(STORAGE_KEY)).toBe(ThemeMode.LIGHT)

    store.toggleMode()
    expect(store.mode).toBe(ThemeMode.DARK)

    store.toggleMode()
    expect(store.mode).toBe(ThemeMode.SYSTEM)
    expect(globalScope.window?.localStorage?.getItem(STORAGE_KEY)).toBe(ThemeMode.SYSTEM)
  })

  it('loads persisted mode when valid and ignores invalid values', () => {
    const store = useThemeStore()

    globalScope.window = {
      ...globalScope.window,
      localStorage: createStorageMock({ [STORAGE_KEY]: ThemeMode.DARK }),
    }
    store.loadFromStorage()
    expect(store.mode).toBe(ThemeMode.DARK)

    globalScope.window = {
      ...globalScope.window,
      localStorage: createStorageMock({ [STORAGE_KEY]: 'invalid' }),
    }
    store.setMode(ThemeMode.LIGHT)
    store.loadFromStorage()
    expect(store.mode).toBe(ThemeMode.LIGHT)
  })

  it('falls back safely when browser APIs are unavailable', () => {
    const store = useThemeStore()

    delete globalScope.window

    expect(store.detectSystemPreference()).toBe(ThemePreference.LIGHT)
    expect(() => store.loadFromStorage()).not.toThrow()
    expect(() => store.saveToStorage()).not.toThrow()
  })

  it('ignores invalid mode values passed to setMode', () => {
    const store = useThemeStore()

    store.setMode('invalid-mode' as ThemeMode)

    expect(store.mode).toBe(ThemeMode.SYSTEM)
    expect(globalScope.window?.localStorage?.getItem(STORAGE_KEY)).toBeNull()
  })
})
