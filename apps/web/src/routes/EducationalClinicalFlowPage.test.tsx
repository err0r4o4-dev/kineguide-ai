import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import '@/lib/i18n'
import i18n from '@/lib/i18n'
import * as product from '@/services/product'
import { EducationalClinicalFlowPage } from './EducationalClinicalFlowPage'

vi.mock('@/services/product', async () => {
  const actual = await vi.importActual<typeof product>('@/services/product')
  return {
    ...actual,
    evaluateEducationalScreening: vi.fn(),
    getEducationalClinicalCatalog: vi.fn()
  }
})

const metadata = {
  id: 'demo-screening-placeholder-v1',
  version: '1.0.0',
  locale: 'th' as const,
  reviewStatus: 'pending_clinical_review' as const,
  demoOnly: true as const,
  notForClinicalUse: true as const,
  reviewedBy: null,
  reviewedAt: null,
  sourceReferences: [],
  lastUpdatedAt: '2026-08-31T00:00:00Z'
}

describe('EducationalClinicalFlowPage', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    await i18n.changeLanguage('th')
    vi.mocked(product.getEducationalClinicalCatalog).mockResolvedValue({
      reviewWorkflow: [
        'draft',
        'pending_clinical_review',
        'approved',
        'rejected',
        'archived'
      ],
      screeningQuestions: [
        {
          ...metadata,
          prompt: 'คำถามคัดกรองสาธิต ไม่ใช่การคัดกรองทางคลินิก',
          options: [
            { id: 'demo-stop-selected', label: 'จำลองการหยุด flow' },
            { id: 'demo-continue-selected', label: 'ดำเนินการสาธิต' }
          ]
        }
      ],
      redFlags: [],
      exercises: [],
      contraindications: [],
      stopConditions: [],
      clinicalReferences: []
    })
  })

  it('shows the Thai prototype disclaimer and pending-review boundary', async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    })
    render(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <EducationalClinicalFlowPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(
      await screen.findByText(
        'ฟีเจอร์นี้เป็นต้นแบบเพื่อการศึกษา ข้อมูลท่าและขั้นตอนคัดกรองยังอยู่ระหว่างการตรวจสอบโดยผู้เชี่ยวชาญ และไม่ใช้แทนคำแนะนำจากแพทย์หรือนักกายภาพบำบัด'
      )
    ).toBeInTheDocument()
    expect(screen.getByText('รอตรวจสอบโดยผู้เชี่ยวชาญ')).toBeInTheDocument()
    expect(screen.queryByText('เหมาะสำหรับอาการของคุณ')).not.toBeInTheDocument()
  })

  it('stops the demo when the placeholder stop option is selected', async () => {
    vi.mocked(product.evaluateEducationalScreening).mockResolvedValue({
      outcome: 'stopped_demo_placeholder',
      message: 'ระบบหยุด flow จาก placeholder สาธิต',
      demoOnly: true,
      notForClinicalUse: true,
      exercises: []
    })
    const user = userEvent.setup()
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
    })
    render(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <EducationalClinicalFlowPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    await user.click(await screen.findByLabelText('จำลองการหยุด flow'))
    await user.click(screen.getByRole('button', { name: 'ตรวจสอบ flow สาธิต' }))

    expect(
      await screen.findByRole('alert', { name: 'หยุดการสาธิต' })
    ).toBeInTheDocument()
  })
})
