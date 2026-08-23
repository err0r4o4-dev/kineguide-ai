import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createBrowserRouter } from 'react-router'

import { ErrorBoundary } from '@/components/layout/ErrorBoundary'
import { NotFoundPage } from '@/routes/NotFoundPage'
import { StatusPage } from '@/routes/StatusPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 15_000 }
  }
})

const router = createBrowserRouter([
  { path: '/', element: <StatusPage /> },
  { path: '*', element: <NotFoundPage /> }
])

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
