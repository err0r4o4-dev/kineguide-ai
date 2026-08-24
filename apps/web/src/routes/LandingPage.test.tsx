import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

import '@/lib/i18n'
import { LandingPage } from './LandingPage'

describe('LandingPage', () => {
  it('explains the camera boundary before sign in', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'สำรวจการเคลื่อนไหว'
    )
    expect(screen.getByText(/ไม่อัปโหลดรูปหรือวิดีโอ/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'เริ่มใช้งาน' })).toHaveAttribute(
      'href',
      '/register'
    )
  })
})
