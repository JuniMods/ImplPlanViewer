import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const globalCssPath = resolve(process.cwd(), 'src/assets/styles/global.css')

describe('global base styles', () => {
  it('defines reset and element-level defaults', () => {
    const css = readFileSync(globalCssPath, 'utf-8')

    expect(css).toContain('*::before')
    expect(css).toContain('box-sizing: border-box')
    expect(css).toContain('body')
    expect(css).toContain('margin: 0')
    expect(css).toContain('h1,')
    expect(css).toContain('button,')
    expect(css).toContain(':focus-visible')
    expect(css).toContain('.sr-only')
    expect(css).toContain('prefers-reduced-motion: reduce')
  })

  it('uses variables from STYLE-001 tokens for typography and surfaces', () => {
    const css = readFileSync(globalCssPath, 'utf-8')

    expect(css).toContain('var(--font-family-base)')
    expect(css).toContain('var(--font-family-mono)')
    expect(css).toContain('var(--border-radius-sm)')
    expect(css).toContain('--bg')
    expect(css).toContain('--border')
    expect(css).toContain('--text-h')
  })
})
