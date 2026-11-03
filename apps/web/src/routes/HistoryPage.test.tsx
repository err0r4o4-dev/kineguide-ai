import {
  onlineManager,
  QueryClient,
  QueryClientProvider
} from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { vi } from 'vitest'

import i18n from '@/lib/i18n'
import { http } from '@/services/http'
import type { SessionResponse } from '@/services/product'
import { HistoryPage } from './HistoryPage'

function session(
  index: number,
  overrides: Partial<SessionResponse> = {}
): SessionResponse {
  return {
    id: `session-${index}`,
    status: 'completed',
    manual_cycles: 0,
    elapsed_seconds: 125,
    posture_summary: null,
    started_at: new Date(Date.now() - index * 60_000).toISOString(),
    completed_at: new Date(Date.now()).toISOString(),
    retention_until: '2027-11-02T00:00:00Z',
    ...overrides
  }
}

function renderHistory(
  sessions = [session(1), session(2)],
  entry = '/app/history',
  failFirst = false
) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  const request = vi.spyOn(http, 'get').mockImplementation(async (url) => {
    if (url === '/sessions') return { data: { sessions } }
    if (url === '/dashboard')
      return {
        data: {
          completed_sessions: 2,
          total_seconds: 250,
          current_streak: 1,
          recent_sessions: []
        }
      }
    throw new Error('Unexpected test request')
  })
  if (failFirst)
    request.mockRejectedValueOnce(new Error('Synthetic unavailable API'))
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[entry]}>
        <Routes>
          <Route path="/app/history" element={<HistoryPage />} />
          <Route
            path="/app/monitor/summary/:id"
            element={<h1>Session detail</h1>}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
  return { request, client }
}

beforeEach(async () => {
  await i18n.changeLanguage('th')
})
afterEach(() => {
  vi.restoreAllMocks()
})

