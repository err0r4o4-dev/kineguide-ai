import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const nginxPath = fileURLToPath(new URL('../nginx.conf', import.meta.url))
const nginx = readFileSync(nginxPath, 'utf8')

const requirements = [
  ['HTML entry revalidation', 'location = /index.html'],
  ['service-worker revalidation', 'location = /sw.js'],
  ['manifest revalidation', 'location = /manifest.webmanifest'],
  ['no-store cache policy', 'no-cache, no-store, must-revalidate'],
  ['hashed asset location', 'location ^~ /assets/'],
  ['immutable hashed assets', 'public, max-age=31536000, immutable']
]

const missing = requirements
  .filter(([, expected]) => !nginx.includes(expected))
  .map(([label]) => label)

assert.deepEqual(
  missing,
  [],
  `Missing Nginx cache rules: ${missing.join(', ')}`
)
console.log('Nginx PWA cache policy verified.')
