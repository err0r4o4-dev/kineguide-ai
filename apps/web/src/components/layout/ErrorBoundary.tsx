import { AlertTriangle } from 'lucide-react'
import type { ErrorInfo, ReactNode } from 'react'
import { Component } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled application error', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="grid min-h-screen place-items-center p-6">
          <section
            className="max-w-lg rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm"
            role="alert"
          >
            <AlertTriangle
              aria-hidden="true"
              className="mx-auto mb-4 text-red-600"
              size={36}
            />
            <h1 className="text-xl font-semibold">
              เกิดข้อผิดพลาดในแอปพลิเคชัน
            </h1>
            <p className="mt-2 text-slate-600">โปรดลองโหลดหน้าเว็บอีกครั้ง</p>
          </section>
        </main>
      )
    }

    return this.props.children
  }
}
