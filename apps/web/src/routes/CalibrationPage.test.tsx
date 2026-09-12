import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { vi } from 'vitest'

import i18n from '@/lib/i18n'
import { CalibrationPage } from './CalibrationPage'

describe('CalibrationPage', () => {
  it('flows through calibration states', async () => {
    await i18n.changeLanguage('th')
    vi.useFakeTimers()
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

    render(
      <MemoryRouter initialEntries={['/app/monitor/calibration']}>
        <Routes>
          <Route element={<CalibrationPage />} path="/app/monitor/calibration" />
          <Route element={<h1>Live Monitoring</h1>} path="/app/monitor/live" />
        </Routes>
      </MemoryRouter>
    )

    // Initial state
    const startBtn = screen.getByRole('button', { name: 'ปรับเทียบท่าทาง (Calibration)' })
    expect(startBtn).toBeVisible()

    // Start countdown
    await user.click(startBtn)
    expect(screen.getByText('3')).toBeVisible()

    // Advance to capturing
    vi.advanceTimersByTime(3500)
    expect(await screen.findByText('กำลังบันทึก Baseline...')).toBeVisible()

    // Advance to complete
    vi.advanceTimersByTime(2500)
    expect(await screen.findByText('บันทึกค่า Baseline สำเร็จ')).toBeVisible()

    // Navigate to live session
    const proceedBtn = screen.getByRole('button', { name: 'เริ่มตรวจท่าทาง' })
    await user.click(proceedBtn)

    expect(await screen.findByRole('heading', { name: 'Live Monitoring' })).toBeInTheDocument()

    vi.useRealTimers()
  })
})
