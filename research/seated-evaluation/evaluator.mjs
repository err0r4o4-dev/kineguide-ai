import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const CONDITIONS = new Set([
  'daylight',
  'dim',
  'occluded',
  'framing-shift',
  'standard'
])
const METRICS = {
  shoulderSlopeDegrees: {
    unit: 'degrees',
    minimum: -90,
    maximum: 90,
    undirected: true
  },
  headTiltDegrees: {
    unit: 'degrees',
    minimum: -90,
    maximum: 90,
    undirected: true
  },
  torsoInclinationDegrees: {
    unit: 'degrees',
    minimum: 0,
    maximum: 90,
    undirected: false
  },
  eyeShoulderDistanceRatio: {
    unit: 'ratio',
    minimum: 0,
    maximum: 1_000_000,
    undirected: false
  },
  forwardHeadRatio: {
    unit: 'ratio',
    minimum: 0,
    maximum: 1_000_000,
    undirected: false
  }
}
const METRIC_NAMES = Object.keys(METRICS)
const REFERENCE_KINDS = new Set(['synthetic', 'independent-2d'])
const SPLITS = new Set(['held-out', 'development'])

function invalidDataset() {
  throw new Error('Invalid evaluation dataset.')
}

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function hasOnlyKeys(value, keys) {
  return Object.keys(value).every((key) => keys.includes(key))
}

function finiteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value)
}

function boundedString(value, maximum) {
  return (
    typeof value === 'string' && value.trim() !== '' && value.length <= maximum
  )
}

function validReferenceValue(metric, value) {
  const definition = METRICS[metric]
  return (
    finiteNumber(value) &&
    value >= definition.minimum &&
    value <= definition.maximum
  )
}

function validateReference(reference) {
  if (!isPlainObject(reference) || !hasOnlyKeys(reference, METRIC_NAMES))
    invalidDataset()
  for (const metric of METRIC_NAMES) {
    const value = reference[metric]
    if (value === undefined) continue
    if (metric === 'torsoInclinationDegrees' && value === null) continue
    if (!validReferenceValue(metric, value)) invalidDataset()
  }
}

export function validateDataset(value) {
  if (
    !isPlainObject(value) ||
    !hasOnlyKeys(value, ['schemaVersion', 'dataset', 'records'])
  )
    invalidDataset()
  if (
    value.schemaVersion !== 1 ||
    !isPlainObject(value.dataset) ||
    !Array.isArray(value.records)
  )
    invalidDataset()
  if (value.records.length === 0 || value.records.length > 5_000)
    invalidDataset()
  const metadataKeys = ['name', 'source', 'license', 'referenceKind', 'split']
  if (!hasOnlyKeys(value.dataset, metadataKeys)) invalidDataset()
  if (
    !boundedString(value.dataset.name, 256) ||
    !boundedString(value.dataset.license, 256) ||
    !boundedString(value.dataset.source, 1_024)
  )
    invalidDataset()
  if (
    !REFERENCE_KINDS.has(value.dataset.referenceKind) ||
    !SPLITS.has(value.dataset.split)
  )
    invalidDataset()

  for (const record of value.records) {
    if (
      !isPlainObject(record) ||
      !hasOnlyKeys(record, [
        'subjectId',
        'condition',
        'frame',
        'landmarks',
        'reference'
      ])
    )
      invalidDataset()
    if (
      typeof record.subjectId !== 'string' ||
      !/^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(record.subjectId)
    )
      invalidDataset()
    if (!CONDITIONS.has(record.condition)) invalidDataset()
    if (
      !isPlainObject(record.frame) ||
      !hasOnlyKeys(record.frame, ['width', 'height'])
    )
      invalidDataset()
    if (
      !Number.isInteger(record.frame.width) ||
      !Number.isInteger(record.frame.height) ||
      record.frame.width < 1 ||
      record.frame.height < 1 ||
      record.frame.width > 16_384 ||
      record.frame.height > 16_384
    )
      invalidDataset()
    if (!Array.isArray(record.landmarks) || record.landmarks.length !== 33)
      invalidDataset()
    for (const landmark of record.landmarks) {
      if (
        !isPlainObject(landmark) ||
        !hasOnlyKeys(landmark, ['x', 'y', 'visibility']) ||
        !finiteNumber(landmark.x) ||
        !finiteNumber(landmark.y) ||
        !finiteNumber(landmark.visibility) ||
        landmark.visibility < 0 ||
        landmark.visibility > 1
      )
        invalidDataset()
    }
    validateReference(record.reference)
  }
  return value
}

function rounded(value) {
  return Number(value.toFixed(3))
}

export function aggregateMetricErrors(errors) {
  if (errors.length === 0) return null
  const absolute = errors.map(Math.abs).sort((left, right) => left - right)
  const p95Index = Math.ceil(absolute.length * 0.95) - 1
  const sum = errors.reduce((total, value) => total + value, 0)
  const squareSum = errors.reduce((total, value) => total + value ** 2, 0)
  return {
    n: errors.length,
    mae: rounded(
      absolute.reduce((total, value) => total + value, 0) / errors.length
    ),
    rmse: rounded(Math.sqrt(squareSum / errors.length)),
    bias: rounded(sum / errors.length),
    p95AbsoluteError: rounded(absolute[p95Index])
  }
}

function coverage() {
  return { totalFrames: 0, validFrames: 0, abstainedFrames: 0 }
}

