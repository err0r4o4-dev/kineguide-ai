const productionPoseSources = import.meta.glob('./*.{ts,tsx}', {
  eager: true,
  import: 'default',
  query: '?raw'
}) as Record<string, string>

const nonTestSources = Object.entries(productionPoseSources).filter(
  ([path]) => !path.includes('.test.')
)

describe('pose safety boundaries', () => {
  it('does not ship unreviewed correctness or browser-persisted reference paths', () => {
    const sourceByPath = Object.fromEntries(nonTestSources)
    const combinedSource = nonTestSources.map(([, source]) => source).join('\n')

    expect(Object.keys(sourceByPath)).not.toEqual(
      expect.arrayContaining([
        './realTimePoseComparator.ts',
        './referenceMovementModel.ts',
        './referenceVideoProcessor.ts'
      ])
    )
    expect(combinedSource).not.toMatch(
      /evaluateMovementAgainstReference|jointErrors|mock_thresholds/
    )
    expect(combinedSource).not.toMatch(
      /saveReferenceModelToStorage|loadReferenceModelFromStorage|localStorage/
    )
  })
})
