import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { lazy, Suspense, useEffect, useState } from 'react'
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router'

import { AppShell } from '@/components/layout/AppShell'
import { ErrorBoundary } from '@/components/layout/ErrorBoundary'
import { PwaUpdateNotice } from '@/components/PwaUpdateNotice'
import { SystemLoading } from '@/components/SystemState'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { ConsentRoute } from '@/features/auth/ConsentRoute'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { finishRouteRefresh, isRouteRefresh } from '@/lib/navigation'
import { NotFoundPage } from '@/routes/NotFoundPage'

const LandingPage = lazy(() =>
  import('@/routes/LandingPage').then((module) => ({
    default: module.LandingPage
  }))
)
const AuthPage = lazy(() =>
  import('@/routes/AuthPage').then((module) => ({ default: module.AuthPage }))
)
const AuthCallbackPage = lazy(() =>
  import('@/routes/AuthCallbackPage').then((module) => ({
    default: module.AuthCallbackPage
  }))
)
const StatusPage = lazy(() =>
  import('@/routes/StatusPage').then((module) => ({
    default: module.StatusPage
  }))
)
const ConsentPage = lazy(() =>
  import('@/routes/ConsentPage').then((module) => ({
    default: module.ConsentPage
  }))
)
const DashboardPage = lazy(() =>
  import('@/routes/DashboardPage').then((module) => ({
    default: module.DashboardPage
  }))
)
const ChatPage = lazy(() =>
  import('@/routes/ChatPage').then((module) => ({ default: module.ChatPage }))
)
const PlanPage = lazy(() =>
  import('@/routes/PlanPage').then((module) => ({
    default: module.PlanPage
  }))
)
const ExerciseLibraryPage = lazy(() =>
  import('@/routes/ExerciseLibraryPage').then((module) => ({
    default: module.ExerciseLibraryPage
  }))
)
const ExerciseDetailPage = lazy(() =>
  import('@/routes/ExerciseDetailPage').then((module) => ({
    default: module.ExerciseDetailPage
  }))
)
const CameraSetupPage = lazy(() =>
  import('@/routes/CameraSetupPage').then((module) => ({
    default: module.CameraSetupPage
  }))
)
const CameraPracticePage = lazy(() =>
  import('@/routes/CameraPracticePage').then((module) => ({
    default: module.CameraPracticePage
  }))
)
const LiveSessionPage = lazy(() =>
  import('@/routes/LiveSessionPage').then((module) => ({
    default: module.LiveSessionPage
  }))
)
const SessionSummaryPage = lazy(() =>
  import('@/routes/SessionSummaryPage').then((module) => ({
    default: module.SessionSummaryPage
  }))
)
const ProgressPage = lazy(() =>
  import('@/routes/ProgressPage').then((module) => ({
    default: module.ProgressPage
  }))
)
const ProfilePage = lazy(() =>
  import('@/routes/ProfilePage').then((module) => ({
    default: module.ProfilePage
  }))
)
const SettingsPage = lazy(() =>
  import('@/routes/SettingsPage').then((module) => ({
    default: module.SettingsPage
  }))
)
const HelpPage = lazy(() =>
  import('@/routes/HelpPage').then((module) => ({ default: module.HelpPage }))
)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 15_000 }
  }
})

const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <AuthPage /> },
  { path: '/register', element: <AuthPage /> },
  { path: '/auth/callback', element: <AuthCallbackPage /> },
  { path: '/status', element: <StatusPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/consent', element: <ConsentPage /> },
      {
        element: <ConsentRoute />,
        children: [
          {
            path: '/app',
            element: <AppShell />,
            children: [
              { index: true, element: <DashboardPage /> },
              { path: 'chat', element: <ChatPage /> },
              { path: 'plan', element: <PlanPage /> },
              { path: 'camera', element: <CameraPracticePage /> },
              { path: 'exercises', element: <ExerciseLibraryPage /> },
              { path: 'exercises/:slug', element: <ExerciseDetailPage /> },
              { path: 'exercises/:slug/setup', element: <CameraSetupPage /> },
              { path: 'sessions/:id/live', element: <LiveSessionPage /> },
              {
                path: 'sessions/:id/summary',
                element: <SessionSummaryPage />
              },
              {
                path: 'history',
                element: <Navigate replace to="/app/progress" />
              },
              { path: 'progress', element: <ProgressPage /> },
              { path: 'profile', element: <ProfilePage /> },
              { path: 'settings', element: <SettingsPage /> },
              { path: 'help', element: <HelpPage /> }
            ]
          }
        ]
      }
    ]
  },
  { path: '*', element: <NotFoundPage /> }
])

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PwaUpdateNotice />
          <Suspense fallback={<AppLoading />}>
            <RouterProvider router={router} />
          </Suspense>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export function AppLoading() {
  const [suppressRefreshLoading] = useState(isRouteRefresh)

  useEffect(
    () => () => {
      if (suppressRefreshLoading) finishRouteRefresh()
    },
    [suppressRefreshLoading]
  )

  return suppressRefreshLoading ? null : <SystemLoading />
}
