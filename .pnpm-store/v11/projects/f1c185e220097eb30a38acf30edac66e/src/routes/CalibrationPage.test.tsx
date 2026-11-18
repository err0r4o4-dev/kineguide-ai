import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'

import i18n from '@/lib/i18n'
import { CalibrationPage } from './CalibrationPage'

describe('CalibrationPage', () => {
  it('does not simulate a captured baseline before calibration exists', async () => {
    await i18n.changeLanguage('th')

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
      await screen.findByRole('heading', { name: 'Camera setup' })
    ).toBeVisible()
  })
})
