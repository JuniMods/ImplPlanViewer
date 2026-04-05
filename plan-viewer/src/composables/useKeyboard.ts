import { getCurrentScope, onScopeDispose, toValue, type MaybeRefOrGetter } from 'vue'

type KeyboardListener = (event: KeyboardEvent) => void

type KeyboardEventTarget = {
  addEventListener: (type: 'keydown', listener: KeyboardListener) => void
  removeEventListener: (type: 'keydown', listener: KeyboardListener) => void
}

type KeyboardTargetLike = EventTarget | null

const INPUT_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT'])

const hasModifierKey = (event: KeyboardEvent): boolean =>
  event.altKey || event.ctrlKey || event.metaKey

const isEditableTarget = (target: KeyboardTargetLike): boolean => {
  if (target === null || typeof target !== 'object') {
    return false
  }

  const element = target as {
    isContentEditable?: boolean
    tagName?: string
  }

  if (element.isContentEditable) {
    return true
  }

  const tagName = element.tagName?.toUpperCase()
  return tagName !== undefined && INPUT_TAGS.has(tagName)
}

export interface UseKeyboardOptions {
  enabled?: MaybeRefOrGetter<boolean>
  keyboardTarget?: KeyboardEventTarget | null
  onFocusSearch?: () => void
  onPreviousPlan?: () => void
  onNextPlan?: () => void
  onBackToIndex?: () => void
}

export interface UseKeyboardResult {
  handleKeydown: KeyboardListener
  cleanup: () => void
}

const getDefaultKeyboardTarget = (): KeyboardEventTarget | null => {
  if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') {
    return null
  }

  return window
}

export const useKeyboard = (options: UseKeyboardOptions = {}): UseKeyboardResult => {
  const keyboardTarget = options.keyboardTarget ?? getDefaultKeyboardTarget()
  const isEnabled = (): boolean => toValue(options.enabled ?? true)

  const handleKeydown: KeyboardListener = (event) => {
    if (!isEnabled() || event.defaultPrevented || hasModifierKey(event)) {
      return
    }

    const editableTarget = isEditableTarget(event.target)

    if (event.key === '/') {
      if (editableTarget) {
        return
      }

      event.preventDefault()
      options.onFocusSearch?.()
      return
    }

    if (editableTarget) {
      return
    }

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault()
        options.onPreviousPlan?.()
        break
      case 'ArrowRight':
        event.preventDefault()
        options.onNextPlan?.()
        break
      case 'Escape':
        event.preventDefault()
        options.onBackToIndex?.()
        break
      default:
        break
    }
  }

  if (keyboardTarget) {
    keyboardTarget.addEventListener('keydown', handleKeydown)
  }

  const cleanup = (): void => {
    if (keyboardTarget) {
      keyboardTarget.removeEventListener('keydown', handleKeydown)
    }
  }

  if (getCurrentScope()) {
    onScopeDispose(cleanup)
  }

  return {
    handleKeydown,
    cleanup,
  }
}
