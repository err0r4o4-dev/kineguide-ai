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
  getConsent,
  getOAuthLoginURL,
  getOAuthProviders,
  type OAuthProvider
} from '@/services/product'

const schema = z.object({
  display_name: z.string().trim().min(2).max(80).optional(),
  email: z.string().trim().email().max(254),
  password: z.string().min(12).max(128)
})

type FormValues = z.infer<typeof schema>

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
    resolver: zodResolver(schema),
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
          display_name: values.display_name ?? ''
        })
      } else {
        await auth.login({ email: values.email, password: values.password })
      }
      if (isRegister) {
        navigate('/consent', { replace: true })
      } else {
        const consent = await getConsent().catch(() => null)
        navigate(consent && !consent.revoked_at ? '/app' : '/consent', {
          replace: true
        })
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
    <main className="grid min-h-screen place-items-center bg-[#f8f7ff] p-4">
      <div className="w-full max-w-5xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/50 lg:grid lg:grid-cols-2">
        <section className="hidden min-h-[680px] flex-col justify-between bg-[radial-gradient(circle_at_50%_25%,#5eead4,transparent_24%),linear-gradient(145deg,#0f766e,#134e4a)] p-10 text-white lg:flex">
          <Brand />
          <div>
            <h2 className="text-4xl font-bold">KineGuide AI</h2>
            <p className="mt-4 max-w-md text-lg leading-8 text-teal-50">
              {t('landing.subtitle')}
            </p>
          </div>
        </section>
        <section className="p-6 sm:p-10 lg:p-14">
          <div className="flex items-center justify-between lg:justify-end">
            <span className="lg:hidden">
              <Brand compact />
            </span>
            <LanguageButton />
          </div>
          <h1 className="mt-10 text-3xl font-bold text-slate-950">
            {isRegister ? t('auth.register') : t('auth.welcome')}
          </h1>
          <p className="mt-2 text-slate-600">{t('auth.subtitle')}</p>
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
              className="font-semibold text-teal-700"
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
