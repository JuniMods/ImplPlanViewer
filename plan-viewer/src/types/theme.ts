export const ThemeMode = {
  SYSTEM: 'system',
  LIGHT: 'light',
  DARK: 'dark',
} as const

export type ThemeMode = (typeof ThemeMode)[keyof typeof ThemeMode]

export const ThemePreference = {
  LIGHT: 'light',
  DARK: 'dark',
} as const

export type ThemePreference = (typeof ThemePreference)[keyof typeof ThemePreference]

export interface ThemeState {
  mode: ThemeMode
  systemPreference: ThemePreference
}

export interface ThemeConfig {
  storageKey: string
  defaultMode: ThemeMode
  fallbackPreference: ThemePreference
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const hasString = (value: Record<string, unknown>, key: string): boolean =>
  typeof value[key] === 'string'

const themeModeValues = Object.values(ThemeMode) as string[]
const themePreferenceValues = Object.values(ThemePreference) as string[]

export const isThemeMode = (value: unknown): value is ThemeMode =>
  typeof value === 'string' && themeModeValues.includes(value)

export const isThemePreference = (value: unknown): value is ThemePreference =>
  typeof value === 'string' && themePreferenceValues.includes(value)

export const isThemeState = (value: unknown): value is ThemeState => {
  if (!isObject(value)) {
    return false
  }

  return isThemeMode(value.mode) && isThemePreference(value.systemPreference)
}

export const isThemeConfig = (value: unknown): value is ThemeConfig => {
  if (!isObject(value)) {
    return false
  }

  return (
    hasString(value, 'storageKey') &&
    (value.storageKey as string).trim().length > 0 &&
    isThemeMode(value.defaultMode) &&
    isThemePreference(value.fallbackPreference)
  )
}

export const assertThemeState = (value: unknown): asserts value is ThemeState => {
  if (!isThemeState(value)) {
    throw new TypeError('Invalid theme state payload')
  }
}

export const assertThemeConfig = (value: unknown): asserts value is ThemeConfig => {
  if (!isThemeConfig(value)) {
    throw new TypeError('Invalid theme config payload')
  }
}
