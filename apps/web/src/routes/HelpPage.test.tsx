import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

import i18n from '@/lib/i18n'
import { HelpPage } from './HelpPage'

describe('HelpPage', () => {
  it('renders ergonomic setup, posture status guide, reminder guide, and safety boundaries in Thai', async () => {
    await i18n.changeLanguage('th')
    render(
      <MemoryRouter>
        <HelpPage />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'คู่มือการใช้งานและสรีรศาสตร์'
      })
    ).toBeVisible()
    expect(
      screen.getByRole('heading', {
        name: 'การจัดมุมกล้องและโต๊ะทำงานเบื้องต้น'
      })
    ).toBeVisible()
    expect(
      screen.getByRole('heading', { name: 'ความหมายของสถานะการตรวจจับ' })
    ).toBeVisible()
    expect(screen.getByText('อยู่ในแนวอ้างอิง (Good alignment)')).toBeVisible()
    expect(
      screen.getByText('ควรขยับปรับท่านั่ง (Needs adjustment)')
    ).toBeVisible()
    expect(
      screen.getByText(
        'ความเชื่อมั่นต่ำ / ประเมินไม่ได้ (Low confidence / Unable to assess)'
      )
    ).toBeVisible()
    expect(
      screen.getByRole('link', { name: 'ไปหน้าตรวจความพร้อมของกล้อง' })
    ).toHaveAttribute('href', '/app/monitor')
    expect(
      screen.getByRole('link', { name: 'ตั้งค่าเสียงและการแจ้งเตือน' })
    ).toHaveAttribute('href', '/app/settings')
  })

  it('renders matching English copy when switched to English', async () => {
    await i18n.changeLanguage('en')
    render(
      <MemoryRouter>
        <HelpPage />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Ergonomic & Usage Guide'
      })
    ).toBeVisible()
    expect(
      screen.getByRole('heading', {
        name: 'Camera framing and workstation setup'
      })
    ).toBeVisible()
    expect(
      screen.getByRole('heading', {
        name: 'Meaning of monitoring states'
      })
    ).toBeVisible()
    expect(
      screen.getByRole('heading', { name: 'Start a seated session' })
    ).toBeVisible()
    const question = screen.getByText('Can monitoring continue in another tab?')
    fireEvent.click(question)
    expect(question.closest('details')).toHaveAttribute('open')
    expect(
      screen.getByRole('link', { name: 'Open camera setup check' })
    ).toHaveAttribute('href', '/app/monitor')
  })
})
