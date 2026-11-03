import {
  onlineManager,
  QueryClient,
  QueryClientProvider
} from '@tanstack/react-query'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { vi } from 'vitest'

import i18n from '@/lib/i18n'
import { getSessions, type PostureSession } from '@/services/product'
import { ProgressPage } from './ProgressPage'

vi.mock('@/services/product', () => ({ getSessions: vi.fn() }))

function record(
  id: string,
  daysAgo = 0,
  seconds = 300,
  status: PostureSession['status'] = 'completed'
): PostureSession {
  return {
    id,
    status,
    started_at: new Date(Date.now() - daysAgo * 86400000).toISOString(),
    completed_at: status === 'active' ? null : new Date().toISOString(),
    retention_until: '2027-11-02T00:00:00Z',
    posture_summary: null,
    metrics: {
      duration_seconds: seconds,
      sitting_seconds: null,
      standing_seconds: null,
      good_alignment_seconds: null,
      needs_adjustment_seconds: null,
      alert_count: null,
      break_count: null,
      longest_sitting_seconds: null
    }
  }
}

const clients: QueryClient[] = []

function renderRoute(url = '/app/analytics', initialData?: PostureSession[]) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  clients.push(client)
  if (initialData) client.setQueryData(['sessions'], initialData)
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route element={<ProgressPage />} path="/app/analytics" />
          <Route
            element={<h1>Selected summary</h1>}
            path="/app/monitor/summary/:id"
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
  return client
}

async function summaryRegion() {
  return screen.findByRole('region', { name: 'สรุปตามตัวกรอง' })
}

function stat(label: string) {
  const region = screen.getByRole('region', { name: 'สรุปตามตัวกรอง' })
  return within(region).getByText(label).closest('article')!
}

beforeEach(async () => {
  await i18n.changeLanguage('th')
  onlineManager.setOnline(true)
  vi.mocked(getSessions)
    .mockReset()
    .mockResolvedValue(
      Array.from({ length: 15 }, (_, index) =>
        record(`session-${index}`, index)
      )
    )
})

afterEach(() => {
  clients.forEach((client) => client.clear())
  clients.length = 0
  onlineManager.setOnline(true)
})

