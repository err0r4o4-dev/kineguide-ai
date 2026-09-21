import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'

import i18n from '@/lib/i18n'
import { CalibrationPage } from './CalibrationPage'

describe('CalibrationPage', () => {
  it('does not simulate a captured baseline before calibration exists', async () => {
    await i18n.changeLanguage('th')
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/app/monitor/calibration']}>
        <Routes>
          <Route
            element={<CalibrationPage />}
            path="/app/monitor/calibration"
          />
          <Route element={<h1>Camera setup</h1>} path="/app/monitor" />
        </Routes>
      </MemoryRouter>
    )

    expect(
      screen.getByRole('heading', { name: 'การปรับเทียบยังไม่พร้อมใช้งาน' })
    ).toBeVisible()
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'ยังไม่มี Baseline ที่ผ่านการตรวจสอบ'
      })
    ).toBeVisible()
    expect(
      screen.queryByText('บันทึกค่า Baseline สำเร็จ')
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'กลับไปตั้งค่ากล้อง' }))
    expect(
      await screen.findByRole('heading', { name: 'Camera setup' })
    ).toBeVisible()
  })
})