function metricAccumulators() {
  return Object.fromEntries(
    METRIC_NAMES.map((metric) => [
      metric,
      {
        errors: [],
        referenceCount: 0,
        missingReferenceCount: 0,
        unavailablePredictionCount: 0
      }
    ])
  )
}

function wrappedLineDifference(observed, reference) {
  let difference = observed - reference
  while (difference < -90) difference += 180
  while (difference >= 90) difference -= 180
  return difference
}

function addMetricObservations(accumulators, result, reference) {
  for (const metric of METRIC_NAMES) {
    const accumulator = accumulators[metric]
    const expected = reference[metric]
    const hasReference = expected !== undefined && expected !== null
    if (hasReference) accumulator.referenceCount += 1
    else accumulator.missingReferenceCount += 1
    const observed = result.status === 'valid' ? result.metrics[metric] : null
    if (!finiteNumber(observed)) {
      accumulator.unavailablePredictionCount += 1
      continue
    }
    if (!hasReference) continue
    const difference = METRICS[metric].undirected
      ? wrappedLineDifference(observed, expected)
      : observed - expected
    accumulator.errors.push(difference)
  }
}

function reportMetrics(accumulators) {
  return Object.fromEntries(
    METRIC_NAMES.map((metric) => {
      const accumulator = accumulators[metric]
      return [
        metric,
        {
          unit: METRICS[metric].unit,
          pairedCount: accumulator.errors.length,
          referenceCount: accumulator.referenceCount,
          missingReferenceCount: accumulator.missingReferenceCount,
          unavailablePredictionCount: accumulator.unavailablePredictionCount,
          summary: aggregateMetricErrors(accumulator.errors)
        }
      ]
    })
  )
}

function validMethodVersion(methodVersion) {
  return typeof methodVersion === 'string' && methodVersion.trim() !== ''
}

export function evaluateRecords(
  dataset,
  calculateMetrics,
  methodVersion,
  inputSha256 = null
) {
  validateDataset(dataset)
  if (!validMethodVersion(methodVersion))
    throw new Error('Invalid method version.')
  const overallMetrics = metricAccumulators()
  const overallCoverage = coverage()
  const conditionStates = {}
  const rejectStatuses = {}
  const subjectIds = new Set()

  for (const record of dataset.records) {
    subjectIds.add(record.subjectId)
    overallCoverage.totalFrames += 1
    const conditionState = (conditionStates[record.condition] ??= {
      coverage: coverage(),
      metrics: metricAccumulators()
    })
    conditionState.coverage.totalFrames += 1
    const result = calculateMetrics(record.landmarks, record.frame)
    if (result.status === 'valid') {
      overallCoverage.validFrames += 1
      conditionState.coverage.validFrames += 1
    } else {
      overallCoverage.abstainedFrames += 1
      conditionState.coverage.abstainedFrames += 1
      rejectStatuses[result.status] = (rejectStatuses[result.status] ?? 0) + 1
    }
    addMetricObservations(overallMetrics, result, record.reference)
    addMetricObservations(conditionState.metrics, result, record.reference)
  }

  return {
    schemaVersion: 1,
    pipelineScope: 'offline-seated-geometry',
    liveValidation: false,
    methodVersion,
    inputSha256,
    dataset: {
      name: dataset.dataset.name,
      source: dataset.dataset.source,
      license: dataset.dataset.license,
      referenceKind: dataset.dataset.referenceKind,
      split: dataset.dataset.split
    },
    scope: {
      nonClinical: true,
      statement:
        'Technical evaluation only; this report does not establish clinical validity or correctness.'
    },
    coverage: {
      ...overallCoverage,
      subjectCount: subjectIds.size,
      rejectStatuses,
      byCondition: Object.fromEntries(
        Object.entries(conditionStates).map(([condition, state]) => [
          condition,
          state.coverage
        ])
      )
    },
    metrics: reportMetrics(overallMetrics),
    byCondition: Object.fromEntries(
      Object.entries(conditionStates).map(([condition, state]) => [
        condition,
        { coverage: state.coverage, metrics: reportMetrics(state.metrics) }
      ])
    )
  }
}

export function sha256(input) {
  return createHash('sha256').update(input).digest('hex')
}

export async function loadSeatedCalculator() {
  const repositoryRoot = resolve(
    fileURLToPath(new URL('../..', import.meta.url))
  )
  const webRoot = resolve(repositoryRoot, 'apps/web')
  const requireFromWeb = createRequire(resolve(webRoot, 'package.json'))
  const vite = await import(pathToFileURL(requireFromWeb.resolve('vite')).href)
  const server = await vite.createServer({
    root: webRoot,
    configFile: false,
    server: { middlewareMode: true, hmr: false, watch: null },
    customLogger: {
      info() {},
      warn() {},
      warnOnce() {},
      error() {},
      clearScreen() {},
      hasErrorLogged() {
        return true
      },
      hasWarned: false
    },
    optimizeDeps: { noDiscovery: true }
  })
  try {
    const module = await server.ssrLoadModule(
      '/src/features/pose/seatedMetrics.ts'
    )
    if (
      typeof module.calculateSeatedMetrics !== 'function' ||
      !validMethodVersion(module.SEATED_METRICS_METHOD_VERSION)
    )
      throw new Error('Seated metrics module is unavailable.')
    return {
      calculateMetrics: module.calculateSeatedMetrics,
      methodVersion: module.SEATED_METRICS_METHOD_VERSION,
      close: () => server.close()
    }
  } catch (error) {
    await server.close()
    throw error
  }
}
