import { storeToRefs } from 'pinia'
import { computed, getCurrentScope, onScopeDispose, watch } from 'vue'

import { useThemeStore } from '../stores'
import { ThemeMode, ThemePreference, type ThemePreference as ThemePreferenceType } from '../types'

const SYSTEM_THEME_QUERY = '(prefers-color-scheme: dark)'

type ThemeChangeHandler = (event: { matches: boolean }) => void

type MediaQueryListLike = {
  matches: boolean
  addEventListener?: (type: 'change', listener: ThemeChangeHandler) => void
  removeEventListener?: (type: 'change', listener: ThemeChangeHandler) => void
}

export interface UseThemeOptions {
  applyTheme?: (theme: ThemePreferenceType) => void
  syncDocument?: boolean
}

const getMatchMedia = (): MediaQueryListLike | null => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return null
  }

  return window.matchMedia(SYSTEM_THEME_QUERY)
}

const applyThemeToDocument = (theme: ThemePreferenceType): void => {
  if (typeof document === 'undefined') {
    return
  }

  document.documentElement.setAttribute('data-theme', theme)
  document.documentElement.classList.toggle('dark', theme === ThemePreference.DARK)
}

export const useTheme = (options: UseThemeOptions = {}) => {
  const themeStore = useThemeStore()
  const { mode, systemPreference, effectiveTheme } = storeToRefs(themeStore)

  const applyTheme = (theme: ThemePreferenceType): void => {
    if (options.syncDocument !== false) {
      applyThemeToDocument(theme)
    }

    options.applyTheme?.(theme)
  }

  const syncSystemPreference = (event: { matches: boolean }): void => {
    if (themeStore.mode !== ThemeMode.SYSTEM) {
      return
    }

    themeStore.systemPreference = event.matches ? ThemePreference.DARK : ThemePreference.LIGHT
  }

  themeStore.loadFromStorage()
  themeStore.detectSystemPreference()

  const mediaQuery = getMatchMedia()

  if (mediaQuery?.addEventListener) {
    mediaQuery.addEventListener('change', syncSystemPreference)
  }

  applyTheme(effectiveTheme.value)

  const stopWatchingTheme = watch(effectiveTheme, (theme) => {
    applyTheme(theme)
  })

  const cleanup = (): void => {
    stopWatchingTheme()

    if (mediaQuery?.removeEventListener) {
      mediaQuery.removeEventListener('change', syncSystemPreference)
    }
  }

  if (getCurrentScope()) {
    onScopeDispose(cleanup)
  }

  return {
    mode,
    systemPreference,
    effectiveTheme,
    isDark: computed(() => themeStore.isDark),
    setMode: themeStore.setMode,
    toggleMode: themeStore.toggleMode,
    detectSystemPreference: themeStore.detectSystemPreference,
    applyTheme,
    cleanup,
  }
}
