export const minimumLoadingDurationMs = 1_500
export const loadingCompletionPauseMs = 250

export async function withMinimumLoadingDuration<T>(
  operation: Promise<T>,
  durationMs = minimumLoadingDurationMs
) {
  const minimumDuration = new Promise<void>((resolve) => {
    window.setTimeout(resolve, durationMs)
  })
  const [result] = await Promise.all([operation, minimumDuration])
  return result
}

export function waitForLoadingCompletion() {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, loadingCompletionPauseMs)
  })
}
