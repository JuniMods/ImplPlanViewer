import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'

const HOST = '127.0.0.1'
const PORT = Number(process.env.CROSS_BROWSER_PORT ?? '4174')
const BASE_PATH = '/ImplPlanViewer/'
const TARGET_URL = `http://${HOST}:${PORT}${BASE_PATH}`

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

const isMissingBrowserError = (error) =>
  error instanceof Error &&
  (error.message.includes('Executable doesn') ||
    error.message.includes('browserType.launch') ||
    error.message.includes('Please run the following command'))

const run = async () => {
  let playwrightModule
  try {
    playwrightModule = await import('playwright')
  } catch {
    console.warn('Skipping cross-browser smoke test: playwright is not installed.')
    return
  }

  const browserMatrix = [
    { name: 'chromium', type: playwrightModule.chromium },
    { name: 'firefox', type: playwrightModule.firefox },
    { name: 'webkit', type: playwrightModule.webkit },
  ]

  const previewServer = startPreviewServer()
  const results = []

  try {
    await waitForServer()

    for (const browserEntry of browserMatrix) {
      try {
        const browser = await browserEntry.type.launch({ headless: true })
        const page = await browser.newPage()
        await page.goto(TARGET_URL, { waitUntil: 'networkidle' })
        await page.locator('[data-testid="error-boundary"]').first().waitFor({ timeout: 5_000 })
        await page.locator('#main-content').first().waitFor({ timeout: 5_000 })
        await browser.close()
        results.push({ browser: browserEntry.name, status: 'passed' })
      } catch (error) {
        if (isMissingBrowserError(error)) {
          results.push({ browser: browserEntry.name, status: 'skipped' })
          console.warn(`Skipping ${browserEntry.name}: browser runtime is not installed.`)
          continue
        }

        const message = error instanceof Error ? error.message : String(error)
        results.push({ browser: browserEntry.name, status: 'failed', message })
      }
    }
  } finally {
    stopProcess(previewServer)
  }

  console.log('Cross-browser smoke summary:')
  for (const result of results) {
    const suffix = 'message' in result ? ` (${result.message})` : ''
    console.log(`- ${result.browser}: ${result.status}${suffix}`)
  }

  const failed = results.filter((result) => result.status === 'failed')
  if (failed.length > 0) {
    process.exitCode = 1
  }
}

void run()
