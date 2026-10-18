import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import {
  aggregateMetricErrors,
  evaluateRecords,
  validateDataset
} from './evaluator.mjs'

function landmarks() {
  return Array.from({ length: 33 }, (_, index) => ({
    x: 0.3 + index * 0.001,
    y: 0.4 + index * 0.001,
    visibility: 1
  }))
}

function record(overrides = {}) {
  return {
    subjectId: 'synthetic-a',
    condition: 'standard',
    frame: { width: 640, height: 480 },
    landmarks: landmarks(),
    reference: { shoulderSlopeDegrees: 1 },
    ...overrides
  }
}

function dataset(records = [record()]) {
  return {
    schemaVersion: 1,
    dataset: {
      name: 'technical fixture',
      source: 'generated test geometry',
      license: 'CC0-1.0',
      referenceKind: 'synthetic',
      split: 'development'
    },
    records
  }
}

test('rejects invalid dataset shapes, bounds, and metadata', () => {
  assert.throws(() => validateDataset({}), /Invalid evaluation dataset/)
  assert.throws(
    () =>
      validateDataset(dataset([record({ frame: { width: 0, height: 480 } })])),
    /Invalid evaluation dataset/
  )
  assert.throws(
    () =>
      validateDataset(
        dataset([record({ landmarks: landmarks().slice(0, 32) })])
      ),
    /Invalid evaluation dataset/
  )
  assert.throws(
    () =>
      validateDataset(
        dataset([
          record({
            landmarks: landmarks().map((landmark, index) =>
              index === 0 ? { ...landmark, visibility: 1.1 } : landmark
            )
          })
        ])
      ),
    /Invalid evaluation dataset/
  )
  assert.throws(
    () =>
      validateDataset(
        dataset([record({ reference: { shoulderSlopeDegrees: 91 } })])
      ),
    /Invalid evaluation dataset/
  )
  assert.throws(
    () =>
      validateDataset(
        dataset([record({ reference: { torsoInclinationDegrees: -1 } })])
      ),
    /Invalid evaluation dataset/
  )
  assert.throws(
    () =>
      validateDataset(
        dataset([record({ reference: { forwardHeadRatio: -0.1 } })])
      ),
    /Invalid evaluation dataset/
  )
  assert.throws(
    () =>
      validateDataset(
        dataset([
          record({ reference: { eyeShoulderDistanceRatio: 1_000_001 } })
        ])
      ),
    /Invalid evaluation dataset/
  )
  assert.throws(
    () =>
      validateDataset({
        ...dataset(),
        dataset: { ...dataset().dataset, license: 'x'.repeat(257) }
      }),
    /Invalid evaluation dataset/
  )
  assert.throws(
    () =>
      validateDataset({
        ...dataset(),
        dataset: { ...dataset().dataset, referenceKind: 'unverified' }
      }),
    /Invalid evaluation dataset/
  )
})

test('summarizes manual metric errors with MAE, RMSE, bias, and P95 absolute error', () => {
  const summary = aggregateMetricErrors([1, -3, 2, -2])
  assert.deepEqual(summary, {
    n: 4,
    mae: 2,
    rmse: 2.121,
    bias: -0.5,
    p95AbsoluteError: 3
  })
  assert.equal(aggregateMetricErrors([]), null)
})

