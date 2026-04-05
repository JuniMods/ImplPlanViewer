import { describe, expect, it } from 'vitest'
import type { OutputOptions } from 'rollup'

import viteConfig from '../../../vite.config'

const outputOptions = viteConfig.build?.rollupOptions?.output as OutputOptions
const manualChunks = outputOptions.manualChunks as (id: string) => string | undefined

describe('vite bundle optimization config', () => {
  it('splits key dependencies into dedicated chunks', () => {
    expect(manualChunks('/project/node_modules/@shikijs/core/index.mjs')).toBe('markdown-highlighter')
    expect(manualChunks('/project/node_modules/markdown-it/dist/index.mjs')).toBe('markdown-runtime')
    expect(manualChunks('/project/node_modules/vuetify/lib/index.mjs')).toBe('ui-vendor')
    expect(manualChunks('/project/node_modules/vue-router/dist/index.mjs')).toBe('vue-vendor')
    expect(manualChunks('/project/node_modules/lodash-es/lodash.js')).toBe('vendor')
  })

  it('leaves application files untouched', () => {
    expect(manualChunks('/project/src/main.ts')).toBeUndefined()
  })
})
