import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'

import lighthouse from 'lighthouse'
import { launch } from 'chrome-launcher'

const HOST = '127.0.0.1'
const PORT = Number(process.env.LIGHTHOUSE_PORT ?? '4173')
const TARGET_URL = `http://${HOST}:${PORT}`

const startPreviewServer = () =>
  spawn('npm', ['run', 'preview', '--', '--host', HOST, '--port', String(PORT), '--strictPort'], {
    stdio: ['ignore', 'inherit', 'inherit'],
    shell: process.platform === 'win32',
  })

const isServerReady = async () => {
  try {
    const response = await fetch(TARGET_URL, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

const waitForServer = async () => {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (await isServerReady()) {
      return
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
  const previewServer = startPreviewServer()

  try {
    await waitForServer()

    let chrome
    try {
      chrome = await launch({
        chromeFlags: ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage'],
      })
    } catch (error) {
      console.warn('Skipping Lighthouse profile: no Chrome/Chromium runtime available.')
      console.warn(error instanceof Error ? error.message : String(error))
      return
    }

    try {
      const result = await lighthouse(TARGET_URL, {
        port: chrome.port,
        output: ['html', 'json'],
        logLevel: 'error',
      })

      const categoryScores = result?.lhr.categories ?? {}
      console.log('Lighthouse scores:')
      for (const [category, details] of Object.entries(categoryScores)) {
        const score = typeof details.score === 'number' ? Math.round(details.score * 100) : 0
        console.log(`- ${category}: ${score}`)
      }
    } finally {
      await chrome.kill()
    }
  } finally {
    stopProcess(previewServer)
  }
}

void run()
