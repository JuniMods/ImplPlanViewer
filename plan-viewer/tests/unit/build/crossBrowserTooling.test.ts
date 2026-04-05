import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const packageJsonPath = resolve(process.cwd(), 'package.json')
const crossBrowserScriptPath = resolve(process.cwd(), 'scripts/run-cross-browser.mjs')

describe('cross-browser tooling', () => {
  it('defines cross-browser script command', () => {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as {
      scripts?: Record<string, string>
    }

    expect(packageJson.scripts?.['test:cross-browser']).toContain('run-cross-browser.mjs')
  })

  it('runs smoke checks against chromium, firefox, and webkit', () => {
    const script = readFileSync(crossBrowserScriptPath, 'utf-8')

    expect(script).toContain("import('playwright')")
    expect(script).toContain("'chromium'")
    expect(script).toContain("'firefox'")
    expect(script).toContain("'webkit'")
    expect(script).toContain('[data-testid="error-boundary"]')
    expect(script).toContain('#main-content')
  })
})
