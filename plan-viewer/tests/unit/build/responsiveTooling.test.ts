import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const packageJsonPath = resolve(process.cwd(), 'package.json')
const responsiveScriptPath = resolve(process.cwd(), 'scripts/run-responsive-smoke.mjs')

describe('responsive tooling', () => {
  it('defines responsive smoke script command', () => {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as {
      scripts?: Record<string, string>
    }

    expect(packageJson.scripts?.['test:responsive']).toContain('run-responsive-smoke.mjs')
  })

  it('covers mobile, tablet, and desktop viewport smoke checks', () => {
    const script = readFileSync(responsiveScriptPath, 'utf-8')

    expect(script).toContain("import('playwright')")
    expect(script).toContain("'mobile-small'")
    expect(script).toContain("'mobile-large'")
    expect(script).toContain("'tablet'")
    expect(script).toContain("'desktop'")
    expect(script).toContain('[data-testid="home-view"]')
    expect(script).toContain('[data-testid="plan-search"]')
  })
})