describe('HistoryPage', () => {
  it('renders a dedicated history heading instead of analytics', async () => {
    const { request } = renderHistory()
    expect(
      await screen.findByRole('heading', { name: 'ประวัติเซสชัน', level: 1 })
    ).toBeVisible()
    await screen.findByRole('textbox', { name: 'ค้นหาประวัติ' })
    expect(request).toHaveBeenCalledWith(
      '/sessions',
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    )
    expect(request).not.toHaveBeenCalledWith('/dashboard', expect.anything())
  })

  it('searches the stored session identifier rather than a constant title', async () => {
    const user = userEvent.setup()
    renderHistory()
    await user.type(
      await screen.findByRole('textbox', { name: 'ค้นหาประวัติ' }),
      ' SESSION-2 '
    )
    expect(
      screen
        .getAllByRole('link')
        .filter((link) => link.getAttribute('href')?.includes('/summary/'))
    ).toHaveLength(1)
    expect(screen.getByRole('link', { name: /session-2/ })).toHaveAttribute(
      'href',
      '/app/monitor/summary/session-2'
    )
    await user.click(screen.getByRole('link', { name: /session-2/ }))
    expect(
      screen.getByRole('heading', { name: 'Session detail' })
    ).toBeVisible()
  })

  it('shows saved duration and all three statuses as text', async () => {
    renderHistory([
      session(1),
      session(2, { status: 'active' }),
      session(3, { status: 'stopped' })
    ])
    const records = await screen.findByRole('region', { name: 'รายการเซสชัน' })
    expect(
      within(records).getByText('เสร็จสิ้น', { selector: 'span' })
    ).toBeVisible()
    expect(
      within(records).getByText('ยังไม่จบเซสชัน', { selector: 'span' })
    ).toBeVisible()
    expect(
      within(records).getByText('หยุดก่อนเสร็จ', { selector: 'span' })
    ).toBeVisible()
    expect(within(records).getAllByText('เวลาที่บันทึก 2:05')).toHaveLength(3)
  })

  it('filters by status and distinguishes no matches from no history', async () => {
    const user = userEvent.setup()
    renderHistory([session(1), session(2, { status: 'active' })])
    await user.selectOptions(
      await screen.findByRole('combobox', { name: 'สถานะเซสชัน' }),
      'active'
    )
    expect(screen.getByRole('link', { name: /session-2/ })).toBeVisible()
    expect(
      screen.queryByRole('link', { name: /session-1/ })
    ).not.toBeInTheDocument()
    await user.type(
      screen.getByRole('textbox', { name: 'ค้นหาประวัติ' }),
      'missing-record'
    )
    expect(
      screen.getByText('ไม่พบเซสชันที่ตรงกับการค้นหาหรือตัวกรอง')
    ).toBeVisible()
    expect(screen.queryByText('ยังไม่มีประวัติ')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'ล้างตัวกรอง' }))
    expect(screen.getByRole('textbox')).toHaveValue('')
    expect(screen.getByRole('combobox', { name: 'สถานะเซสชัน' })).toHaveValue(
      'all'
    )
    expect(screen.getByRole('link', { name: /session-1/ })).toBeVisible()
  })

  it('sorts newest first, paginates ten at a time, and resets the page after filtering', async () => {
    const user = userEvent.setup()
    renderHistory(
      Array.from({ length: 15 }, (_, index) => session(index)).reverse()
    )
    const records = await screen.findByRole('region', { name: 'รายการเซสชัน' })
    const links = within(records).getAllByRole('link')
    expect(links).toHaveLength(10)
    expect(links[0]).toHaveAttribute('href', '/app/monitor/summary/session-0')
    expect(screen.getByRole('button', { name: 'หน้าก่อนหน้า' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'หน้าถัดไป' }))
    expect(within(records).getAllByRole('link')).toHaveLength(5)
    expect(screen.getByText('หน้า 2 จาก 2')).toBeVisible()
    expect(screen.getByRole('button', { name: 'หน้าถัดไป' })).toBeDisabled()
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'ช่วงเวลา' }),
      '7'
    )
    expect(screen.getByText('หน้า 1 จาก 2')).toBeVisible()
  })

  it('includes the first local calendar day of a range and excludes the previous day', async () => {
    const user = userEvent.setup()
    const now = new Date(2026, 10, 2, 12)
    vi.spyOn(Date, 'now').mockReturnValue(now.getTime())
    const boundary = new Date(2026, 9, 27)
    renderHistory([
      session(1, { started_at: boundary.toISOString() }),
      session(2, { started_at: new Date(boundary.getTime() - 1).toISOString() })
    ])
    await user.selectOptions(
      await screen.findByRole('combobox', { name: 'ช่วงเวลา' }),
      '7'
    )
    expect(screen.getByRole('link', { name: /session-1/ })).toBeVisible()
    expect(
      screen.queryByRole('link', { name: /session-2/ })
    ).not.toBeInTheDocument()
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'ช่วงเวลา' }),
      'all'
    )
    expect(screen.getByRole('link', { name: /session-2/ })).toBeVisible()
  })

  it('uses safe URL filter defaults and clamps an out-of-range page', async () => {
    renderHistory(
      Array.from({ length: 15 }, (_, index) => session(index)),
      '/app/history?page=999&range=invalid&status=invalid'
    )
    await screen.findByRole('region', { name: 'รายการเซสชัน' })
    expect(screen.getByRole('combobox', { name: 'ช่วงเวลา' })).toHaveValue(
      'all'
    )
    expect(screen.getByRole('combobox', { name: 'สถานะเซสชัน' })).toHaveValue(
      'all'
    )
    expect(screen.getByText('หน้า 2 จาก 2')).toBeVisible()
  })

  it('shows an empty state with a real monitoring link', async () => {
    renderHistory([])
    expect(await screen.findByText('ยังไม่มีประวัติ')).toBeVisible()
    expect(
      screen.getByRole('link', { name: i18n.t('dashboard.start') })
    ).toHaveAttribute('href', '/app/monitor')
  })

  it('recovers from an initial HTTP failure through retry', async () => {
    const user = userEvent.setup()
    renderHistory(undefined, undefined, true)
    await user.click(
      await screen.findByRole('button', { name: i18n.t('common.retry') })
    )
    expect(await screen.findByRole('link', { name: /session-1/ })).toBeVisible()
  })

  it('preserves loaded records and announces a failed refresh', async () => {
    const user = userEvent.setup()
    const { request } = renderHistory()
    await screen.findByRole('link', { name: /session-1/ })
    request.mockRejectedValueOnce(new Error('Synthetic refresh failure'))
    await user.click(screen.getByRole('button', { name: 'โหลดประวัติใหม่' }))
    expect(
      await screen.findByText(i18n.t('history.refreshFailed'))
    ).toBeVisible()
    expect(screen.getByRole('link', { name: /session-1/ })).toBeVisible()
  })

  it('explains an offline initial load without claiming an empty history', async () => {
    onlineManager.setOnline(false)
    try {
      const { request } = renderHistory()
      expect(await screen.findByText(i18n.t('history.offline'))).toBeVisible()
      expect(screen.queryByText('ยังไม่มีประวัติ')).not.toBeInTheDocument()
      expect(request).not.toHaveBeenCalled()
      onlineManager.setOnline(true)
      expect(
        await screen.findByRole('link', { name: /session-1/ })
      ).toBeVisible()
    } finally {
      onlineManager.setOnline(true)
    }
  })

  it('renders English labels and referenced sources without sharing a referrer', async () => {
    await i18n.changeLanguage('en')
    const user = userEvent.setup()
    renderHistory()
    await screen.findByRole('textbox', { name: 'Search history' })
    await user.click(screen.getByText('References and data scope'))
    const reference = screen.getByRole('link', { name: /W3C WCAG 2.2/ })
    expect(reference).toHaveAttribute('href', 'https://www.w3.org/TR/WCAG22/')
    expect(reference).toHaveAttribute('referrerPolicy', 'no-referrer')
    expect(
      screen.getByRole('link', { name: /MDN Intl.DateTimeFormat/ })
    ).toBeVisible()
    await waitFor(() =>
      expect(screen.getByText('2 sessions found')).toBeVisible()
    )
  })

  it('combines analytics summary, daily chart, view-mode tabs, and posture summary badges in the unified page', async () => {
    const user = userEvent.setup()
    renderHistory([
      session(1, {
        elapsed_seconds: 300,
        posture_summary: {
          good_alignment_seconds: 210,
          needs_adjustment_seconds: 75,
          unassessed_seconds: 15,
          alert_count: 2,
          break_count: 1,
          framing_mode: 'upper_body',
          method_version: 'seated-baseline-v1'
        }
      }),
      session(2, { elapsed_seconds: 180, status: 'stopped' }),
      session(3, { elapsed_seconds: 90, status: 'active' })
    ])

    const summary = await screen.findByRole('region', {
      name: 'สรุปตามตัวกรอง'
    })
    expect(within(summary).getByText('จำนวนเซสชัน')).toBeVisible()
    expect(within(summary).getByText('2')).toBeVisible()
    expect(within(summary).getByText('เวลารวม')).toBeVisible()
    expect(within(summary).getByText('เวลาเฉลี่ยต่อเซสชัน')).toBeVisible()
    expect(
      screen.getByRole('heading', {
        name: 'ระยะเวลาและกิจกรรมเซสชัน',
        level: 2
      })
    ).toBeVisible()
    expect(
      screen.getByRole('img', { name: 'เวลาที่บันทึกแยกตามวันเริ่มเซสชัน' })
    ).toBeVisible()
    expect(screen.getByText('สรุปช่วงเวลา')).toBeVisible()
    expect(screen.getByText('ระยะเวลาเฉลี่ยต่อครั้ง')).toBeVisible()

    const comboButton = screen.getByRole('button', { name: 'Bar + Line' })
    const barButton = screen.getByRole('button', { name: 'Bar' })
    const lineButton = screen.getByRole('button', { name: 'Line' })
    expect(comboButton).toHaveAttribute('aria-pressed', 'true')
    await user.click(barButton)
    expect(barButton).toHaveAttribute('aria-pressed', 'true')
    expect(comboButton).toHaveAttribute('aria-pressed', 'false')
    await user.click(lineButton)
    expect(lineButton).toHaveAttribute('aria-pressed', 'true')

    const records = screen.getByRole('region', { name: 'รายการเซสชัน' })
    expect(
      within(records).getByPlaceholderText('ค้นหาเซสชัน (วันที่หรือสถานะ)')
    ).toBeVisible()
    expect(within(records).getByText('เตือนปรับท่าทาง 2 ครั้ง')).toBeVisible()
    expect(within(records).getByText('พัก 1 ครั้ง')).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'เฉพาะรายการเซสชัน' }))
    expect(
      screen.queryByRole('region', { name: 'สรุปตามตัวกรอง' })
    ).not.toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'รายการเซสชัน' })).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'เฉพาะสถิติ' }))
    expect(screen.getByRole('region', { name: 'สรุปตามตัวกรอง' })).toBeVisible()
    expect(
      screen.queryByRole('region', { name: 'รายการเซสชัน' })
    ).not.toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'ทั้งหมด (สถิติและประวัติ)' })
    )
    expect(screen.getByRole('region', { name: 'สรุปตามตัวกรอง' })).toBeVisible()
    expect(screen.getByRole('region', { name: 'รายการเซสชัน' })).toBeVisible()
  })
})
