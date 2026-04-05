import { describe, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'

import type { MarkdownRenderer } from '../../../src/utils/parsers'
import { useMarkdown } from '../../../src/composables/useMarkdown'

const createRendererMock = () => {
  const render = vi.fn((content: string) => `<p>${content}</p>`)
  const renderInline = vi.fn((content: string) => `<span>${content}</span>`)
  const dispose = vi.fn()

  const renderer: MarkdownRenderer = {
    markdown: {} as MarkdownRenderer['markdown'],
    render,
    renderInline,
    dispose,
  }

  const createRenderer = vi.fn(async () => renderer)

  return {
    createRenderer,
    render,
    renderInline,
    dispose,
  }
}

describe('useMarkdown composable', () => {
  it('renders markdown and caches output by mode', async () => {
    const mocks = createRendererMock()
    const scope = effectScope()
    const markdown = scope.run(() =>
      useMarkdown({
        createRenderer: mocks.createRenderer,
      }),
    )

    expect(markdown?.isReady.value).toBe(false)

    const firstRender = await markdown!.render('hello')
    const secondRender = await markdown!.render('hello')
    const inlineRender = await markdown!.renderInline('hello')

    expect(firstRender).toBe('<p>hello</p>')
    expect(secondRender).toBe('<p>hello</p>')
    expect(inlineRender).toBe('<span>hello</span>')
    expect(mocks.createRenderer).toHaveBeenCalledTimes(1)
    expect(mocks.render).toHaveBeenCalledTimes(1)
    expect(mocks.renderInline).toHaveBeenCalledTimes(1)
    expect(markdown?.isReady.value).toBe(true)

    scope.stop()
    expect(mocks.dispose).toHaveBeenCalledTimes(1)
  })

  it('supports cache invalidation and max cache size limits', async () => {
    const mocks = createRendererMock()
    const scope = effectScope()
    const markdown = scope.run(() =>
      useMarkdown({
        createRenderer: mocks.createRenderer,
        maxCacheEntries: 1,
      }),
    )

    await markdown!.render('first')
    await markdown!.render('second')
    await markdown!.render('first')
    expect(mocks.render).toHaveBeenCalledTimes(3)

    markdown!.clearCache()
    await markdown!.render('first')
    expect(mocks.render).toHaveBeenCalledTimes(4)

    scope.stop()
  })

  it('surfaces renderer creation and render failures', async () => {
    const initializationError = new Error('renderer failed')
    const createRenderer = vi.fn().mockRejectedValue(initializationError)
    const scope = effectScope()
    const markdown = scope.run(() =>
      useMarkdown({
        createRenderer,
      }),
    )

    await expect(markdown!.render('value')).rejects.toThrow('renderer failed')
    expect(markdown?.error.value).toBe(initializationError)
    expect(markdown?.isReady.value).toBe(false)

    scope.stop()

    const renderingError = new Error('invalid markdown input')
    const render = vi.fn(() => {
      throw renderingError
    })
    const dispose = vi.fn()
    const createRendererWithThrow = vi.fn(async () => ({
      markdown: {} as MarkdownRenderer['markdown'],
      render,
      renderInline: vi.fn(() => ''),
      dispose,
    }))

    const secondScope = effectScope()
    const secondMarkdown = secondScope.run(() =>
      useMarkdown({
        createRenderer: createRendererWithThrow,
      }),
    )

    await expect(secondMarkdown!.render('boom')).rejects.toThrow('invalid markdown input')
    expect(secondMarkdown?.error.value).toBe(renderingError)

    secondScope.stop()
    expect(dispose).toHaveBeenCalledTimes(1)
  })
})