test('records metric accounting, condition summaries, abstentions, and aggregate-only output', () => {
  const report = evaluateRecords(
    dataset([
      record({ subjectId: 'synthetic-a', condition: 'daylight' }),
      record({
        subjectId: 'synthetic-b',
        condition: 'dim',
        reference: {},
        landmarks: landmarks().map((landmark, index) =>
          index === 11 ? { ...landmark, visibility: 0 } : landmark
        )
      })
    ]),
    (frameLandmarks, frameDimensions) => {
      assert.deepEqual(frameDimensions, { width: 640, height: 480 })
      if (frameLandmarks[11].visibility === 0)
        return { status: 'insufficient_landmarks', missingIndices: [11] }
      return {
        status: 'valid',
        metrics: {
          shoulderSlopeDegrees: 2,
          headTiltDegrees: 0,
          torsoInclinationDegrees: null,
          eyeShoulderDistanceRatio: 1,
          forwardHeadRatio: 1
        }
      }
    },
    'seated-image-v2'
  )

  assert.equal(report.coverage.totalFrames, 2)
  assert.equal(report.coverage.validFrames, 1)
  assert.equal(report.coverage.abstainedFrames, 1)
  assert.equal(report.coverage.subjectCount, 2)
  assert.deepEqual(report.metrics.shoulderSlopeDegrees, {
    unit: 'degrees',
    pairedCount: 1,
    referenceCount: 1,
    missingReferenceCount: 1,
    unavailablePredictionCount: 1,
    summary: { n: 1, mae: 1, rmse: 1, bias: 1, p95AbsoluteError: 1 }
  })
  assert.equal(report.metrics.headTiltDegrees.summary, null)
  assert.equal(report.metrics.headTiltDegrees.missingReferenceCount, 2)
  assert.equal(report.metrics.headTiltDegrees.unavailablePredictionCount, 1)
  assert.deepEqual(report.coverage.rejectStatuses, {
    insufficient_landmarks: 1
  })
  assert.equal(report.coverage.byCondition.daylight.validFrames, 1)
  assert.equal(report.coverage.byCondition.dim.abstainedFrames, 1)
  assert.equal(
    report.byCondition.daylight.metrics.shoulderSlopeDegrees.summary.mae,
    1
  )
  assert.equal(
    report.byCondition.dim.metrics.shoulderSlopeDegrees
      .unavailablePredictionCount,
    1
  )
  assert.equal(report.pipelineScope, 'offline-seated-geometry')
  assert.equal(report.liveValidation, false)
  assert.equal(JSON.stringify(report).includes('synthetic-a'), false)
  assert.equal(JSON.stringify(report).includes('"x":0.3'), false)
})

test('all abstentions retain null summaries and unavailable prediction counts', () => {
  const report = evaluateRecords(
    dataset([
      record(),
      record({ subjectId: 'synthetic-b', condition: 'occluded' })
    ]),
    () => ({ status: 'invalid_coordinates' }),
    'seated-image-v2'
  )
  assert.equal(report.coverage.validFrames, 0)
  assert.equal(report.coverage.abstainedFrames, 2)
  assert.equal(report.metrics.forwardHeadRatio.summary, null)
  assert.equal(report.metrics.forwardHeadRatio.unavailablePredictionCount, 2)
  assert.throws(
    () =>
      evaluateRecords(
        dataset(),
        () => ({ status: 'invalid_coordinates' }),
        '   '
      ),
    /Invalid method version/
  )
})

test('CLI creates a redacted report and rejects unsafe output lifecycle', async (t) => {
  const directory = await mkdtemp(
    join(tmpdir(), 'kineguide-seated-evaluation-')
  )
  t.after(() => rm(directory, { recursive: true, force: true }))
  const input = join(directory, 'input.json')
  const output = join(directory, 'report.json')
  await writeFile(input, JSON.stringify(dataset()), 'utf8')
  const { spawnSync } = await import('node:child_process')
  const success = spawnSync(
    process.execPath,
    [
      'research/seated-evaluation/evaluate.mjs',
      '--input',
      input,
      '--output',
      output
    ],
    { cwd: process.cwd(), encoding: 'utf8' }
  )
  assert.equal(success.status, 0, success.stderr)
  assert.match(success.stdout, /frames=1/)
  const reportText = await readFile(output, 'utf8')
  assert.equal(reportText.includes('synthetic-a'), false)
  assert.equal(reportText.includes('"x":0.3'), false)
  const overwrite = spawnSync(
    process.execPath,
    [
      'research/seated-evaluation/evaluate.mjs',
      '--input',
      input,
      '--output',
      output
    ],
    { cwd: process.cwd(), encoding: 'utf8' }
  )
  assert.notEqual(overwrite.status, 0)
  const samePath = spawnSync(
    process.execPath,
    [
      'research/seated-evaluation/evaluate.mjs',
      '--input',
      input,
      '--output',
      input
    ],
    { cwd: process.cwd(), encoding: 'utf8' }
  )
  assert.notEqual(samePath.status, 0)
})

