import { createRoot } from 'react-dom/client'

import { BaselineReadings } from '../../src/features/pose/BaselineReadings'
import { buildPersonalBaseline } from '../../src/features/pose/seatedCalibration'
import type { RawSeatedMetrics } from '../../src/features/pose/seatedMetrics'
import i18n from '../../src/lib/i18n'
import '../../src/styles/index.css'

const parameters = new URLSearchParams(window.location.search)
await i18n.changeLanguage(parameters.get('language') ?? 'th')
const metrics: RawSeatedMetrics = {
  headTiltDegrees: 3,
  shoulderSlopeDegrees: -2,
  torsoInclinationDegrees: null,
  eyeShoulderDistanceRatio: 0.8,
  forwardHeadRatio: 0.2,
  shoulderWidth: 0.2,
  framingMode: 'upper_body'
}
const baseline = buildPersonalBaseline(Array(30).fill(metrics), 1000)!
createRoot(document.getElementById('root')!).render(
  <main className="mx-auto max-w-sm p-5">
    <BaselineReadings
      baseline={baseline}
      metrics={
        parameters.has('unavailable')
          ? null
          : { ...metrics, headTiltDegrees: -7 }
      }
    />
  </main>
)
