import { createRequire } from 'node:module'
import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { optimize as optimizeSvg } from 'svgo'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

const svgOptimizationPlugin = (): Plugin => ({
  name: 'svg-optimization',
  enforce: 'pre',
  transform(source, id) {
    const [assetPath, query = ''] = id.split('?', 2)

    if (!assetPath.endsWith('.svg') || query.includes('raw')) {
      return null
    }

    const optimized = optimizeSvg(source, {
      multipass: true,
      plugins: ['preset-default'],
    })

    return 'data' in optimized ? optimized.data : null
  },
})

const shouldAnalyzeBundle = process.env.BUNDLE_ANALYZE === 'true'
const require = createRequire(import.meta.url)
const resolveAnalyzePlugin = (): Plugin | null => {
  if (!shouldAnalyzeBundle) {
    return null
  }

  try {
    const { visualizer } = require('rollup-plugin-visualizer') as {
      visualizer: (options: Record<string, unknown>) => Plugin
    }
    return visualizer({
      filename: 'dist/bundle-analysis.html',
      gzipSize: true,
      brotliSize: true,
      open: false,
    })
  } catch {
    console.warn('Bundle analysis requested but rollup-plugin-visualizer is not installed.')
    return null
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: '/ImplPlanViewer/',
  plugins: [
    svgOptimizationPlugin(),
    vue({
      template: { transformAssetUrls },
    }),
    vuetify({ autoImport: true }),
    resolveAnalyzePlugin(),
  ].filter((plugin): plugin is Plugin => Boolean(plugin)),
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: true,
    assetsInlineLimit: 8 * 1024,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      treeshake: true,
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined
          }

          if (id.includes('/shiki/') || id.includes('/@shikijs/')) {
            return 'markdown-highlighter'
          }

          if (id.includes('/markdown-it') || id.includes('/entities/') || id.includes('/linkify-it/')) {
            return 'markdown-runtime'
          }

          if (id.includes('/vuetify/')) {
            return 'ui-vendor'
          }

          if (id.includes('/d3') || id.includes('/delaunator/')) {
            return 'd3-vendor'
          }

          if (id.includes('/vue/') || id.includes('/vue-router/') || id.includes('/pinia/')) {
            return 'vue-vendor'
          }

          return 'vendor'
        },
      },
    },
  },
})
