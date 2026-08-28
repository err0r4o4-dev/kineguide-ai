import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import '@/lib/i18n'
import i18n from '@/lib/i18n'
import * as product from '@/services/product'
import { HealthProfileOnboardingPage } from './HealthProfileOnboardingPage'

vi.mock('@/services/product', async () => {
  const actual = await vi.importActual<typeof product>('@/services/product')
  return {
    ...actual,
    getHealthProfile: vi.fn(),
    saveHealthProfile: vi.fn()
  }
})

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/onboarding']}>
        <Routes>
          <Route path="/onboarding" element={<HealthProfileOnboardingPage />} />
          <Route path="/app" element={<h1>แดชบอร์ด</h1>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

const savedProfile: product.HealthProfile = {
  id: '9bf18b6e-7ec4-44d3-bdd5-9f259d3f74d0',
  birth_date: '2000-01-02',
  sex: 'unspecified',
  height_cm: 170,
  weight_kg: 60,
  track_weight: true,
  care_areas: ['general_mobility'],
  recent_injury: false,
  clinician_managed: false,
  assistive_device: 'none',
  warning_signs: ['none'],
  goals: ['strength'],
  activity_level: 'moderate',
  preferred_time: 'morning',
  equipment: ['none'],
  camera_preference: 'front',
  activity_notifications: true,
  notes: '',
  status: 'captured_not_evaluated',
  consent_version: 'health-profile-v1',
  consented_at: '2026-08-28T09:00:00Z',
  created_at: '2026-08-28T09:00:00Z',
  updated_at: '2026-08-28T09:00:00Z',
  retention_until: '2027-08-28T09:00:00Z'
}

describe('HealthProfileOnboardingPage', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    await i18n.changeLanguage('th')
    vi.mocked(product.getHealthProfile).mockResolvedValue(null)
    vi.mocked(product.saveHealthProfile).mockResolvedValue(savedProfile)
  })

  it('collects every required section before opening the app', async () => {
    const user = userEvent.setup()
    renderPage()

    expect(
      await screen.findByRole('heading', { name: 'ตั้งค่าโปรไฟล์สุขภาพ' })
    ).toBeInTheDocument()

    await user.type(screen.getByLabelText('วัน เดือน ปีเกิด'), '2000-01-02')
    await user.click(screen.getByRole('radio', { name: 'ไม่ประสงค์ระบุ' }))
    await user.type(screen.getByLabelText(/ส่วนสูง/), '170')
    await user.type(screen.getByLabelText(/น้ำหนักปัจจุบัน/), '60')
    await user.click(
      screen.getByRole('checkbox', {
        name: /บันทึกน้ำหนักนี้ไว้ในโปรไฟล์/
      })
    )
    await user.click(screen.getByRole('button', { name: 'ดำเนินการต่อ' }))

    await user.click(
      screen.getByRole('checkbox', { name: 'การเคลื่อนไหวทั่วไป' })
    )
    const noAnswers = screen.getAllByRole('radio', { name: 'ไม่ใช่' })
    await user.click(noAnswers[0])
    await user.click(noAnswers[1])
    await user.selectOptions(
      screen.getByLabelText('ใช้อุปกรณ์ช่วยเดินหรือไม่'),
      'none'
    )
    await user.click(screen.getByRole('checkbox', { name: 'ไม่มี' }))
    await user.click(screen.getByRole('button', { name: 'ดำเนินการต่อ' }))

    await user.click(screen.getByRole('checkbox', { name: 'เพิ่มความแข็งแรง' }))
    await user.click(screen.getByRole('radio', { name: 'ปานกลาง' }))
    await user.click(screen.getByRole('radio', { name: 'เช้า' }))
    await user.click(screen.getByRole('checkbox', { name: 'ไม่มี' }))
    await user.click(
      screen.getByRole('radio', {
        name: 'กล้องหน้า — ตั้งอุปกรณ์ไว้ด้านหน้า'
      })
    )
    await user.click(screen.getByRole('button', { name: 'ตรวจสอบข้อมูล' }))

    await user.click(
      screen.getByRole('checkbox', {
        name: /ฉันยินยอมให้จัดเก็บข้อมูลโปรไฟล์สุขภาพ/
      })
    )
    await user.click(
      screen.getByRole('checkbox', {
        name: /ฉันเข้าใจว่าข้อมูลนี้ไม่ผ่านการวินิจฉัย/
      })
    )
    await user.click(
      screen.getByRole('checkbox', { name: /การแจ้งเตือนกิจกรรม/ })
    )
    await user.click(screen.getByRole('button', { name: 'บันทึกโปรไฟล์' }))

    expect(
      await screen.findByRole('heading', { name: 'แดชบอร์ด' })
    ).toBeInTheDocument()
    expect(product.saveHealthProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        birth_date: '2000-01-02',
        sex: 'unspecified',
        height_cm: 170,
        weight_kg: 60,
        care_areas: ['general_mobility'],
        recent_injury: false,
        clinician_managed: false,
        warning_signs: ['none'],
        goals: ['strength'],
        equipment: ['none'],
        activity_notifications: true,
        profile_storage_consent: true
      })
    )
  })
})
