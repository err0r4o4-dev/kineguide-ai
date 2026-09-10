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
  sessionActivitySlug: (session: {
    activity_slug?: string
    exercise_slug: string
  }) => session.activity_slug ?? session.exercise_slug,
  getDashboard: vi.fn().mockResolvedValue({
    completed_sessions: 3,
    current_streak: 2,
    total_seconds: 180,
    recent_sessions: [
      {
        id: '00000000-0000-4000-8000-000000000001',
        exercise_slug: 'sit-to-stand-demo',
        status: 'completed',
        camera_used: false,
        manual_repetitions: 4,
        elapsed_seconds: 60,
        started_at: '2026-08-27T08:30:00Z',
        completed_at: '2026-08-27T08:31:00Z',
        retention_until: '2027-08-27T08:31:00Z'
      }
    ]
  })
}))

describe('DashboardPage', () => {
  it('presents the supplied dashboard hierarchy with usable range controls', async () => {
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
      await screen.findByRole('img', {
        name: 'ภาพประกอบการสาธิตลุกนั่งจากเก้าอี้'
      })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'เริ่มกิจกรรม' })).toHaveAttribute(
      'href',
      '/app/activities'
    )
    expect(screen.getByRole('link', { name: 'เริ่มคุยกับ AI' })).toHaveClass(
      '!text-kg-primary'
    )
    expect(
      await screen.findByRole('group', { name: 'สรุปกิจกรรม' })
    ).toHaveTextContent('3')
    expect(
      screen.getByRole('heading', { name: 'กิจกรรมล่าสุด' })
    ).toBeInTheDocument()
    expect(screen.getAllByText('การลุกนั่งจากเก้าอี้')).toHaveLength(2)
    expect(
      screen.getByText(
        'ตัวเลขทั้งหมดเป็นข้อมูลกิจกรรมที่บันทึกเอง ไม่ใช่ผลการประเมินการฟื้นตัว'
      )
    ).toBeInTheDocument()
  })
})