test('CLI rejects malformed and oversized inputs without echoing their content', async (t) => {
  const directory = await mkdtemp(
    join(tmpdir(), 'kineguide-seated-evaluation-')
  )
  t.after(() => rm(directory, { recursive: true, force: true }))
  const malformed = join(directory, 'malformed.json')
  const oversized = join(directory, 'oversized.json')
  const output = join(directory, 'report.json')
  await writeFile(malformed, '{"marker":"do-not-echo"}', 'utf8')
  await writeFile(oversized, 'x'.repeat(1_048_577), 'utf8')
  const { spawnSync } = await import('node:child_process')
  for (const [input, message] of [
    [malformed, 'KGSE_E_DATASET: invalid evaluation dataset.'],
    [oversized, 'KGSE_E_INPUT_SIZE: input exceeds the 1 MiB limit.']
  ]) {
    const result = spawnSync(
      process.execPath,
      [
        'research/seated-evaluation/evaluate.mjs',
        '--input',
        input,
        '--output',
        output
      ],
      { cwd: process.cwd(), encoding: 'utf8' }
    )
    assert.notEqual(result.status, 0)
    assert.equal(result.stdout.includes('do-not-echo'), false)
    assert.equal(result.stderr.includes('do-not-echo'), false)
    assert.equal(result.stderr, `${message}\n`)
  }
})
test('wraps undirected shoulder and head line errors across the plus-or-minus 90 boundary', () => {
  const report = evaluateRecords(
    dataset([
      record({
        reference: { shoulderSlopeDegrees: -89, headTiltDegrees: -90 }
      })
    ]),
    () => ({
      status: 'valid',
      metrics: {
        shoulderSlopeDegrees: 89,
        headTiltDegrees: 90,
        torsoInclinationDegrees: 0,
        eyeShoulderDistanceRatio: 1,
        forwardHeadRatio: 1
      }
    }),
    'seated-image-v2'
  )

  assert.equal(report.metrics.shoulderSlopeDegrees.summary.bias, -2)
  assert.equal(report.metrics.headTiltDegrees.summary.bias, 0)
})

test('CLI emits fixed redacted messages for argument and path failures', async (t) => {
  const directory = await mkdtemp(
    join(tmpdir(), 'kineguide-seated-evaluation-')
  )
  t.after(() => rm(directory, { recursive: true, force: true }))
  const input = join(directory, 'input.json')
  await writeFile(input, JSON.stringify(dataset()), 'utf8')
  const { spawnSync } = await import('node:child_process')
  const cases = [
    { argumentsList: [], message: 'KGSE_E_ARGS: invalid arguments.' },
    {
      argumentsList: [
        '--input',
        join(directory, 'missing.json'),
        '--output',
        join(directory, 'report.json')
      ],
      message: 'KGSE_E_INPUT: input is missing or unreadable.'
    },
    {
      argumentsList: [
        '--input',
        input,
        '--output',
        join(directory, 'missing-parent', 'report.json')
      ],
      message: 'KGSE_E_OUTPUT_PARENT: create the output parent directory.'
    }
  ]
  for (const testCase of cases) {
    const result = spawnSync(
      process.execPath,
      ['research/seated-evaluation/evaluate.mjs', ...testCase.argumentsList],
      { cwd: process.cwd(), encoding: 'utf8' }
    )
    assert.notEqual(result.status, 0)
    assert.equal(result.stderr, `${testCase.message}\n`)
    assert.equal(result.stderr.includes(directory), false)
  }
})
