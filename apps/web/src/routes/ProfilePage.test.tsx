import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, vi } from 'vitest'

import { AuthContext, type AuthContextValue } from '@/features/auth/AuthContext'
import i18n from '@/lib/i18n'
import * as product from '@/services/product'
import { ProfilePage } from './ProfilePage'

vi.mock('@/services/product', async () => {
  const actual = await vi.importActual<typeof product>('@/services/product')
  return {
    ...actual,
    deleteHealthProfile: vi.fn(),
    getHealthProfile: vi.fn(),
    getCurrentUser: vi.fn()
  }
})

const auth: AuthContextValue = {
  user: {
    id: '00000000-0000-4000-8000-000000000001',
    display_name: 'Thirawat Duangta',
    email: 'title.thirawat.dev@gmail.com',
    created_at: '2026-08-25T15:34:00Z'
  },
  ready: true,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  clearSession: vi.fn()
}

const profile: product.HealthProfile = {
  id: '00000000-0000-4000-8000-000000000002',
  birth_date: '2006-01-01',
  sex: 'male',
  height_cm: 172,
  weight_kg: 58,
  track_weight: true,
  care_areas: ['lower_back'],
  recent_injury: false,
  clinician_managed: false,
  assistive_device: 'none',
  warning_signs: ['none'],
  goals: ['strength', 'daily_activity', 'flexibility'],
  activity_level: 'regular',
  preferred_time: 'morning',
  equipment: ['chair'],
  camera_preference: 'front',
  activity_notifications: true,
  notes: '',
  status: 'captured_not_evaluated',
  consent_version: 'health-profile-v1',
  consented_at: '2026-08-25T15:34:00Z',
  created_at: '2026-08-25T15:34:00Z',
  updated_at: '2026-08-27T09:00:00Z',
  retention_until: '2027-08-25T15:34:00Z'
}

describe('ProfilePage', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    await i18n.changeLanguage('th')
    vi.mocked(product.getHealthProfile).mockResolvedValue(profile)
    vi.mocked(product.getCurrentUser).mockResolvedValue(auth.user!)
  })

  it('presents the supplied profile hierarchy using stored account and health data', async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
    })

    render(
      <QueryClientProvider client={client}>
        <AuthContext.Provider value={auth}>
          <MemoryRouter initialEntries={['/app/profile']}>
            <ProfilePage />
          </MemoryRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    )

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'โปรไฟล์สุขภาพ'
      })
    ).toBeInTheDocument()
    expect(await screen.findByText('Thirawat Duangta')).toBeVisible()
    expect(product.getCurrentUser).toHaveBeenCalledTimes(1)
    expect(screen.getByText('title.thirawat.dev@gmail.com')).toBeVisible()
    expect(screen.getByRole('link', { name: 'แก้ไขข้อมูล' })).toHaveAttribute(
      'href',
      '/onboarding'
    )

    expect(
      screen.getByRole('heading', { name: 'ข้อมูลร่างกาย' })
    ).toBeInTheDocument()
    expect(screen.getByText('172 ซม.')).toBeVisible()
    expect(screen.getByText('58 กก.')).toBeVisible()
    expect(screen.getByText('20 ปี')).toBeVisible()
    expect(screen.getByText('19.6')).toBeVisible()

    expect(
      screen.getByRole('heading', { name: 'เป้าหมายของฉัน' })
    ).toBeInTheDocument()
    expect(screen.getByText('เพิ่มความแข็งแรง')).toBeVisible()
    expect(
      screen.getByRole('heading', {
        name: 'ข้อจำกัดและบริบทการเคลื่อนไหว'
      })
    ).toBeInTheDocument()
    expect(screen.getByText('หลังส่วนล่าง')).toBeVisible()
    expect(screen.getByText('ไม่ได้รายงานอุปกรณ์ช่วยเดิน')).toBeVisible()

    expect(
      screen.getByRole('heading', { name: 'ข้อมูลความปลอดภัย' })
    ).toBeInTheDocument()
    expect(
      screen.getByText('คุณรายงานว่าไม่มีข้อมูลอาการเตือนในแบบฟอร์มล่าสุด')
    ).toBeVisible()
    expect(
      screen.getByRole('heading', { name: 'การใช้ข้อมูล' })
    ).toBeInTheDocument()
    expect(screen.getByText(/ยังไม่ใช้เลือกหรือปรับแผนกิจกรรม/)).toBeVisible()
    expect(
      screen.getByRole('heading', { name: 'ข้อมูลน้ำหนักล่าสุด' })
    ).toBeInTheDocument()
    expect(screen.getByText(/ยังไม่มีประวัติแนวโน้มน้ำหนัก/)).toBeVisible()
    expect(
      screen.getByRole('button', { name: 'ลบโปรไฟล์สุขภาพ' })
    ).toBeEnabled()
    expect(
      screen.getByRole('link', { name: 'ทบทวนแบบประเมินเบื้องต้น' })
    ).toHaveAttribute('href', '/app/assessment')
  })
})
