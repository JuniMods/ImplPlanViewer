import { describe, expect, it } from 'vitest'

import { createMarkdownRenderer } from '../../../src/utils/parsers/markdownConfig'

describe('createMarkdownRenderer', () => {
  it('configures markdown-it task lists and custom renderers', async () => {
    const renderer = await createMarkdownRenderer()

    const html = renderer.render([
      '- [x] Done item',
      '',
      '[Documentation](https://example.com)',
      '',
      '![Screenshot](https://example.com/image.png)',
      '',
      'Use `inline` code.',
    ].join('\n'))

    expect(html).toContain('task-list-item-checkbox')
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noopener noreferrer"')
    expect(html).toContain('loading="lazy"')
    expect(html).toContain('decoding="async"')
    expect(html).toContain('<code class="inline-code">inline</code>')

    renderer.dispose()
  })

  it('renders fenced code blocks with syntax highlighting', async () => {
    const renderer = await createMarkdownRenderer()

    const html = renderer.render(['```ts', 'const value = 42', '```'].join('\n'))

    expect(html).toContain('class="shiki')
    expect(html).toContain('const')
    expect(html).toContain('value')

    renderer.dispose()
  })

  it('falls back to plain text for unknown languages and validates input', async () => {
    const renderer = await createMarkdownRenderer()

    const html = renderer.render([
      '```unknown-lang',
      "<script>alert('xss')</script>",
      '```',
    ].join('\n'))

    expect(html).toContain('class="shiki')
    expect(html).not.toContain("<script>alert('xss')</script>")

    expect(() => renderer.render('ok')).not.toThrow()
    expect(() => renderer.render(42 as unknown as string)).toThrow('Markdown content must be a string')

    renderer.dispose()
  })
})
