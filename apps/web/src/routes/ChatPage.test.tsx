import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import '@/lib/i18n'
import i18n from '@/lib/i18n'
import * as product from '@/services/product'
import { ChatPage } from './ChatPage'

vi.mock('@/services/product', () => ({
  createConversation: vi.fn(),
  deleteConversation: vi.fn(),
  getConversationMessages: vi.fn(),
  getConversations: vi.fn(),
  sendConversationMessage: vi.fn()
}))

describe('ChatPage', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    await i18n.changeLanguage('th')
    vi.mocked(product.getConversations).mockResolvedValue([])
    vi.mocked(product.createConversation).mockResolvedValue({
      id: '864cb7ae-64dd-4db4-8200-12b44e5bcab1',
      title: 'บทสนทนาใหม่',
      locale: 'th',
      created_at: '2026-08-26T00:00:00Z',
      updated_at: '2026-08-26T00:00:00Z',
      retention_policy: 'until_deleted'
    })
    vi.mocked(product.getConversationMessages).mockResolvedValue([])
    vi.mocked(product.sendConversationMessage).mockResolvedValue([
      {
        id: 'user-message',
        conversation_id: '864cb7ae-64dd-4db4-8200-12b44e5bcab1',
        role: 'user',
        content: 'สวัสดี',
        created_at: '2026-08-26T00:00:01Z'
      },
      {
        id: 'assistant-message',
        conversation_id: '864cb7ae-64dd-4db4-8200-12b44e5bcab1',
        role: 'assistant',
        content: 'คำตอบจำลองที่ปลอดภัย',
        created_at: '2026-08-26T00:00:02Z'
      }
    ])
    vi.mocked(product.deleteConversation).mockResolvedValue(undefined)
  })

  it('requires an accessible confirmation before deleting a conversation', async () => {
    const user = userEvent.setup()
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
    })
    vi.mocked(product.getConversations).mockResolvedValue([
      {
        id: '864cb7ae-64dd-4db4-8200-12b44e5bcab1',
        title: 'บทสนทนาทดสอบ',
        locale: 'th',
        created_at: '2026-08-26T00:00:00Z',
        updated_at: '2026-08-26T00:00:00Z',
        retention_policy: 'until_deleted'
      }
    ])

    render(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <ChatPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    await screen.findAllByRole('button', {
      name: 'ลบบทสนทนา บทสนทนาทดสอบ'
    })
    await user.click(
      screen.getAllByRole('button', {
        name: 'ลบบทสนทนา บทสนทนาทดสอบ'
      })[0]
    )

    const dialog = await screen.findByRole('dialog', {
      name: 'ลบบทสนทนา'
    })
    await user.click(screen.getByRole('button', { name: 'ยกเลิก' }))
    expect(dialog).not.toBeInTheDocument()
    expect(product.deleteConversation).not.toHaveBeenCalled()

    await user.click(
      screen.getAllByRole('button', {
        name: 'ลบบทสนทนา บทสนทนาทดสอบ'
      })[0]
    )
    await user.click(screen.getByRole('button', { name: 'ลบ' }))

    expect(product.deleteConversation).toHaveBeenCalledTimes(1)
    expect(
      await screen.findByRole('alert', { name: 'ลบบทสนทนาแล้ว' })
    ).toBeInTheDocument()
  })

  it('creates a conversation and sends a typed message with an accessible status', async () => {
    const user = userEvent.setup()
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
    })
    render(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <ChatPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(
      screen.getByRole('heading', { name: 'ผู้ช่วย KineGuide AI' })
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'พิมพ์สนทนาต่อเนื่องโดยใช้ประวัติในบัญชีนี้ ข้อความจะเก็บจนกว่าคุณจะลบบทสนทนาหรือลบบัญชี'
      )
    ).toBeInTheDocument()

    await user.click(
      await screen.findByRole('button', { name: 'เริ่มบทสนทนาใหม่' })
    )
    const textbox = await screen.findByRole('textbox', {
      name: 'ข้อความถึง KineGuide AI'
    })
    expect(textbox).toHaveAttribute(
      'placeholder',
      'ลองพิมพ์: มีท่าสาธิตอะไรแนะนำบ้าง'
    )
    expect(
      screen.queryByRole('link', { name: 'เริ่มประเมิน' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'แผนกิจกรรม' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'ฝึกด้วยกล้อง' })
    ).not.toBeInTheDocument()
    vi.mocked(product.getConversations).mockResolvedValue([
      {
        id: '864cb7ae-64dd-4db4-8200-12b44e5bcab1',
        title: 'สวัสดี',
        locale: 'th',
        created_at: '2026-08-26T00:00:00Z',
        updated_at: '2026-08-26T00:00:02Z',
        retention_policy: 'until_deleted'
      }
    ])
    await user.type(textbox, 'สวัสดี{Enter}')

    expect(await screen.findByText('คำตอบจำลองที่ปลอดภัย')).toBeInTheDocument()
    expect((await screen.findAllByText('สวัสดี')).length).toBeGreaterThan(0)
    expect(product.sendConversationMessage).toHaveBeenCalledWith(
      '864cb7ae-64dd-4db4-8200-12b44e5bcab1',
      { content: 'สวัสดี' }
    )
  })
})
