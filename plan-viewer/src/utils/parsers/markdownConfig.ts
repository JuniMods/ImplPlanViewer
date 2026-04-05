import MarkdownIt from 'markdown-it'
import markdownItTaskLists from 'markdown-it-task-lists'
import { createHighlighter, type BuiltinTheme } from 'shiki'

export const DEFAULT_MARKDOWN_THEME: BuiltinTheme = 'github-dark-default'

const DEFAULT_FALLBACK_LANGUAGE = 'text'
const DEFAULT_LANGUAGES = ['ts', 'js', 'json', 'bash', 'md', 'yaml']

export interface MarkdownRendererOptions {
  theme?: BuiltinTheme
  languages?: string[]
  linkTarget?: string
  linkRel?: string
}

export interface MarkdownRenderer {
  markdown: MarkdownIt
  render: (content: string) => string
  renderInline: (content: string) => string
  dispose: () => void
}

const normalizeLanguage = (language: string, loadedLanguages: Set<string>): string => {
  const normalized = language.trim().toLowerCase()

  if (normalized.length === 0) {
    return DEFAULT_FALLBACK_LANGUAGE
  }

  return loadedLanguages.has(normalized) ? normalized : DEFAULT_FALLBACK_LANGUAGE
}

const assertMarkdownInput = (content: unknown): string => {
  if (typeof content !== 'string') {
    throw new TypeError('Markdown content must be a string')
  }

  return content
}

export const createMarkdownRenderer = async (
  options: MarkdownRendererOptions = {},
): Promise<MarkdownRenderer> => {
  const theme = options.theme ?? DEFAULT_MARKDOWN_THEME
  const linkTarget = options.linkTarget ?? '_blank'
  const linkRel = options.linkRel ?? 'noopener noreferrer'
  const languages = [...new Set([...DEFAULT_LANGUAGES, ...(options.languages ?? [])])]

  const highlighter = await createHighlighter({
    themes: [theme],
    langs: languages,
  })

  const loadedLanguages = new Set(highlighter.getLoadedLanguages().map((entry) => entry.toLowerCase()))

  const markdown = new MarkdownIt({
    html: false,
    linkify: true,
    highlight: (code, language) =>
      highlighter.codeToHtml(code, {
        lang: normalizeLanguage(language, loadedLanguages),
        theme,
      }),
  })

  markdown.use(markdownItTaskLists, {
    enabled: false,
    label: true,
    labelAfter: true,
  })

  const defaultLinkOpen = markdown.renderer.rules.link_open
  markdown.renderer.rules.link_open = (tokens, idx, opts, env, self) => {
    tokens[idx].attrSet('target', linkTarget)
    tokens[idx].attrSet('rel', linkRel)

    if (defaultLinkOpen) {
      return defaultLinkOpen(tokens, idx, opts, env, self)
    }

    return self.renderToken(tokens, idx, opts)
  }

  const defaultImage = markdown.renderer.rules.image
  markdown.renderer.rules.image = (tokens, idx, opts, env, self) => {
    tokens[idx].attrSet('loading', 'lazy')
    tokens[idx].attrSet('decoding', 'async')

    if (defaultImage) {
      return defaultImage(tokens, idx, opts, env, self)
    }

    return self.renderToken(tokens, idx, opts)
  }

  const defaultCodeInline = markdown.renderer.rules.code_inline
  markdown.renderer.rules.code_inline = (tokens, idx, opts, env, self) => {
    const escaped = markdown.utils.escapeHtml(tokens[idx].content)

    if (!defaultCodeInline) {
      return `<code class="inline-code">${escaped}</code>`
    }

    const rendered = defaultCodeInline(tokens, idx, opts, env, self)

    return rendered.includes('<code')
      ? rendered.replace('<code', '<code class="inline-code"')
      : rendered
  }

  return {
    markdown,
    render: (content: string) => markdown.render(assertMarkdownInput(content)),
    renderInline: (content: string) => markdown.renderInline(assertMarkdownInput(content)),
    dispose: () => highlighter.dispose(),
  }
}
