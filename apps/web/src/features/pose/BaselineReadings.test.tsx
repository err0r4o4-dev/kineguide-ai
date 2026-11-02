import { render, screen, within } from '@testing-library/react'

import i18n from '@/lib/i18n'
import { BaselineReadings } from './BaselineReadings'
import { buildPersonalBaseline } from './seatedCalibration'
import type { RawSeatedMetrics } from './seatedMetrics'

const metrics: RawSeatedMetrics = {
  shoulderSlopeDegrees: -2,
  headTiltDegrees: 3,
  torsoInclinationDegrees: null,
  eyeShoulderDistanceRatio: 0.8,
  forwardHeadRatio: 0.2,
  shoulderWidth: 0.2,
  framingMode: 'upper_body'
}
const baseline = buildPersonalBaseline(Array(30).fill(metrics), 1000)!

describe('BaselineReadings', () => {
  it('shows current, baseline and absolute differences with metric-specific units', async () => {
    await i18n.changeLanguage('en')
    render(
      <BaselineReadings
        baseline={baseline}
        metrics={{ ...metrics, headTiltDegrees: -7, forwardHeadRatio: 0.25 }}
      />
    )
    const head = within(screen.getByRole('group', { name: 'Head tilt' }))
    expect(head.getByText('-7.0°')).toBeVisible()
    expect(head.getByText('3.0°')).toBeVisible()
    expect(head.getByText('10.0°')).toBeVisible()
    const ratio = within(
      screen.getByRole('group', { name: 'Eye-width / shoulder-width ratio' })
    )
    expect(ratio.getByText('0.250')).toBeVisible()
    expect(ratio.getByText('0.200')).toBeVisible()
    expect(ratio.getByText('0.050')).toBeVisible()
    const torso = within(
      screen.getByRole('group', { name: 'Torso inclination' })
    )
    expect(torso.getAllByText('Unable to assess')).toHaveLength(3)
    expect(
      screen.getByText(/not camera accuracy or ground-truth measurement error/)
    ).toBeVisible()
    expect(screen.getByText(/normalized 2D image coordinates/)).toBeVisible()
  })

  it('replaces all readings rather than showing zero or stale values when unavailable', async () => {
    await i18n.changeLanguage('th')
    const { rerender } = render(
      <BaselineReadings baseline={baseline} metrics={metrics} />
    )
    rerender(<BaselineReadings baseline={baseline} metrics={null} />)
    expect(
      screen.getByText(
        'ยังประเมินไม่ได้ — รอข้อมูลที่เชื่อถือได้และ Baseline ที่ใช้ได้'
      )
    ).toBeVisible()
    expect(
      screen.queryByRole('group', { name: 'มุมเอียงศีรษะ' })
    ).not.toBeInTheDocument()
    expect(screen.queryByText('0.0°')).not.toBeInTheDocument()
  })
})
