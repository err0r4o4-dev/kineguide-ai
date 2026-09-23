import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { vi } from 'vitest'

import i18n from '@/lib/i18n'
import { DashboardPage } from './DashboardPage'

vi.mock('@/features/auth/AuthContext', () => ({
  useAuth: () => ({ user: { display_name: 'Thirawat Duangta' } })
}))

vi.mock('@/services/product', () => ({
  getDashboard: vi.fn().mockResolvedValue({
    completed_sessions: 3,
    current_streak: 2,
    total_seconds: 180,
    recent_sessions: [
      {
        id: '00000000-0000-4000-8000-000000000001',
        status: 'completed',
        metrics: {
          duration_seconds: 60
        },
        started_at: '2026-08-27T08:30:00Z',
        completed_at: '2026-08-27T08:31:00Z',
        retention_until: '2027-08-27T08:31:00Z'
      }
    ]
  })
}))

describe('DashboardPage', () => {
  it('presents the Posture Monitoring activity and history hierarchy', async () => {
    await i18n.changeLanguage('th')
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    })

    render(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'สวัสดี Thirawat Duangta'
      })
    ).toBeInTheDocument()
    expect(screen.getByText(/อัปเดตล่าสุด/)).toBeVisible()

    expect(
      await screen.findByRole('link', { name: /เริ่มตรวจท่าทาง/ })
    ).toHaveAttribute('href', '/app/monitor')
    expect(
      screen.getByRole('link', { name: 'เริ่มคุยกับ AI' })
    ).toHaveAttribute('href', '/app/chat')
    expect(
      await screen.findByRole('group', { name: 'สรุปการใช้งาน' })
    ).toHaveTextContent('3')
    expect(
      screen.getByRole('heading', { name: 'ประวัติล่าสุด' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'ดูประวัติทั้งหมด' })
    ).toHaveAttribute('href', '/app/history')
    expect(
      screen.getByRole('heading', { name: 'เริ่มติดตามท่าทาง' })
    ).toBeInTheDocument()
    expect(
      screen.getByText('สถิติเหล่านี้เป็นข้อมูลการใช้งาน ไม่ใช่ผลการวินิจฉัย')
    ).toBeInTheDocument()
  })
})
