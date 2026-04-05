import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const packageJsonPath = resolve(process.cwd(), 'package.json')
const viteConfigPath = resolve(process.cwd(), 'vite.config.ts')

describe('performance profiling tooling', () => {
  it('defines bundle analysis and lighthouse scripts', () => {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as {
      scripts?: Record<string, string>
      devDependencies?: Record<string, string>
    }

    expect(packageJson.scripts?.['build:analyze']).toBeDefined()
    expect(packageJson.scripts?.['perf:bundle']).toBe('npm run build:analyze')
    expect(packageJson.scripts?.['perf:lighthouse']).toContain('run-lighthouse.mjs')
    expect(packageJson.devDependencies?.lighthouse).toBeDefined()
  })

  it('keeps bundle analyzer output configured in vite', () => {
    const viteConfig = readFileSync(viteConfigPath, 'utf-8')

    expect(viteConfig).toContain('bundle-analysis.html')
  })
})
