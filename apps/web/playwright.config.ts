import os from 'node:os'
import path from 'node:path'

import { defineConfig, devices } from '@playwright/test'

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
    baseURL: 'http://127.0.0.1:5173',
    trace: 'on-first-retry'
  },
  webServer: {
    command:
      'node node_modules/vite/bin/vite.js --host 127.0.0.1 --configLoader runner',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
})
