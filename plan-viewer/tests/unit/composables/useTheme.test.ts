import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { effectScope, nextTick } from 'vue'

import { useTheme } from '../../../src/composables/useTheme'
import { ThemeMode, ThemePreference } from '../../../src/types'

const STORAGE_KEY = 'impl-viewer-theme'

type ThemeChangeHandler = (event: { matches: boolean }) => void

type MediaQueryListLike = {
  matches: boolean
  addEventListener: (type: 'change', listener: ThemeChangeHandler) => void
  removeEventListener: (type: 'change', listener: ThemeChangeHandler) => void
}

type WindowLike = {
  matchMedia?: (query: string) => MediaQueryListLike
  localStorage?: Storage
}

type DocumentLike = {
  documentElement: {
    setAttribute: (name: string, value: string) => void
    classList: {
      toggle: (token: string, force?: boolean) => boolean
    }
  }
}

const globalScope = globalThis as typeof globalThis & {
  window?: WindowLike
  document?: DocumentLike
}

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

const createMatchMediaMock = (initial = false) => {
  const listeners = new Set<ThemeChangeHandler>()

  const mediaQueryList: MediaQueryListLike = {
    matches: initial,
    addEventListener: (_type, listener) => {
      listeners.add(listener)
    },
    removeEventListener: (_type, listener) => {
      listeners.delete(listener)
    },
  }

  return {
    mediaQueryList,
    emit: (matches: boolean) => {
      mediaQueryList.matches = matches
      for (const listener of listeners) {
        listener({ matches })
      }
    },
    listenerCount: () => listeners.size,
  }
}

const createDocumentMock = () => {
  const attributes = new Map<string, string>()
  const classes = new Set<string>()

  return {
    document: {
      documentElement: {
        setAttribute: (name: string, value: string) => {
          attributes.set(name, value)
        },
        classList: {
          toggle: (token: string, force?: boolean) => {
            const shouldAdd = force ?? !classes.has(token)
            if (shouldAdd) {
              classes.add(token)
              return true
            }

            classes.delete(token)
            return false
          },
        },
      },
    } satisfies DocumentLike,
    getAttribute: (name: string) => attributes.get(name) ?? null,
    hasClass: (name: string) => classes.has(name),
  }
}

describe('useTheme composable', () => {
  const originalWindow = globalScope.window
  const originalDocument = globalScope.document

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    if (originalWindow === undefined) {
      delete globalScope.window
    } else {
      globalScope.window = originalWindow
    }

    if (originalDocument === undefined) {
      delete globalScope.document
    } else {
      globalScope.document = originalDocument
    }
  })

  it('loads stored mode, resolves theme, and applies it to document', () => {
    const mediaQuery = createMatchMediaMock(false)
    const documentMock = createDocumentMock()

    globalScope.window = {
      matchMedia: () => mediaQuery.mediaQueryList,
      localStorage: createStorageMock({ [STORAGE_KEY]: ThemeMode.DARK }),
    }
    globalScope.document = documentMock.document

    const scope = effectScope()
    const theme = scope.run(() => useTheme())

    expect(theme?.mode.value).toBe(ThemeMode.DARK)
    expect(theme?.effectiveTheme.value).toBe(ThemePreference.DARK)
    expect(documentMock.getAttribute('data-theme')).toBe(ThemePreference.DARK)
    expect(documentMock.hasClass('dark')).toBe(true)

    scope.stop()
  })

  it('reacts to mode changes and persists selection through the store', async () => {
    const mediaQuery = createMatchMediaMock(false)
    const documentMock = createDocumentMock()

    globalScope.window = {
      matchMedia: () => mediaQuery.mediaQueryList,
      localStorage: createStorageMock(),
    }
    globalScope.document = documentMock.document

    const scope = effectScope()
    const theme = scope.run(() => useTheme())

    theme?.setMode(ThemeMode.LIGHT)
    await nextTick()
    expect(globalScope.window.localStorage?.getItem(STORAGE_KEY)).toBe(ThemeMode.LIGHT)
    expect(documentMock.getAttribute('data-theme')).toBe(ThemePreference.LIGHT)
    expect(documentMock.hasClass('dark')).toBe(false)

    theme?.toggleMode()
    await nextTick()
    expect(theme?.mode.value).toBe(ThemeMode.DARK)
    expect(documentMock.getAttribute('data-theme')).toBe(ThemePreference.DARK)
    expect(documentMock.hasClass('dark')).toBe(true)

    scope.stop()
  })

  it('invokes custom applyTheme hook for initial and updated effective theme', async () => {
    const mediaQuery = createMatchMediaMock(false)
    const applyTheme = vi.fn()

    globalScope.window = {
      matchMedia: () => mediaQuery.mediaQueryList,
      localStorage: createStorageMock(),
    }

    const scope = effectScope()
    const theme = scope.run(() => useTheme({ syncDocument: false, applyTheme }))

    expect(applyTheme).toHaveBeenNthCalledWith(1, ThemePreference.LIGHT)

    theme?.setMode(ThemeMode.DARK)
    await nextTick()
    expect(applyTheme).toHaveBeenNthCalledWith(2, ThemePreference.DARK)

    scope.stop()
  })

  it('listens for system changes only while in system mode', async () => {
    const mediaQuery = createMatchMediaMock(false)
    const documentMock = createDocumentMock()

    globalScope.window = {
      matchMedia: () => mediaQuery.mediaQueryList,
      localStorage: createStorageMock(),
    }
    globalScope.document = documentMock.document

    const scope = effectScope()
    const theme = scope.run(() => useTheme())

    mediaQuery.emit(true)
    await nextTick()
    expect(theme?.systemPreference.value).toBe(ThemePreference.DARK)
    expect(documentMock.getAttribute('data-theme')).toBe(ThemePreference.DARK)

    theme?.setMode(ThemeMode.LIGHT)
    mediaQuery.emit(false)
    await nextTick()
    expect(theme?.systemPreference.value).toBe(ThemePreference.DARK)
    expect(documentMock.getAttribute('data-theme')).toBe(ThemePreference.LIGHT)

    scope.stop()
  })

  it('removes system listener on cleanup', () => {
    const mediaQuery = createMatchMediaMock(false)

    globalScope.window = {
      matchMedia: () => mediaQuery.mediaQueryList,
      localStorage: createStorageMock(),
    }

    const scope = effectScope()
    const theme = scope.run(() => useTheme({ syncDocument: false }))

    expect(mediaQuery.listenerCount()).toBe(1)

    theme?.cleanup()
    expect(mediaQuery.listenerCount()).toBe(0)

    scope.stop()
  })
})
