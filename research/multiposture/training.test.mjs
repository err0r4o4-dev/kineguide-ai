import assert from 'node:assert/strict'
import test from 'node:test'

const training = await import('./training.mjs')

const jointNames = [
  'nose',
  'left_eye_inner',
  'left_eye',
  'left_eye_outer',
  'right_eye_inner',
  'right_eye',
  'right_eye_outer',
  'left_ear',
  'right_ear',
  'mouth_left',
  'mouth_right',
  'left_shoulder',
  'right_shoulder',
  'left_elbow',
  'right_elbow',
  'left_wrist',
  'right_wrist',
  'left_pinky',
  'right_pinky',
  'left_index',
  'right_index',
  'left_thumb',
  'right_thumb',
  'left_hip',
  'right_hip',
  'left_knee',
  'right_knee',
  'left_ankle',
  'right_ankle',
  'left_heel',
  'right_heel',
  'left_foot_index',
  'right_foot_index'
]
const featureNames = jointNames.flatMap((joint) =>
  ['x', 'y', 'z'].map((axis) => `${joint}_${axis}`)
)

function csv(records) {
  return (
    [
      ['subject', 'upperbody_label', 'lowerbody_label', ...featureNames].join(
        ','
      ),
      ...records.map((record) =>
        [record.subject, record.upper, record.lower, ...record.features].join(
          ','
        )
      )
    ].join('\n') + '\n'
  )
}

function records() {
  return [
    'fixture-private-a',
    'fixture-private-b',
    'fixture-private-c'
  ].flatMap((subject) => [
    {
      subject,
      upper: 'TUP',
      lower: 'LAP',
      features: featureNames.map(() => -2)
    },
    { subject, upper: 'TLF', lower: 'LCS', features: featureNames.map(() => 2) }
  ])
}

test('parses named XYZ columns without copying subject metadata into features', () => {
  assert.equal(typeof training.parseDataset, 'function')
  const parsed = training.parseDataset(
    '\uFEFF' + csv(records()).replaceAll('\n', '\r\n')
  )
  assert.deepEqual(parsed.featureNames, featureNames)
  assert.equal(parsed.records.length, 6)
  assert.equal(parsed.records[0].features.length, 99)
  assert.equal(parsed.records[0].subject, 'fixture-private-a')
})

test('rejects malformed, missing, oversized, non-finite and unexpected data without echoing rows', () => {
  assert.equal(typeof training.parseDataset, 'function')
  const valid = csv(records())
  for (const invalid of [
    '',
    valid.replace('nose_y', 'nose_x'),
    valid.replace('nose_y', 'unknown_y'),
    valid.replace('TUP', 'private-invalid-label'),
    valid.replace(',-2,', ',NaN,'),
    valid.replace(',-2,', ',1e309,'),
    valid.replace(',-2,', ',,'),
    valid.replace('fixture-private-a', '"fixture-private-a"'),
    valid.replace('fixture-private-a', ''),
    valid + '\n',
    valid.replace(',-2,', ',1000001,'),
    'x'.repeat(10_000_001)
  ]) {
    assert.throws(
      () => training.parseDataset(invalid),
      (error) => {
        assert.equal(error.message, 'Invalid MultiPosture dataset')
        return true
      }
    )
  }
})

test('fits scaling on training rows only with a safe constant-column scale', () => {
  assert.equal(typeof training.fitModel, 'function')
  const input = [
    { subject: 'train-a', upper: 'TUP', lower: 'LAP', features: [0, 7] },
    { subject: 'train-b', upper: 'TLF', lower: 'LCS', features: [2, 7] }
  ]
  const model = training.fitModel(input, ['test_x', 'test_y'])
  assert.deepEqual(model.scaler.mean, [1, 7])
  assert.deepEqual(model.scaler.scale, [1, 1])
  assert.equal(training.predict(model, [0, 7]).upper, 'TUP')
  assert.equal(training.predict(model, [2, 7]).lower, 'LCS')
  assert.throws(() => training.predict(model, [NaN, 7]))
  assert.throws(() => training.predict(model, [0]))
  assert.throws(() => training.fitModel([], ['test_x']))
  assert.throws(() => training.fitModel(input, ['only_one']))
})

test('computes confusion matrix, error rate and fixed-label macro-F1 by hand', () => {
  assert.equal(typeof training.classificationMetrics, 'function')
  const metrics = training.classificationMetrics(
    ['A', 'B', 'C'],
    [
      { actual: 'A', predicted: 'A' },
      { actual: 'A', predicted: 'B' },
      { actual: 'B', predicted: 'B' },
      { actual: 'C', predicted: 'B' }
    ]
  )
  assert.deepEqual(metrics.confusionMatrix, [
    [1, 1, 0],
    [0, 1, 0],
    [0, 1, 0]
  ])
  assert.equal(metrics.accuracy, 0.5)
  assert.equal(metrics.errorRate, 0.5)
  assert.ok(Math.abs(metrics.macroF1 - (2 / 3 + 0.5) / 3) < 1e-12)
  assert.equal(metrics.perClass[2].f1, 0)
  assert.equal(metrics.perClass[2].recall, 0)
  assert.equal(metrics.perClass[0].support, 2)
  assert.throws(() =>
    training.classificationMetrics(
      ['A'],
      [{ actual: 'A', predicted: 'secret' }]
    )
  )
})

test('holds out every subject once and does not let extreme test rows change train scaling', () => {
  assert.equal(typeof training.subjectFolds, 'function')
  const input = records()
  input[4].features.fill(1000)
  const folds = training.subjectFolds(input)
  assert.equal(folds.length, 3)
  for (const fold of folds) {
    assert.equal(new Set(fold.test.map((row) => row.subject)).size, 1)
    const heldOut = fold.test[0].subject
    assert.ok(fold.train.every((row) => row.subject !== heldOut))
  }
  const extremeFold = folds.find(
    (fold) => fold.test[0].subject === 'fixture-private-c'
  )
  const model = training.fitModel(extremeFold.train, featureNames)
  assert.ok(model.scaler.mean.every((value) => value === 0))
  assert.throws(() => training.subjectFolds(input.slice(0, 2)))
})

test('training is deterministic and aggregates exclude participants, rows and live claims', () => {
  assert.equal(typeof training.trainAndEvaluate, 'function')
  const parsed = training.parseDataset(csv(records()))
  const result = training.trainAndEvaluate(parsed)
  assert.deepEqual(result, training.trainAndEvaluate(parsed))
  assert.equal(result.report.validation.foldCount, 3)
  assert.equal(result.report.validation.testPredictions, 6)
  assert.equal(result.report.tasks.upper.accuracy, 1)
  assert.equal(result.report.tasks.lower.accuracy, 1)
  assert.equal(result.report.tasks.upper.perClass.length, 5)
  assert.equal(result.report.tasks.lower.perClass.length, 7)
  assert.equal(result.report.liveValidation, false)
  assert.equal(result.report.measurementErrorEstablished, false)
  assert.equal(result.model.deploymentEligible, false)
  const serialized = JSON.stringify(result)
  assert.ok(!serialized.includes('fixture-private'))
  assert.ok(!serialized.includes('"records"'))
  assert.ok(!serialized.includes('"predictions"'))
})

test('rejects invalid direct training records instead of producing NaN artifacts', () => {
  assert.equal(typeof training.trainAndEvaluate, 'function')
  const parsed = training.parseDataset(csv(records()))
  parsed.records[0].features[0] = Infinity
  assert.throws(() => training.trainAndEvaluate(parsed))
})
