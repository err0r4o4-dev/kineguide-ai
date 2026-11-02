export const UPPER_LABELS = ['TUP', 'TLB', 'TLF', 'TLR', 'TLL']
export const LOWER_LABELS = ['LAP', 'LWA', 'LCS', 'LCR', 'LCL', 'LLR', 'LLL']
const JOINTS = [
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
const FEATURES = JOINTS.flatMap((joint) =>
  ['x', 'y', 'z'].map((axis) => `${joint}_${axis}`)
)
const MAX_BYTES = 10_000_000

function invalid() {
  throw new Error('Invalid MultiPosture dataset')
}

function validVector(vector, size) {
  return (
    Array.isArray(vector) &&
    vector.length === size &&
    vector.every(
      (value) => Number.isFinite(value) && Math.abs(value) <= 1_000_000
    )
  )
}

function validateRecords(records, featureNames) {
  if (
    !Array.isArray(featureNames) ||
    featureNames.length === 0 ||
    featureNames.length > 99 ||
    new Set(featureNames).size !== featureNames.length ||
    !Array.isArray(records) ||
    records.length === 0 ||
    records.length > 5_000
  )
    invalid()
  for (const record of records) {
    if (
      !record ||
      typeof record.subject !== 'string' ||
      !record.subject.trim() ||
      record.subject.length > 128 ||
      !UPPER_LABELS.includes(record.upper) ||
      !LOWER_LABELS.includes(record.lower) ||
      !validVector(record.features, featureNames.length)
    )
      invalid()
  }
}

export function parseDataset(text) {
  if (
    typeof text !== 'string' ||
    Buffer.byteLength(text) > MAX_BYTES ||
    text.includes('"')
  )
    invalid()
  const lines = text
    .replace(/^\uFEFF/, '')
    .replace(/\r\n/g, '\n')
    .replace(/\n$/, '')
    .split('\n')
  const headers = lines.shift().split(',')
  const expected = [
    'subject',
    'upperbody_label',
    'lowerbody_label',
    ...FEATURES
  ]
  if (
    headers.length !== expected.length ||
    new Set(headers).size !== headers.length ||
    !expected.every((name) => headers.includes(name))
  )
    invalid()
  const indices = FEATURES.map((name) => headers.indexOf(name))
  const subjectIndex = headers.indexOf('subject')
  const upperIndex = headers.indexOf('upperbody_label')
  const lowerIndex = headers.indexOf('lowerbody_label')
  const records = lines.map((line) => {
    const values = line.split(',')
    if (
      values.length !== headers.length ||
      values.some((value) => !value.trim())
    )
      invalid()
    return {
      subject: values[subjectIndex],
      upper: values[upperIndex],
      lower: values[lowerIndex],
      features: indices.map((index) => Number(values[index]))
    }
  })
  validateRecords(records, FEATURES)
  return { featureNames: [...FEATURES], records }
}

function standardized(features, scaler) {
  return features.map(
    (value, index) => (value - scaler.mean[index]) / scaler.scale[index]
  )
}

export function fitModel(records, featureNames) {
  validateRecords(records, featureNames)
  const mean = featureNames.map(
    (_, index) =>
      records.reduce((sum, record) => sum + record.features[index], 0) /
      records.length
  )
  const scale = mean.map((value, index) => {
    const variance =
      records.reduce(
        (sum, record) => sum + (record.features[index] - value) ** 2,
        0
      ) / records.length
    return variance === 0 ? 1 : Math.sqrt(variance)
  })
  const scaler = { mean, scale }
  const normalized = records.map((record) => ({
    ...record,
    features: standardized(record.features, scaler)
  }))
  const tasks = {}
  for (const [task, labels] of [
    ['upper', UPPER_LABELS],
    ['lower', LOWER_LABELS]
  ]) {
    tasks[task] = labels.flatMap((label) => {
      const rows = normalized.filter((record) => record[task] === label)
      if (!rows.length) return []
      return [
        {
          label,
          centroid: featureNames.map(
            (_, index) =>
              rows.reduce((sum, row) => sum + row.features[index], 0) /
              rows.length
          )
        }
      ]
    })
  }
  return {
    schemaVersion: 1,
    algorithm: 'standardized-nearest-centroid-v1',
    featureNames: [...featureNames],
    featureSpace: 'as-published-xyz-unverified-camera-mapping',
    scaler,
    tasks,
    deploymentEligible: false
  }
}

export function predict(model, features) {
  if (!validVector(features, model.featureNames.length)) invalid()
  const normalized = standardized(features, model.scaler)
  const prediction = {}
  for (const task of ['upper', 'lower']) {
    let bestDistance = Infinity
    let bestLabel = null
    for (const { label, centroid } of model.tasks[task]) {
      const distance = normalized.reduce(
        (sum, value, index) => sum + (value - centroid[index]) ** 2,
        0
      )
      if (distance < bestDistance) {
        bestDistance = distance
        bestLabel = label
      }
    }
    if (bestLabel === null) invalid()
    prediction[task] = bestLabel
  }
  return prediction
}

export function subjectFolds(records) {
  const subjects = [...new Set(records.map((record) => record.subject))].sort()
  if (subjects.length < 2 || subjects.length > 100) invalid()
  return subjects.map((subject) => ({
    train: records.filter((record) => record.subject !== subject),
    test: records.filter((record) => record.subject === subject)
  }))
}

export function classificationMetrics(labels, pairs) {
  if (!labels.length || new Set(labels).size !== labels.length || !pairs.length)
    invalid()
  const matrix = labels.map(() => labels.map(() => 0))
  for (const pair of pairs) {
    const actualIndex = labels.indexOf(pair.actual)
    const predictedIndex = labels.indexOf(pair.predicted)
    if (actualIndex < 0 || predictedIndex < 0) invalid()
    matrix[actualIndex][predictedIndex]++
  }
  const perClass = labels.map((label, index) => {
    const truePositive = matrix[index][index]
    const support = matrix[index].reduce((sum, count) => sum + count, 0)
    const predicted = matrix.reduce((sum, row) => sum + row[index], 0)
    const precision = predicted ? truePositive / predicted : 0
    const recall = support ? truePositive / support : 0
    const f1 =
      precision + recall ? (2 * precision * recall) / (precision + recall) : 0
    return { label, support, precision, recall, f1 }
  })
  const accuracy =
    matrix.reduce((sum, row, index) => sum + row[index], 0) / pairs.length
  return {
    labels: [...labels],
    count: pairs.length,
    accuracy,
    errorRate: 1 - accuracy,
    macroF1: perClass.reduce((sum, item) => sum + item.f1, 0) / labels.length,
    balancedAccuracy:
      perClass.reduce((sum, item) => sum + item.recall, 0) / labels.length,
    zeroDivision: 0,
    confusionMatrixAxes: 'rows=actual,columns=predicted',
    confusionMatrix: matrix,
    perClass
  }
}

function majorityLabel(records, task, labels) {
  const counts = labels.map(
    (label) => records.filter((record) => record[task] === label).length
  )
  return labels[counts.indexOf(Math.max(...counts))]
}

export function trainAndEvaluate(dataset) {
  validateRecords(dataset.records, dataset.featureNames)
  const folds = subjectFolds(dataset.records)
  const predictions = { upper: [], lower: [] }
  const majorityPairs = { upper: [], lower: [] }
  const subjectAccuracy = { upper: [], lower: [] }
  const missingClassFolds = { upper: 0, lower: 0 }
  for (const fold of folds) {
    const model = fitModel(fold.train, dataset.featureNames)
    const foldPairs = { upper: [], lower: [] }
    const majority = {
      upper: majorityLabel(fold.train, 'upper', UPPER_LABELS),
      lower: majorityLabel(fold.train, 'lower', LOWER_LABELS)
    }
    for (const task of ['upper', 'lower']) {
      if (
        fold.test.some(
          (record) =>
            !model.tasks[task].some((item) => item.label === record[task])
        )
      )
        missingClassFolds[task]++
    }
    for (const record of fold.test) {
      const predicted = predict(model, record.features)
      for (const task of ['upper', 'lower']) {
        const pair = { actual: record[task], predicted: predicted[task] }
        foldPairs[task].push(pair)
        predictions[task].push(pair)
        majorityPairs[task].push({
          actual: record[task],
          predicted: majority[task]
        })
      }
    }
    for (const task of ['upper', 'lower']) {
      subjectAccuracy[task].push(
        foldPairs[task].filter((pair) => pair.actual === pair.predicted)
          .length / fold.test.length
      )
    }
  }
  const tasks = {}
  for (const [task, labels] of [
    ['upper', UPPER_LABELS],
    ['lower', LOWER_LABELS]
  ]) {
    tasks[task] = {
      ...classificationMetrics(labels, predictions[task]),
      subjectMeanAccuracy:
        subjectAccuracy[task].reduce((sum, accuracy) => sum + accuracy, 0) /
        folds.length,
      subjectAccuracyRange: {
        minimum: Math.min(...subjectAccuracy[task]),
        maximum: Math.max(...subjectAccuracy[task])
      },
      foldsWithUnseenTestClass: missingClassFolds[task],
      majorityBaseline: classificationMetrics(labels, majorityPairs[task])
    }
  }
  return {
    report: {
      schemaVersion: 1,
      pipelineScope: 'offline-multiposture-label-classification',
      algorithm: 'standardized-nearest-centroid-v1',
      liveValidation: false,
      measurementErrorEstablished: false,
      clinicalValidation: false,
      validation: {
        method: 'leave-one-subject-out',
        foldCount: folds.length,
        testPredictions: dataset.records.length,
        scalerFit: 'training-subjects-only',
        hyperparameterSearch: false,
        independentFinalHoldout: false
      },
      featureCount: dataset.featureNames.length,
      tasks,
      limitations: [
        'Dataset label classification only; not MediaPipe coordinate or angle error.',
        'No browser, visibility, framing, temporal smoothing or confidence-abstention evaluation.',
        'Coordinate mapping to browser input remains unverified.',
        'Model refit on all data is not the source of the cross-validation scores.',
        'Frame-weighted scores are correlated; participant means are also supplied. No confidence intervals.',
        'Publisher description differs from CSV; no clinical posture-correctness claim.'
      ]
    },
    model: fitModel(dataset.records, dataset.featureNames)
  }
}
