import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const componentsDir = resolve(process.cwd(), 'src/components')

const listVueFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = resolve(directory, entry.name)
    if (entry.isDirectory()) {
      return listVueFiles(fullPath)
    }

    return entry.isFile() && fullPath.endsWith('.vue') ? [fullPath] : []
  })

describe('component scoped styles', () => {
  it('ensures every component defines a scoped style block', () => {
    const missingScopedStyle = listVueFiles(componentsDir).filter((filePath) => {
      const source = readFileSync(filePath, 'utf-8')
      return !source.includes('<style scoped>')
    })

    expect(missingScopedStyle).toEqual([])
  })
})
