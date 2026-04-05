import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const responsiveCssPath = resolve(process.cwd(), 'src/assets/styles/responsive.css')

describe('responsive utility styles', () => {
  it('defines display and grid utility classes', () => {
    const css = readFileSync(responsiveCssPath, 'utf-8')

    expect(css).toContain('.u-hidden')
    expect(css).toContain('.u-block')
    expect(css).toContain('.u-flex')
    expect(css).toContain('.u-grid')
    expect(css).toContain('.u-cols-1')
    expect(css).toContain('.u-cols-2-md')
    expect(css).toContain('.u-cols-3-lg')
    expect(css).toContain('var(--spacing-sm)')
    expect(css).toContain('var(--spacing-md)')
    expect(css).toContain('var(--spacing-lg)')
  })

  it('defines breakpoint utilities for sm, md, lg, and xl ranges', () => {
    const css = readFileSync(responsiveCssPath, 'utf-8')

    expect(css).toContain('@media (min-width: 600px)')
    expect(css).toContain('@media (min-width: 960px)')
    expect(css).toContain('@media (min-width: 1264px)')
    expect(css).toContain('@media (min-width: 1904px)')
    expect(css).toContain('.u-only-sm-up')
    expect(css).toContain('.u-only-md-up')
    expect(css).toContain('.u-only-lg-up')
    expect(css).toContain('.u-only-xl-up')
  })
})