describe('ProgressPage', () => {
  it('uses the selected range for totals rather than all-time dashboard data', async () => {
    const user = userEvent.setup()
    renderRoute()
    await summaryRegion()
    expect(within(stat('จำนวนเซสชัน')).getByText('7')).toBeVisible()
    expect(stat('เวลารวม')).toHaveTextContent('0 ชม. 35 น. 0 วิ.')
    expect(stat('เวลาเฉลี่ยต่อเซสชัน')).toHaveTextContent('0 ชม. 5 น. 0 วิ.')
    const allFilter = screen.getByRole('button', { name: 'ทั้งหมดที่โหลด' })
    await user.click(allFilter)
    expect(allFilter).toHaveAttribute('aria-pressed', 'true')
    expect(within(stat('จำนวนเซสชัน')).getByText('15')).toBeVisible()
    expect(stat('เวลารวม')).toHaveTextContent('1 ชม. 15 น. 0 วิ.')
    expect(screen.getByText('หน้า 1 จาก 2')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'หน้าถัดไป' }))
    expect(screen.getByText('หน้า 2 จาก 2')).toBeVisible()
    expect(
      within(
        screen.getByRole('region', { name: 'ประวัติเซสชัน' })
      ).getAllByRole('link')
    ).toHaveLength(5)
    await user.click(screen.getByRole('button', { name: '7 วัน' }))
    expect(
      screen.queryByRole('navigation', { name: 'การแบ่งหน้าประวัติ' })
    ).not.toBeInTheDocument()
    expect(within(stat('จำนวนเซสชัน')).getByText('7')).toBeVisible()
  })

  it('searches actual IDs and applies the same search to totals, daily data and links', async () => {
    const user = userEvent.setup()
    renderRoute('/app/analytics?range=all&page=2')
    await summaryRegion()
    await user.type(
      screen.getByRole('textbox', { name: 'ค้นหาประวัติ' }),
      'SESSION-14'
    )
    expect(within(stat('จำนวนเซสชัน')).getByText('1')).toBeVisible()
    expect(stat('เวลารวม')).toHaveTextContent('0 ชม. 5 น. 0 วิ.')
    const list = screen.getByRole('region', { name: 'ประวัติเซสชัน' })
    expect(within(list).getAllByRole('link')).toHaveLength(1)
    expect(within(list).getByRole('link')).toHaveAttribute(
      'href',
      '/app/monitor/summary/session-14'
    )
    await user.click(screen.getByText('ดูตารางข้อมูลรายวัน'))
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(
      2
    )
    await user.click(within(list).getByRole('link'))
    expect(
      screen.getByRole('heading', { name: 'Selected summary' })
    ).toBeVisible()
  })

  it('includes stopped but not active sessions and can search a localized status or date', async () => {
    vi.mocked(getSessions).mockResolvedValue([
      record('complete', 0, 7200),
      record('stop', 1, 3600, 'stopped'),
      record('active', 0, 999, 'active')
    ])
    const user = userEvent.setup()
    renderRoute()
    await summaryRegion()
    expect(within(stat('จำนวนเซสชัน')).getByText('2')).toBeVisible()
    expect(stat('เวลารวม')).toHaveTextContent('3 ชม. 0 น. 0 วิ.')
    await user.type(
      screen.getByRole('textbox', { name: 'ค้นหาประวัติ' }),
      i18n.t('history.stopped')
    )
    expect(within(stat('จำนวนเซสชัน')).getByText('1')).toBeVisible()
    expect(stat('เวลารวม')).toHaveTextContent('1 ชม. 0 น. 0 วิ.')
    await user.clear(screen.getByRole('textbox', { name: 'ค้นหาประวัติ' }))
    await user.type(
      screen.getByRole('textbox', { name: 'ค้นหาประวัติ' }),
      new Date().toISOString().slice(0, 10)
    )
    expect(within(stat('จำนวนเซสชัน')).getByText('1')).toBeVisible()
  })

  it('does not invent an average for empty results or hide the clear-filters recovery', async () => {
    const user = userEvent.setup()
    renderRoute('/app/analytics?q=no-such-record')
    await summaryRegion()
    expect(stat('เวลาเฉลี่ยต่อเซสชัน')).toHaveTextContent('ยังไม่มีข้อมูล')
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'ล้างตัวกรอง' }))
    expect(within(stat('จำนวนเซสชัน')).getByText('7')).toBeVisible()
  })

  it('shows loading until data arrives', async () => {
    vi.mocked(getSessions).mockReturnValue(new Promise(() => {}))
    renderRoute()
    expect(screen.getByText('กำลังโหลด…')).toBeInTheDocument()
    expect(
      screen.queryByRole('region', { name: 'สรุปตามตัวกรอง' })
    ).not.toBeInTheDocument()
  })

  it('allows retry after an initial failure', async () => {
    vi.mocked(getSessions)
      .mockRejectedValueOnce(new Error('synthetic failure'))
      .mockResolvedValueOnce([record('recovered')])
    const user = userEvent.setup()
    renderRoute()
    const retry = await screen.findByRole('button', {
      name: i18n.t('common.retry')
    })
    await user.click(retry)
    await summaryRegion()
    expect(within(stat('จำนวนเซสชัน')).getByText('1')).toBeVisible()
  })

  it('keeps loaded results with an explicit warning after refresh failure', async () => {
    vi.mocked(getSessions)
      .mockResolvedValueOnce([record('cached')])
      .mockRejectedValueOnce(new Error('synthetic refresh failure'))
    const user = userEvent.setup()
    renderRoute()
    await summaryRegion()
    await user.click(
      screen.getByRole('button', { name: i18n.t('history.refresh') })
    )
    expect(
      await screen.findByText(i18n.t('history.refreshFailed'))
    ).toBeVisible()
    expect(within(stat('จำนวนเซสชัน')).getByText('1')).toBeVisible()
  })

  it('shows offline recovery instead of an endless initial loading state', async () => {
    onlineManager.setOnline(false)
    renderRoute()
    expect(await screen.findByText(i18n.t('analytics.offline'))).toBeVisible()
    expect(screen.queryByText('กำลังโหลด…')).not.toBeInTheDocument()
    act(() => onlineManager.setOnline(true))
    await summaryRegion()
  })

  it('announces an offline transition even when the loaded query is idle', async () => {
    renderRoute()
    await summaryRegion()
    act(() => onlineManager.setOnline(false))
    expect(await screen.findByText(i18n.t('analytics.offline'))).toBeVisible()
    expect(within(stat('จำนวนเซสชัน')).getByText('7')).toBeVisible()
    act(() => onlineManager.setOnline(true))
    await waitFor(() =>
      expect(
        screen.queryByText(i18n.t('analytics.offline'))
      ).not.toBeInTheDocument()
    )
  })

  it('warns when invalid data is excluded without discarding valid zero durations', async () => {
    vi.mocked(getSessions).mockResolvedValue([
      record('zero', 0, 0),
      { ...record('invalid'), started_at: 'not-a-date' }
    ])
    renderRoute()
    await summaryRegion()
    expect(
      screen.getByText(i18n.t('analytics.invalid', { count: 1 }))
    ).toBeVisible()
    expect(within(stat('จำนวนเซสชัน')).getByText('1')).toBeVisible()
    expect(stat('เวลาเฉลี่ยต่อเซสชัน')).toHaveTextContent('0 ชม. 0 น. 0 วิ.')
  })

  it('restores URL filters and exposes matching English copy and primary references', async () => {
    await i18n.changeLanguage('en')
    renderRoute('/app/analytics?range=all&q=session-14&page=-3')
    const summary = await screen.findByRole('region', {
      name: 'Filtered summary'
    })
    expect(within(summary).getByText('1')).toBeVisible()
    expect(screen.getByRole('textbox', { name: 'Search history' })).toHaveValue(
      'session-14'
    )
    expect(
      screen.getByRole('button', { name: 'All loaded records' })
    ).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('link', { name: /W3C WAI/ })).toHaveAttribute(
      'href',
      'https://www.w3.org/WAI/tutorials/images/complex/'
    )
    expect(screen.getByText(/at most the latest 50/)).toBeVisible()
    await waitFor(() =>
      expect(screen.queryByText('analytics.average')).not.toBeInTheDocument()
    )
  })

  it('filters by session status and displays posture summary badges when present', async () => {
    vi.mocked(getSessions).mockResolvedValue([
      {
        ...record('with-posture', 0, 600, 'completed'),
        posture_summary: {
          good_alignment_seconds: 480,
          needs_adjustment_seconds: 100,
          unassessed_seconds: 20,
          alert_count: 3,
          break_count: 2,
          framing_mode: 'upper_body',
          method_version: 'seated-baseline-v1'
        }
      },
      record('stopped-one', 0, 300, 'stopped')
    ])
    const user = userEvent.setup()
    renderRoute()
    await summaryRegion()
    const list = screen.getByRole('region', { name: 'ประวัติเซสชัน' })
    expect(within(list).getByText('เตือนปรับท่าทาง 3 ครั้ง')).toBeVisible()
    expect(within(list).getByText('พัก 2 ครั้ง')).toBeVisible()

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'สถานะเซสชัน' }),
      'stopped'
    )
    expect(within(stat('จำนวนเซสชัน')).getByText('1')).toBeVisible()
    expect(within(list).getAllByRole('link')).toHaveLength(1)
  })
})
