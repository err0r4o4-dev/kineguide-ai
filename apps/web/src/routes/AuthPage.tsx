import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { LockKeyhole, Mail, ShieldCheck, UserRound } from 'lucide-react'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { z } from 'zod'

import { Brand } from '@/components/Brand'
import { LanguageButton } from '@/components/LanguageButton'
import { useAuth } from '@/features/auth/AuthContext'
import { ProviderIcon } from '@/features/auth/ProviderIcon'
import {
  getOAuthLoginURL,
  getOAuthProviders,
  type OAuthProvider
} from '@/services/product'

function createSchema(requiresDisplayName: boolean) {
  return z.object({
    display_name: z
      .string()
      .trim()
      .max(80)
      .refine((value) => !requiresDisplayName || value.length >= 2),
    email: z.string().trim().email().max(254),
    password: z.string().min(12).max(128)
  })
}

type FormValues = z.infer<ReturnType<typeof createSchema>>

export function AuthPage() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const auth = useAuth()
  const isRegister = location.pathname === '/register'
  const [serverError, setServerError] = useState('')
  const [socialProvider, setSocialProvider] = useState<OAuthProvider | null>(
    null
  )
  const submissionInFlight = useRef(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(createSchema(isRegister)),
    defaultValues: { display_name: '', email: '', password: '' }
  })
  const providers = useQuery({
    queryKey: ['auth-providers'],
    queryFn: getOAuthProviders,
    staleTime: 5 * 60_000
  })
  const enabledProviders =
    providers.data?.providers.filter((provider) => provider.enabled) ?? []

  if (auth.ready && auth.user && !submissionInFlight.current)
    return <Navigate replace to="/app" />

  const submit = async (values: FormValues) => {
    submissionInFlight.current = true
    setServerError('')
    try {
      if (isRegister) {
        await auth.register({
          ...values,
          display_name: values.display_name
        })
      } else {
        await auth.login({ email: values.email, password: values.password })
      }
      if (isRegister) {
        navigate('/consent', { replace: true })
      } else {
        navigate(requestedAppPath(location.state), { replace: true })
      }
    } catch {
      submissionInFlight.current = false
      setServerError(t(isRegister ? 'auth.createFailed' : 'auth.invalid'))
    }
  }

  const beginSocialSignIn = (provider: OAuthProvider) => {
    setServerError('')
    setSocialProvider(provider)
    window.location.assign(getOAuthLoginURL(provider))
  }

  return (
    <main className="grid min-h-screen place-items-center bg-kg-canvas p-4 sm:p-6">
      <div className="w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5 lg:grid lg:min-h-[760px] lg:grid-cols-[0.95fr_1.05fr]">
        <section className="relative isolate hidden h-full flex-col justify-between overflow-hidden p-10 text-white lg:flex">
          <img
            alt=""
            aria-hidden="true"
            className="absolute inset-0 -z-20 size-full object-cover object-[42%_center]"
            src="/auth-illustration.jpg"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(15,118,110,0.08)_20%,rgba(15,118,110,0.76)_60%,rgba(15,118,110,0.96)_80%,#0f766e_100%)]"
          />
          <Brand inverted />
          <div className="max-w-md pb-2">
            <h2 className="text-4xl font-bold tracking-tight">KineGuide AI</h2>
            <p className="mt-4 text-lg leading-8 text-white/90">
              {t('landing.subtitle')}
            </p>
          </div>
        </section>
        <section className="p-6 sm:p-10 lg:overflow-y-auto lg:p-14 xl:p-16">
          <div className="flex items-center justify-between lg:justify-end">
            <span className="lg:hidden">
              <Brand compact />
            </span>
            <LanguageButton />
          </div>
          <h1 className="mt-10 text-3xl font-bold leading-tight tracking-[-0.025em] text-slate-950 sm:text-4xl">
            {isRegister ? t('auth.register') : t('auth.welcome')}
          </h1>
          <p className="mt-3 max-w-lg leading-7 text-slate-600">
            {t('auth.subtitle')}
          </p>
          <form
            className="mt-8 space-y-5"
            noValidate
            onSubmit={(event) => void handleSubmit(submit)(event)}
          >
            {isRegister && (
              <label className="kg-field">
                <span>{t('auth.displayName')}</span>
                <span className="relative">
                  <UserRound
                    aria-hidden="true"
                    className="kg-field-icon"
                    size={19}
                  />
                  <input autoComplete="name" {...register('display_name')} />
                </span>
                {errors.display_name && (
                  <span className="kg-error">{t('common.error')}</span>
                )}
              </label>
            )}
            <label className="kg-field">
              <span>{t('auth.email')}</span>
              <span className="relative">
                <Mail aria-hidden="true" className="kg-field-icon" size={19} />
                <input
                  autoComplete="email"
                  inputMode="email"
                  {...register('email')}
                />
              </span>
              {errors.email && (
                <span className="kg-error">{t('common.error')}</span>
              )}
            </label>
            <label className="kg-field">
              <span>{t('auth.password')}</span>
              <span className="relative">
                <LockKeyhole
                  aria-hidden="true"
                  className="kg-field-icon"
                  size={19}
                />
                <input
                  autoComplete={
                    isRegister ? 'new-password' : 'current-password'
                  }
                  type="password"
                  {...register('password')}
                />
              </span>
              <span className="text-xs text-slate-500">
                {t('auth.passwordHint')}
              </span>
              {errors.password && (
                <span className="kg-error">{t('auth.passwordHint')}</span>
              )}
            </label>
            {serverError && (
              <p className="kg-alert-danger" role="alert">
                {serverError}
              </p>
            )}
            <button
              className="kg-button-primary w-full"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting
                ? t('common.loading')
                : isRegister
                  ? t('auth.register')
                  : t('auth.signIn')}
            </button>
          </form>
          {enabledProviders.length > 0 && (
            <section aria-label={t('auth.or')} className="mt-7">
              <div className="flex items-center gap-3" aria-hidden="true">
                <span className="h-px flex-1 bg-slate-200" />
                <span className="text-[0.7rem] font-semibold tracking-wider text-slate-500">
                  {t('auth.or')}
                </span>
                <span className="h-px flex-1 bg-slate-200" />
              </div>
              <div className="mt-4 flex justify-center gap-3">
                {enabledProviders.map(({ provider }) => (
                  <button
                    aria-label={t(`auth.${provider}`)}
                    className="grid min-h-11 min-w-14 place-items-center rounded-lg border border-slate-200 bg-slate-50 px-4 transition-colors hover:border-slate-300 hover:bg-white disabled:opacity-60"
                    disabled={socialProvider !== null}
                    key={provider}
                    onClick={() => beginSocialSignIn(provider)}
                    type="button"
                  >
                    <ProviderIcon provider={provider} />
                  </button>
                ))}
              </div>
              {socialProvider && (
                <p
                  className="mt-3 text-center text-sm text-slate-600"
                  role="status"
                >
                  {t('auth.socialLoading')}
                </p>
              )}
            </section>
          )}
          <p className="mt-6 text-center text-sm text-slate-600">
            {isRegister ? t('auth.hasAccount') : t('auth.noAccount')}{' '}
            <Link
              className="rounded font-semibold text-teal-700 underline-offset-4 hover:underline"
              to={isRegister ? '/login' : '/register'}
            >
              {isRegister ? t('auth.signIn') : t('auth.register')}
            </Link>
          </p>
          <p className="mt-8 flex items-start gap-2 text-xs leading-5 text-slate-500">
            <ShieldCheck aria-hidden="true" className="shrink-0" size={16} />
            {t('auth.secure')}
          </p>
        </section>
      </div>
    </main>
  )
}

function requestedAppPath(state: unknown) {
  if (
    typeof state === 'object' &&
    state !== null &&
    'from' in state &&
    typeof state.from === 'string' &&
    (state.from === '/app' || state.from.startsWith('/app/'))
  ) {
    return state.from
  }
  return '/app'
}
