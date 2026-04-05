import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'

const HOST = '127.0.0.1'
const PORT = Number(process.env.RESPONSIVE_PORT ?? '4175')
const TARGET_URL = `http://${HOST}:${PORT}/ImplPlanViewer/`

const viewportMatrix = [
  { name: 'mobile-small', width: 375, height: 667 },
  { name: 'mobile-large', width: 414, height: 896 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 },
]

const startPreviewServer = () =>
  spawn('npm', ['run', 'preview', '--', '--host', HOST, '--port', String(PORT), '--strictPort'], {
    stdio: ['ignore', 'inherit', 'inherit'],
    shell: process.platform === 'win32',
  })

const waitForServer = async () => {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    try {
      const response = await fetch(TARGET_URL, { method: 'HEAD' })
      if (response.ok) {
        return
      }
    } catch {
      // wait for server
    }

    await delay(500)
  }

  throw new Error(`Timed out waiting for preview server at ${TARGET_URL}`)
}

const stopProcess = (processHandle) => {
  if (processHandle.exitCode === null) {
    process.kill(processHandle.pid)
  }
}

const run = async () => {
  let playwrightModule
  try {
    playwrightModule = await import('playwright')
  } catch {
    console.warn('Skipping responsive smoke test: playwright is not installed.')
    return
  }

  const previewServer = startPreviewServer()
  const browser = await playwrightModule.chromium.launch({ headless: true })
  const results = []

  try {
    await waitForServer()

    for (const viewport of viewportMatrix) {
      const context = await browser.newContext({ viewport })
      const page = await context.newPage()

      try {
        await page.goto(TARGET_URL, { waitUntil: 'networkidle' })
        await page.locator('[data-testid="home-view"]').first().waitFor({ timeout: 5_000 })
        await page.locator('[data-testid="plan-search"]').first().waitFor({ timeout: 5_000 })
        results.push({ viewport: viewport.name, status: 'passed' })
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        results.push({ viewport: viewport.name, status: 'failed', message })
      } finally {
        await context.close()
      }
    }
  } finally {
    await browser.close()
    stopProcess(previewServer)
  }

  console.log('Responsive smoke summary:')
  for (const result of results) {
    const suffix = 'message' in result ? ` (${result.message})` : ''
    console.log(`- ${result.viewport}: ${result.status}${suffix}`)
  }

  if (results.some((result) => result.status === 'failed')) {
    process.exitCode = 1
  }
}

void run()
