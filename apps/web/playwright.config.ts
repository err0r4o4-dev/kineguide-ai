import os from 'node:os'
import path from 'node:path'

import { defineConfig, devices } from '@playwright/test'

const port = process.env.PLAYWRIGHT_PORT ?? '5173'
const baseURL = `http://127.0.0.1:${port}`

export default defineConfig({
  testDir: './e2e',
  outputDir: path.join(os.tmpdir(), 'kineguide-playwright-results'),
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [
    [
      'html',
      {
        open: 'never',
        outputFolder: path.join(os.tmpdir(), 'kineguide-playwright-report')
      }
    ],
    ['list']
  ],
  use: {
    baseURL,
    trace: 'on-first-retry'
  },
  webServer: {
    command: `node node_modules/vite/bin/vite.js --host 127.0.0.1 --port ${port} --configLoader runner`,
    url: baseURL,
    reuseExistingServer: !process.env.CI
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
})
