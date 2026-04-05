import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const variablesCssPath = resolve(process.cwd(), 'src/assets/styles/variables.css')

describe('global CSS variables', () => {
  it('defines typography, spacing, shadow, and transition variables', () => {
    const css = readFileSync(variablesCssPath, 'utf-8')

    expect(css).toContain('--font-family-base')
    expect(css).toContain('--font-family-mono')

    expect(css).toContain('--spacing-xs')
    expect(css).toContain('--spacing-sm')
    expect(css).toContain('--spacing-md')
    expect(css).toContain('--spacing-lg')
    expect(css).toContain('--spacing-xl')

    expect(css).toContain('--transition-fast')
    expect(css).toContain('--transition-normal')
    expect(css).toContain('--transition-slow')

    expect(css).toContain('--shadow-sm')
    expect(css).toContain('--shadow-md')
    expect(css).toContain('--shadow-lg')
  })
})
