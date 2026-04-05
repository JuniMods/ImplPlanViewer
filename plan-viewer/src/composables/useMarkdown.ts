import { computed, getCurrentScope, onScopeDispose, ref, type Ref } from 'vue'

import {
  createMarkdownRenderer,
  type MarkdownRenderer,
  type MarkdownRendererOptions,
} from '../utils/parsers'

const DEFAULT_MAX_CACHE_ENTRIES = 200

type MarkdownRenderMode = 'render' | 'renderInline'

export interface UseMarkdownOptions {
  rendererOptions?: MarkdownRendererOptions
  createRenderer?: (options?: MarkdownRendererOptions) => Promise<MarkdownRenderer>
  maxCacheEntries?: number
}

export interface UseMarkdownResult {
  isLoading: Readonly<Ref<boolean>>
  isReady: Readonly<Ref<boolean>>
  error: Readonly<Ref<Error | null>>
  render: (content: string) => Promise<string>
  renderInline: (content: string) => Promise<string>
  clearCache: () => void
  cleanup: () => void
}

const toError = (error: unknown): Error =>
  error instanceof Error ? error : new Error('Failed to render markdown')

const createCacheKey = (mode: MarkdownRenderMode, content: string): string =>
  `${mode}::${content}`

export const useMarkdown = (options: UseMarkdownOptions = {}): UseMarkdownResult => {
  const createRenderer = options.createRenderer ?? createMarkdownRenderer
  const rendererOptions = options.rendererOptions
  const maxCacheEntries = Math.max(1, options.maxCacheEntries ?? DEFAULT_MAX_CACHE_ENTRIES)

  const isLoading = ref(false)
  const isReady = ref(false)
  const error = ref<Error | null>(null)
  const cache = new Map<string, string>()

  let renderer: MarkdownRenderer | null = null
  let rendererPromise: Promise<MarkdownRenderer> | null = null

  const setCache = (key: string, value: string): void => {
    if (cache.has(key)) {
      cache.delete(key)
    }

    cache.set(key, value)

    while (cache.size > maxCacheEntries) {
      const oldestKey = cache.keys().next().value
      if (oldestKey === undefined) {
        break
      }

      cache.delete(oldestKey)
    }
  }

  const ensureRenderer = async (): Promise<MarkdownRenderer> => {
    if (renderer) {
      return renderer
    }

    if (!rendererPromise) {
      error.value = null
      isLoading.value = true

      rendererPromise = createRenderer(rendererOptions)
        .then((createdRenderer) => {
          renderer = createdRenderer
          isReady.value = true
          return createdRenderer
        })
        .catch((renderError: unknown) => {
          const normalizedError = toError(renderError)
          error.value = normalizedError
          throw normalizedError
        })
        .finally(() => {
          isLoading.value = false
          rendererPromise = null
        })
    }

    return rendererPromise
  }

  const renderWithMode = async (mode: MarkdownRenderMode, content: string): Promise<string> => {
    const cacheKey = createCacheKey(mode, content)
    const cached = cache.get(cacheKey)

    if (cached !== undefined) {
      return cached
    }

    const markdownRenderer = await ensureRenderer()

    try {
      const rendered = markdownRenderer[mode](content)
      setCache(cacheKey, rendered)
      return rendered
    } catch (renderError: unknown) {
      const normalizedError = toError(renderError)
      error.value = normalizedError
      throw normalizedError
    }
  }

  const clearCache = (): void => {
    cache.clear()
  }

  const cleanup = (): void => {
    clearCache()
    renderer?.dispose()
    renderer = null
    rendererPromise = null
    isReady.value = false
    isLoading.value = false
  }

  if (getCurrentScope()) {
    onScopeDispose(cleanup)
  }

  return {
    isLoading: computed(() => isLoading.value),
    isReady: computed(() => isReady.value),
    error: computed(() => error.value),
    render: (content: string) => renderWithMode('render', content),
    renderInline: (content: string) => renderWithMode('renderInline', content),
    clearCache,
    cleanup,
  }
}
