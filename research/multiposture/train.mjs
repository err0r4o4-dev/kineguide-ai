import { createHash } from 'node:crypto'
import {
  open,
  realpath,
  lstat,
  mkdtemp,
  rename,
  rmdir,
  unlink,
  writeFile
} from 'node:fs/promises'
import { basename, dirname, join, relative, resolve } from 'node:path'
import { parseDataset, trainAndEvaluate } from './training.mjs'

const ROOT = resolve(import.meta.dirname, '../..')

class TrainingError extends Error {}

function fail(code) {
  throw new TrainingError(code)
}

function within(parent, child) {
  const difference = relative(parent, child)
  return (
    difference === '' ||
    (!difference.startsWith('..') && !difference.includes(':'))
  )
}

async function boundedRead(path, maximum, errorCode) {
  let handle
  try {
    handle = await open(path, 'r')
    const buffer = Buffer.alloc(maximum + 1)
    let total = 0
    while (total < buffer.length) {
      const { bytesRead } = await handle.read(
        buffer,
        total,
        buffer.length - total,
        total
      )
      if (bytesRead === 0) break
      total += bytesRead
    }
    if (total > maximum) fail(errorCode)
    return buffer.subarray(0, total)
  } catch {
    fail(errorCode)
  } finally {
    await handle?.close()
  }
}

async function outputPath(path) {
  const candidate = resolve(path)
  const repository = await realpath(ROOT)
  const permitted = [join(ROOT, 'tmp'), join(ROOT, 'research/models')]
  const allowedRoot = permitted.find(
    (parent) => within(parent, candidate) && parent !== candidate
  )
  if (!allowedRoot) fail('KGMP_E_OUTPUT')
  try {
    const parent = await realpath(dirname(candidate))
    const realRoot = await realpath(allowedRoot)
    if (!within(repository, realRoot) || !within(realRoot, parent))
      fail('KGMP_E_OUTPUT')
    return join(parent, basename(candidate))
  } catch {
    fail('KGMP_E_OUTPUT')
  }
}

function parseApproval(bytes) {
  let manifest
  try {
    manifest = JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/, ''))
  } catch {
    fail('KGMP_E_MANIFEST')
  }
  if (
    !manifest ||
    manifest.license !== 'CC-BY-4.0' ||
    manifest.originalConsentVerified !== true ||
    manifest.trainingAuthorized !== true ||
    typeof manifest.consentEvidence !== 'string' ||
    !manifest.consentEvidence.startsWith('https://')
  )
    fail('KGMP_E_APPROVAL')
  if (
    !/^[a-f0-9]{64}$/.test(manifest.sha256) ||
    !Number.isSafeInteger(manifest.bytes) ||
    manifest.bytes < 1 ||
    manifest.bytes > 10_000_000
  )
    fail('KGMP_E_MANIFEST')
  return manifest
}

function hash(bytes) {
  return createHash('sha256').update(bytes).digest('hex')
}

async function requireNewOutput(output) {
  try {
    await lstat(output)
  } catch (error) {
    if (error.code === 'ENOENT') return
    fail('KGMP_E_OUTPUT')
  }
  fail('KGMP_E_OUTPUT_EXISTS')
}

export async function writeArtifacts(
  output,
  modelBytes,
  reportBytes,
  writer = writeFile
) {
  output = await outputPath(output)
  await requireNewOutput(output)
  const staging = await mkdtemp(join(dirname(output), '.kgmp-'))
  let published = false
  try {
    await writer(join(staging, 'model.json'), modelBytes, {
      flag: 'wx',
      mode: 0o600
    })
    await writer(join(staging, 'report.json'), reportBytes, {
      flag: 'wx',
      mode: 0o600
    })
    await requireNewOutput(output)
    await rename(staging, output)
    published = true
  } catch (error) {
    if (error instanceof TrainingError) throw error
    fail('KGMP_E_WRITE')
  } finally {
    if (!published) {
      try {
        for (const name of ['model.json', 'report.json']) {
          await unlink(join(staging, name)).catch((error) => {
            if (error.code !== 'ENOENT') throw error
          })
        }
        await rmdir(staging)
      } catch {
        fail('KGMP_E_CLEANUP')
      }
    }
  }
}

export async function run(args) {
  if (
    args.length !== 6 ||
    args[0] !== '--input' ||
    args[2] !== '--manifest' ||
    args[4] !== '--output-dir'
  )
    fail('KGMP_E_ARGS')
  const output = await outputPath(args[5])
  const manifestBytes = await boundedRead(
    resolve(args[3]),
    65_536,
    'KGMP_E_MANIFEST'
  )
  const manifest = parseApproval(manifestBytes)
  const inputBytes = await boundedRead(
    resolve(args[1]),
    10_000_000,
    'KGMP_E_INPUT'
  )
  if (
    inputBytes.length !== manifest.bytes ||
    hash(inputBytes) !== manifest.sha256
  )
    fail('KGMP_E_INTEGRITY')
  let dataset
  try {
    dataset = parseDataset(inputBytes.toString('utf8'))
  } catch {
    fail('KGMP_E_DATASET')
  }
  const { report, model } = trainAndEvaluate(dataset)
  const sources = await Promise.all(
    ['training.mjs', 'train.mjs'].map((name) =>
      boundedRead(join(import.meta.dirname, name), 100_000, 'KGMP_E_SOURCE')
    )
  )
  const provenance = {
    inputSha256: manifest.sha256,
    approvalManifestSha256: hash(manifestBytes),
    implementationSha256: hash(Buffer.concat(sources)),
    runtime: process.version,
    license: 'CC-BY-4.0',
    approvalScope: 'local-offline-research-only',
    approvalDeclarationsVerifiedBySoftware: false
  }
  const modelBytes = JSON.stringify({ ...model, provenance }, null, 2) + '\n'
  const outputReport = { ...report, provenance, modelSha256: hash(modelBytes) }
  await writeArtifacts(
    output,
    modelBytes,
    JSON.stringify(outputReport, null, 2) + '\n'
  )
  return outputReport
}

if (import.meta.main) {
  run(process.argv.slice(2)).then(
    (report) => {
      process.stdout.write(
        `offline classification: frames=${report.validation.testPredictions} folds=${report.validation.foldCount}\n`
      )
      for (const task of ['upper', 'lower']) {
        const metrics = report.tasks[task]
        process.stdout.write(
          `${task}: accuracy=${metrics.accuracy.toFixed(6)} error=${metrics.errorRate.toFixed(6)} macroF1=${metrics.macroF1.toFixed(6)}\n`
        )
      }
      process.stdout.write(
        'liveValidation=false measurementErrorEstablished=false\n'
      )
    },
    (error) => {
      process.stderr.write(
        `${error instanceof TrainingError ? error.message : 'KGMP_E_TRAINING'}\n`
      )
      process.exitCode = 1
    }
  )
}
