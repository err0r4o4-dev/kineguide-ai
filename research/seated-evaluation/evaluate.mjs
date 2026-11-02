import { access, open, realpath, writeFile } from 'node:fs/promises'
import { constants } from 'node:fs'
import { basename, dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  evaluateRecords,
  loadSeatedCalculator,
  sha256,
  validateDataset
} from './evaluator.mjs'

const MAX_INPUT_BYTES = 1_048_576
const repositoryRoot = resolve(fileURLToPath(new URL('../..', import.meta.url)))
const researchRoot = resolve(repositoryRoot, 'research')
const temporaryOutputRoot = resolve(repositoryRoot, 'tmp')

class CliError extends Error {}

function cliError(code, message) {
  return new CliError(`${code}: ${message}`)
}

function usage() {
  throw cliError('KGSE_E_ARGS', 'invalid arguments.')
}

function isWithin(parent, child) {
  const path = relative(parent, child)
  return path === '' || (!path.startsWith('..') && !path.includes(':'))
}

function parseArguments(argumentsList) {
  if (
    argumentsList.length !== 4 ||
    argumentsList[0] !== '--input' ||
    argumentsList[2] !== '--output'
  )
    usage()
  return {
    input: resolve(argumentsList[1]),
    output: resolve(argumentsList[3])
  }
}

async function exists(path) {
  try {
    await access(path, constants.F_OK)
    return true
  } catch {
    return false
  }
}

async function readBounded(path) {
  let handle
  try {
    handle = await open(path, 'r')
  } catch {
    throw cliError('KGSE_E_INPUT', 'input is missing or unreadable.')
  }
  try {
    const buffer = Buffer.alloc(MAX_INPUT_BYTES + 1)
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0)
    if (bytesRead > MAX_INPUT_BYTES)
      throw cliError('KGSE_E_INPUT_SIZE', 'input exceeds the 1 MiB limit.')
    return buffer.subarray(0, bytesRead)
  } catch (error) {
    if (error instanceof CliError) throw error
    throw cliError('KGSE_E_INPUT', 'input is missing or unreadable.')
  } finally {
    await handle.close()
  }
}

async function resolveInput(path) {
  try {
    return await realpath(path)
  } catch {
    throw cliError('KGSE_E_INPUT', 'input is missing or unreadable.')
  }
}

async function resolveOutputParent(path) {
  try {
    return await realpath(dirname(path))
  } catch {
    throw cliError(
      'KGSE_E_OUTPUT_PARENT',
      'create the output parent directory.'
    )
  }
}

async function resolvePaths(inputPath, outputPath) {
  const [repositoryRealPath, researchRealPath, input, outputParent] =
    await Promise.all([
      realpath(repositoryRoot),
      realpath(researchRoot),
      resolveInput(inputPath),
      resolveOutputParent(outputPath)
    ])
  const output = resolve(outputParent, basename(outputPath))
  const outputIsLogicalRepositoryPath = isWithin(repositoryRoot, outputPath)
  const outputIsLogicalTemporaryPath = isWithin(temporaryOutputRoot, outputPath)
  const outputIsRepositoryPath = isWithin(repositoryRealPath, output)
  const outputIsResearchPath =
    isWithin(researchRoot, outputPath) || isWithin(researchRealPath, output)
  if (input === output || outputIsResearchPath)
    throw cliError('KGSE_E_OUTPUT_UNSAFE', 'unsafe output path.')
  if (outputIsLogicalRepositoryPath && !outputIsLogicalTemporaryPath)
    throw cliError('KGSE_E_OUTPUT_UNSAFE', 'unsafe output path.')
  if (outputIsLogicalTemporaryPath || outputIsRepositoryPath) {
    const temporaryRealPath = await realpath(temporaryOutputRoot)
    if (!isWithin(temporaryRealPath, output))
      throw cliError('KGSE_E_OUTPUT_UNSAFE', 'unsafe output path.')
  }
  return { input, output }
}

function parseDataset(inputBytes) {
  try {
    return validateDataset(JSON.parse(inputBytes.toString('utf8')))
  } catch {
    throw cliError('KGSE_E_DATASET', 'invalid evaluation dataset.')
  }
}

export async function run(argumentsList) {
  const paths = parseArguments(argumentsList)
  const { input, output } = await resolvePaths(paths.input, paths.output)
  if (await exists(output))
    throw cliError('KGSE_E_OUTPUT_EXISTS', 'output already exists.')
  const inputBytes = await readBounded(input)
  const dataset = parseDataset(inputBytes)
  const calculator = await loadSeatedCalculator()
  try {
    const report = evaluateRecords(
      dataset,
      calculator.calculateMetrics,
      calculator.methodVersion,
      sha256(inputBytes)
    )
    try {
      await writeFile(output, `${JSON.stringify(report, null, 2)}\n`, {
        encoding: 'utf8',
        flag: 'wx'
      })
    } catch (error) {
      if (error?.code === 'EEXIST')
        throw cliError('KGSE_E_OUTPUT_EXISTS', 'output already exists.')
      throw cliError('KGSE_E_OUTPUT_WRITE', 'unable to write output.')
    }
    return report
  } finally {
    await calculator.close()
  }
}

function cliMessage(error) {
  return error instanceof CliError
    ? error.message
    : 'KGSE_E_EVALUATION: evaluation could not be completed.'
}

if (import.meta.main) {
  run(process.argv.slice(2)).then(
    (report) =>
      process.stdout.write(
        `seated evaluation: frames=${report.coverage.totalFrames} valid=${report.coverage.validFrames} abstained=${report.coverage.abstainedFrames}\n`
      ),
    (error) => {
      process.stderr.write(`${cliMessage(error)}\n`)
      process.exitCode = 1
    }
  )
}
