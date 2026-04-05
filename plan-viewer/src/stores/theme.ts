import { defineStore } from 'pinia'

import { ThemeMode, ThemePreference, type ThemeConfig, type ThemeMode as ThemeModeType, type ThemePreference as ThemePreferenceType } from '../types'

const DEFAULT_THEME_CONFIG: ThemeConfig = {
  storageKey: 'impl-viewer-theme',
  defaultMode: ThemeMode.SYSTEM,
  fallbackPreference: ThemePreference.LIGHT,
}

const MODE_SEQUENCE: ThemeModeType[] = [ThemeMode.SYSTEM, ThemeMode.LIGHT, ThemeMode.DARK]

const getMatchMedia = (): MediaQueryList | null => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return null
  }

  return window.matchMedia('(prefers-color-scheme: dark)')
}

const getLocalStorage = (): Storage | null => {
  if (typeof window === 'undefined' || !('localStorage' in window)) {
    return null
  }

  return window.localStorage
}

const isThemeMode = (value: unknown): value is ThemeModeType =>
  value === ThemeMode.SYSTEM || value === ThemeMode.LIGHT || value === ThemeMode.DARK

export const useThemeStore = defineStore('theme', {
  state: () => ({
    mode: DEFAULT_THEME_CONFIG.defaultMode,
    systemPreference: DEFAULT_THEME_CONFIG.fallbackPreference,
  }),

  getters: {
    effectiveTheme: (state): ThemePreferenceType =>
      state.mode === ThemeMode.SYSTEM ? state.systemPreference : state.mode,

    isDark(): boolean {
      return this.effectiveTheme === ThemePreference.DARK
    },
  },

  actions: {
    setMode(mode: ThemeModeType): void {
      if (!isThemeMode(mode)) {
        return
      }

      this.mode = mode
      this.saveToStorage()
    },

    toggleMode(): void {
      const currentIndex = MODE_SEQUENCE.indexOf(this.mode)
      const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % MODE_SEQUENCE.length
      this.mode = MODE_SEQUENCE[nextIndex]
      this.saveToStorage()
    },

    detectSystemPreference(): ThemePreferenceType {
      const mediaQuery = getMatchMedia()
      this.systemPreference = mediaQuery?.matches ? ThemePreference.DARK : ThemePreference.LIGHT
      return this.systemPreference
    },

    loadFromStorage(): void {
      const storage = getLocalStorage()
      if (!storage) {
        return
      }

      try {
        const persisted = storage.getItem(DEFAULT_THEME_CONFIG.storageKey)
        if (isThemeMode(persisted)) {
          this.mode = persisted
        }
      } catch {
        // Ignore storage access failures and keep in-memory mode.
      }
    },

    saveToStorage(): void {
      const storage = getLocalStorage()
      if (!storage) {
        return
      }

      try {
        storage.setItem(DEFAULT_THEME_CONFIG.storageKey, this.mode)
      } catch {
        // Ignore storage access failures and keep in-memory mode.
      }
    },
  },
})
