import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'

import '@/lib/i18n'
import { StatusCard } from './StatusPage'

describe('StatusCard', () => {
  it('shows the Thai service name and healthy state', async () => {
    const client = new QueryClient()

    render(
      <QueryClientProvider client={client}>
        <StatusCard
          icon={<span aria-hidden="true">✓</span>}
          label="Web Application"
          state="ok"
        />
      </QueryClientProvider>
    )

    expect(
      screen.getByRole('heading', { name: 'Web Application' })
    ).toBeInTheDocument()
    expect(await screen.findByText('พร้อมใช้งาน')).toBeInTheDocument()
  })
})
