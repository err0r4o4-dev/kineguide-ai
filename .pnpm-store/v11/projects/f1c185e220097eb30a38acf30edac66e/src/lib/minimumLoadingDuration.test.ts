import { expect, it, vi } from 'vitest'

import { withMinimumLoadingDuration } from './minimumLoadingDuration'

it('keeps a completed operation loading for at least 1.5 seconds', async () => {
  vi.useFakeTimers()
  const operation = withMinimumLoadingDuration(Promise.resolve('ready'))
  let settled = false
  void operation.then(() => {
    settled = true
  })

  await vi.advanceTimersByTimeAsync(1499)
  expect(settled).toBe(false)
  await vi.advanceTimersByTimeAsync(1)
  await expect(operation).resolves.toBe('ready')
  vi.useRealTimers()
})
