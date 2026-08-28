import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import '@/lib/i18n'
import * as product from '@/services/product'
import { HealthProfileRoute } from './HealthProfileRoute'

vi.mock('@/services/product', async () => {
  const actual = await vi.importActual<typeof product>('@/services/product')
  return { ...actual, getHealthProfile: vi.fn() }
})

function renderRoute() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/app']}>
        <Routes>
          <Route element={<HealthProfileRoute />}>
            <Route path="/app" element={<h1>แดชบอร์ด</h1>} />
          </Route>
          <Route path="/onboarding" element={<h1>ตั้งค่าโปรไฟล์สุขภาพ</h1>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

const profile: product.HealthProfile = {
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
  activity_notifications: false,
  notes: '',
  status: 'captured_not_evaluated',
  consent_version: 'health-profile-v1',
  consented_at: '2026-08-28T09:00:00Z',
  created_at: '2026-08-28T09:00:00Z',
  updated_at: '2026-08-28T09:00:00Z',
  retention_until: '2027-08-28T09:00:00Z'
}

describe('HealthProfileRoute', () => {
  beforeEach(() => vi.clearAllMocks())

  it('redirects a first-login account to onboarding', async () => {
    vi.mocked(product.getHealthProfile).mockResolvedValue(null)
    renderRoute()
    expect(
      await screen.findByRole('heading', { name: 'ตั้งค่าโปรไฟล์สุขภาพ' })
    ).toBeInTheDocument()
  })

  it('renders the app after a profile exists', async () => {
    vi.mocked(product.getHealthProfile).mockResolvedValue(profile)
    renderRoute()
    expect(
      await screen.findByRole('heading', { name: 'แดชบอร์ด' })
    ).toBeInTheDocument()
  })

  it('shows a retryable error when profile status is unavailable', async () => {
    vi.mocked(product.getHealthProfile).mockRejectedValue(
      new Error('unavailable')
    )
    renderRoute()
    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ลองอีกครั้ง' })).toBeEnabled()
  })
})
