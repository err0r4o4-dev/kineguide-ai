import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import {
  mkdtemp,
  readFile,
  writeFile,
  access,
  rm,
  mkdir,
  readdir
} from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import test from 'node:test'

const cli = await import('./train.mjs')
const root = resolve(import.meta.dirname, '../..')

async function fixture(context, changes = {}) {
  const directory = await mkdtemp(join(tmpdir(), 'kgmp-test-'))
  await mkdir(join(root, 'tmp'), { recursive: true })
  const outputParent = await mkdtemp(join(root, 'tmp', 'kgmp-test-'))
  context.after(async () => {
    await rm(directory, { recursive: true, force: true })
    await rm(outputParent, { recursive: true, force: true })
  })
  const source = await readFile(
    join(root, 'research/multiposture/training.test.mjs'),
    'utf8'
  )
  const namesBlock = source.match(/const jointNames = \[([\s\S]*?)\n\]/)[1]
  const names = [...namesBlock.matchAll(/'([^']+)'/g)].map((match) => match[1])
  const features = names.flatMap((joint) =>
    ['x', 'y', 'z'].map((axis) => `${joint}_${axis}`)
  )
  const rows = ['generated-a', 'generated-b', 'generated-c'].flatMap(
    (subject) => [
      [subject, 'TUP', 'LAP', ...features.map(() => -2)].join(','),
      [subject, 'TLF', 'LCS', ...features.map(() => 2)].join(',')
    ]
  )
  const csv =
    [
      'subject,upperbody_label,lowerbody_label,' + features.join(','),
      ...rows
    ].join('\n') + '\n'
  const input = join(directory, 'fixture.csv')
  const manifest = join(directory, 'manifest.json')
  await writeFile(input, csv)
  await writeFile(
    manifest,
    JSON.stringify({
      sha256: createHash('sha256').update(csv).digest('hex'),
      bytes: Buffer.byteLength(csv),
      license: 'CC-BY-4.0',
      originalConsentVerified: true,
      trainingAuthorized: true,
      consentEvidence:
        'https://example.invalid/generated-fixture-not-participant-data',
      ...changes
    })
  )
  const output = join(outputParent, 'run')
  return {
    input,
    manifest,
    output,
    arguments: [
      '--input',
      input,
      '--manifest',
      manifest,
      '--output-dir',
      output
    ]
  }
}

test('denies unreviewed consent before creating artifacts', async (context) => {
  assert.equal(typeof cli.run, 'function')
  const files = await fixture(context, { originalConsentVerified: false })
  await assert.rejects(cli.run(files.arguments), /KGMP_E_APPROVAL/)
  await assert.rejects(access(files.output))
})

test('denies missing authorization, evidence and license', async (context) => {
  assert.equal(typeof cli.run, 'function')
  for (const change of [
    { trainingAuthorized: false },
    { consentEvidence: '' },
    { license: 'unknown' }
  ]) {
    const files = await fixture(context, change)
    await assert.rejects(cli.run(files.arguments), /KGMP_E_APPROVAL/)
    await assert.rejects(access(files.output))
  }
})

test('rejects changed input, oversized manifest and unsafe output without artifacts', async (context) => {
  assert.equal(typeof cli.run, 'function')
  const files = await fixture(context)
  await writeFile(files.input, 'private-sensitive-content')
  await assert.rejects(cli.run(files.arguments), /KGMP_E_INTEGRITY/)
  await writeFile(files.manifest, 'x'.repeat(65_537))
  await assert.rejects(cli.run(files.arguments), /KGMP_E_MANIFEST/)
  await assert.rejects(
    cli.run([
      '--input',
      files.input,
      '--manifest',
      files.manifest,
      '--output-dir',
      join(root, 'research', 'unsafe-model')
    ]),
    /KGMP_E_OUTPUT/
  )
  await assert.rejects(cli.run([]), /KGMP_E_ARGS/)
})

test('writes deterministic models and aggregate reports and refuses overwrite', async (context) => {
  assert.equal(typeof cli.run, 'function')
  const files = await fixture(context)
  const report = await cli.run(files.arguments)
  const names = await readdir(files.output)
  assert.deepEqual(names.sort(), ['model.json', 'report.json'])
  const model = await readFile(join(files.output, 'model.json'), 'utf8')
  assert.equal(
    createHash('sha256').update(model).digest('hex'),
    report.modelSha256
  )
  assert.equal(report.liveValidation, false)
  assert.equal(report.tasks.upper.accuracy, 1)
  assert.equal(report.validation.testPredictions, 6)
  assert.ok(!JSON.stringify(report).includes('generated-a'))
  const repeat = await fixture(context)
  const second = await cli.run(repeat.arguments)
  assert.deepEqual(report, second)
  await assert.rejects(cli.run(files.arguments), /KGMP_E_OUTPUT_EXISTS/)
  assert.equal(await readFile(join(files.output, 'model.json'), 'utf8'), model)
})

test('failed report write removes staging and publishes no partial model', async (context) => {
  assert.equal(typeof cli.writeArtifacts, 'function')
  const files = await fixture(context)
  const parent = resolve(files.output, '..')
  await assert.rejects(
    cli.writeArtifacts(
      files.output,
      '{}\n',
      '{}\n',
      async (path, bytes, options) => {
        if (path.endsWith('report.json'))
          throw new Error('injected write failure')
        return writeFile(path, bytes, options)
      }
    ),
    /KGMP_E_WRITE/
  )
  await assert.rejects(access(files.output))
  assert.deepEqual(await readdir(parent), [])
})

test('process error output never echoes private data or input paths', async (context) => {
  assert.equal(typeof cli.run, 'function')
  const files = await fixture(context, { originalConsentVerified: false })
  const result = spawnSync(
    process.execPath,
    [join(root, 'research/multiposture/train.mjs'), ...files.arguments],
    { encoding: 'utf8' }
  )
  assert.equal(result.status, 1)
  assert.match(result.stderr, /KGMP_E_APPROVAL/)
  assert.ok(!result.stderr.includes(files.input))
  assert.equal(result.stdout, '')
})
