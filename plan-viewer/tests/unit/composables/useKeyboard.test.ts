import { beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, ref } from 'vue'

import { useKeyboard } from '../../../src/composables/useKeyboard'

type KeyboardHandler = (event: KeyboardEvent) => void

type KeyboardTargetMock = {
  addEventListener: (type: 'keydown', listener: KeyboardHandler) => void
  removeEventListener: (type: 'keydown', listener: KeyboardHandler) => void
  dispatch: (event: Partial<KeyboardEvent> & { key: string; target?: EventTarget | null }) => void
}

const createKeyboardTargetMock = (): KeyboardTargetMock => {
  const listeners = new Set<KeyboardHandler>()

  return {
    addEventListener: (_type, listener) => {
      listeners.add(listener)
    },
    removeEventListener: (_type, listener) => {
      listeners.delete(listener)
    },
    dispatch: (event) => {
      const keyboardEvent = {
        key: event.key,
        altKey: event.altKey ?? false,
        ctrlKey: event.ctrlKey ?? false,
        metaKey: event.metaKey ?? false,
        defaultPrevented: false,
        target: event.target ?? null,
        preventDefault: vi.fn(function thisDefaultPrevented() {
          keyboardEvent.defaultPrevented = true
        }),
      } as unknown as KeyboardEvent

      listeners.forEach((listener) => listener(keyboardEvent))
    },
  }
}

describe('useKeyboard composable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('triggers configured shortcuts for slash, arrows, and escape', () => {
    const keyboardTarget = createKeyboardTargetMock()
    const onFocusSearch = vi.fn()
    const onPreviousPlan = vi.fn()
    const onNextPlan = vi.fn()
    const onBackToIndex = vi.fn()

    const scope = effectScope()
    scope.run(() =>
      useKeyboard({
        keyboardTarget,
        onFocusSearch,
        onPreviousPlan,
        onNextPlan,
        onBackToIndex,
      }),
    )

    keyboardTarget.dispatch({ key: '/' })
    keyboardTarget.dispatch({ key: 'ArrowLeft' })
    keyboardTarget.dispatch({ key: 'ArrowRight' })
    keyboardTarget.dispatch({ key: 'Escape' })

    expect(onFocusSearch).toHaveBeenCalledTimes(1)
    expect(onPreviousPlan).toHaveBeenCalledTimes(1)
    expect(onNextPlan).toHaveBeenCalledTimes(1)
    expect(onBackToIndex).toHaveBeenCalledTimes(1)

    scope.stop()
  })

  it('ignores shortcuts for editable targets, modifier keys, and disabled state', () => {
    const keyboardTarget = createKeyboardTargetMock()
    const onFocusSearch = vi.fn()
    const onPreviousPlan = vi.fn()
    const enabled = ref(true)

    const scope = effectScope()
    scope.run(() =>
      useKeyboard({
        enabled,
        keyboardTarget,
        onFocusSearch,
        onPreviousPlan,
      }),
    )

    keyboardTarget.dispatch({ key: '/', target: { tagName: 'INPUT' } as EventTarget })
    keyboardTarget.dispatch({ key: 'ArrowLeft', ctrlKey: true })

    enabled.value = false
    keyboardTarget.dispatch({ key: 'ArrowLeft' })

    expect(onFocusSearch).not.toHaveBeenCalled()
    expect(onPreviousPlan).not.toHaveBeenCalled()

    scope.stop()
  })

  it('removes listeners on cleanup', () => {
    const keyboardTarget = createKeyboardTargetMock()
    const onNextPlan = vi.fn()

    const scope = effectScope()
    const keyboard = scope.run(() =>
      useKeyboard({
        keyboardTarget,
        onNextPlan,
      }),
    )

    keyboardTarget.dispatch({ key: 'ArrowRight' })
    expect(onNextPlan).toHaveBeenCalledTimes(1)

    keyboard?.cleanup()
    keyboardTarget.dispatch({ key: 'ArrowRight' })
    expect(onNextPlan).toHaveBeenCalledTimes(1)

    scope.stop()
  })
})
