import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Accessibility,
  Activity,
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  CircleCheck,
  CircleUserRound,
  Info,
  LockKeyhole,
  Pencil,
  Ruler,
  Scale,
  ShieldCheck,
  Target,
  Trash2,
  Weight
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'

import { PageHeader } from '@/components/PageHeader'
import { QueryError } from '@/components/QueryState'
import { useAuth } from '@/features/auth/AuthContext'
import { formatDate } from '@/lib/format'
import { confirmNotification, showError } from '@/lib/notification'
import {
  deleteHealthProfile,
  getCurrentUser,
  getHealthProfile,
  type HealthProfile
} from '@/services/product'

export function ProfilePage() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const profile = useQuery({
    queryKey: ['health-profile'],
    queryFn: ({ signal }) => getHealthProfile(signal)
  })
  const currentUser = useQuery({
    queryKey: ['current-user'],
    queryFn: ({ signal }) => getCurrentUser(signal),
    initialData: user ?? undefined
  })
  const language = i18n.resolvedLanguage ?? 'th'
  const deletion = useMutation({
    mutationFn: deleteHealthProfile,
    onSuccess: () => {
      queryClient.setQueryData(['health-profile'], null)
      navigate('/onboarding', { replace: true })
    },
    onError: () =>
      void showError(t('profile.healthDeleteFailed'), t('common.close'))
  })
  const removeHealthProfile = async () => {
    const confirmed = await confirmNotification({
      title: t('profile.healthDelete'),
      text: t('profile.healthDeleteConfirm'),
      confirmText: t('common.delete'),
      cancelText: t('common.cancel'),
      danger: true
    })
    if (confirmed) deletion.mutate()
  }

  return (
    <div className="pb-4">
      <PageHeader
        actions={
          <>
            <Link
              aria-label={t('profile.notifications')}
              className="kg-icon-button"
              to="/app/notifications"
            >
              <Bell aria-hidden="true" size={20} />
            </Link>
            <Link className="kg-button-primary" to="/onboarding">
              <Pencil aria-hidden="true" size={17} />
              {t('profile.edit')}
            </Link>
          </>
        }
        subtitle={t('profile.subtitle')}
        title={t('profile.title')}
      />

      {profile.isPending && (
        <div className="kg-card mt-7 p-6 text-sm text-slate-600" role="status">
          {t('profile.loading')}
        </div>
      )}
      {profile.isError && (
        <div className="mt-7">
          <QueryError retry={() => void profile.refetch()} />
        </div>
      )}
      {profile.data && currentUser.data && (
        <ProfileContent
          language={language}
          onDelete={() => void removeHealthProfile()}
          profile={profile.data}
          removing={deletion.isPending}
          user={currentUser.data}
        />
      )}
    </div>
  )
}

function ProfileContent({
  language,
  onDelete,
  profile,
  removing,
  user
}: {
  language: string
  onDelete: () => void
  profile: HealthProfile
  removing: boolean
  user: { display_name: string; email: string; created_at: string }
}) {
  const { t } = useTranslation()
  const bmi = profile.weight_kg / (profile.height_cm / 100) ** 2
  const age = ageFromBirthDate(profile.birth_date)
  const hasNoReportedWarning =
    profile.warning_signs.length === 1 && profile.warning_signs[0] === 'none'

  return (
    <>
      <section className="kg-card mt-7 overflow-hidden p-5 sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(13rem,.8fr)_minmax(13rem,.8fr)] lg:items-center lg:divide-x lg:divide-slate-200">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
            <span className="grid size-24 shrink-0 place-items-center rounded-full bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-100 sm:size-28">
              <CircleUserRound aria-hidden="true" size={58} strokeWidth={1.5} />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-xl font-bold text-slate-950 sm:text-2xl">
                {user.display_name}
              </h2>
              <p className="mt-1 break-all text-sm text-slate-500 sm:text-base">
                {user.email}
              </p>
              <span className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700">
                <ShieldCheck
                  aria-hidden="true"
                  className="text-teal-700"
                  size={16}
                />
                {t('profile.accountProtected')}
              </span>
            </div>
          </div>

          <div className="flex min-h-24 items-center gap-3 border-t border-slate-200 pt-5 lg:border-t-0 lg:pl-7 lg:pt-0">
            <CalendarDays
              aria-hidden="true"
              className="shrink-0 text-slate-700"
              size={22}
            />
            <div>
              <p className="text-sm font-semibold text-slate-700">
                {t('profile.joined')}
              </p>
              <p className="mt-1 text-sm tabular-nums text-slate-950">
                {formatDate(user.created_at, language)}
              </p>
            </div>
          </div>

          <div className="flex min-h-24 items-center justify-between gap-4 border-t border-slate-200 pt-5 lg:border-t-0 lg:pl-7 lg:pt-0">
            <div>
              <p className="text-sm font-semibold text-slate-700">
                {t('profile.completeness')}
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-950">
                {t('profile.complete')}
              </p>
            </div>
            <div
              aria-label={t('profile.completeness')}
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={100}
              className="relative grid size-16 shrink-0 place-items-center"
              role="progressbar"
            >
              <svg
                aria-hidden="true"
                className="size-16 -rotate-90"
                viewBox="0 0 64 64"
              >
                <circle
                  cx="32"
                  cy="32"
                  fill="none"
                  r="25"
                  stroke="#e2e8f0"
                  strokeWidth="7"
                />
                <circle
                  cx="32"
                  cy="32"
                  fill="none"
                  r="25"
                  stroke="#0f766e"
                  strokeDasharray="157"
                  strokeLinecap="round"
                  strokeWidth="7"
                />
              </svg>
              <Check
                aria-hidden="true"
                className="absolute text-teal-700"
                size={23}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="mt-5 grid items-stretch gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.06fr)]">
        <section
          className="kg-card p-5 sm:p-6"
          aria-labelledby="body-data-title"
        >
          <SectionTitle icon={Info} id="body-data-title">
            {t('profile.bodyData')}
          </SectionTitle>
          <dl className="mt-5 grid grid-cols-2 divide-x divide-y divide-slate-200 sm:grid-cols-4 sm:divide-y-0">
            <Metric
              icon={Ruler}
              label={t('healthProfile.basics.height')}
              value={`${formatNumber(profile.height_cm, language)} ${t('healthProfile.units.cm')}`}
            />
            <Metric
              icon={Scale}
              label={t('healthProfile.basics.weight')}
              value={`${formatNumber(profile.weight_kg, language)} ${t('healthProfile.units.kg')}`}
            />
            <Metric
              icon={CalendarDays}
              label={t('healthProfile.basics.age')}
              value={t('healthProfile.units.yearsValue', { value: age })}
            />
            <Metric
              icon={Activity}
              label={t('profile.bmi')}
              value={formatNumber(bmi, language, 1)}
            />
          </dl>
          <p className="mt-5 text-xs leading-5 text-slate-500">
            {t('profile.selfReportedNotice')}
          </p>
        </section>

        <section
          className="relative overflow-hidden rounded-[1.25rem] bg-teal-800 p-5 text-white shadow-sm sm:p-7"
          aria-labelledby="goals-title"
        >
          <div
            aria-hidden="true"
            className="absolute -bottom-16 -right-8 size-64 rounded-full border border-teal-300/15"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-28 right-24 size-64 rotate-45 border-l border-teal-200/20"
          />
          <div className="relative">
            <SectionTitle icon={Target} id="goals-title" inverse>
              {t('profile.goals')}
            </SectionTitle>
            <ul className="mt-5 grid gap-3">
              {profile.goals.map((goal) => (
                <li className="flex items-start gap-3" key={goal}>
                  <CircleCheck
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-teal-100"
                    fill="currentColor"
                    size={22}
                  />
                  <span className="relative z-10 text-sm font-medium leading-6 sm:text-base">
                    {t(`healthProfile.options.${goal}`)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="relative z-10 mt-5 text-xs leading-5 text-teal-100">
              {t('profile.goalsBoundary')}
            </p>
          </div>
        </section>
      </div>

      <div className="mt-5 grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-[1.15fr_1fr_.92fr_1.18fr]">
        <section
          className="kg-card bg-teal-50/45 p-5"
          aria-labelledby="movement-title"
        >
          <SectionTitle icon={Accessibility} id="movement-title">
            {t('profile.movementContext')}
          </SectionTitle>
          <dl className="mt-4 divide-y divide-slate-200">
            <ContextRow
              icon={Activity}
              value={profile.care_areas
                .map((area) => t(`healthProfile.options.${area}`))
                .join(', ')}
            />
            <ContextRow
              icon={CircleCheck}
              value={t(
                profile.recent_injury
                  ? 'profile.recentInjuryReported'
                  : 'profile.noRecentInjuryReported'
              )}
            />
            <ContextRow
              icon={Accessibility}
              value={
                profile.assistive_device === 'none'
                  ? t('profile.noAssistiveDeviceReported')
                  : t('profile.assistiveDeviceReported', {
                      device: t(
                        `healthProfile.options.${profile.assistive_device}`
                      )
                    })
              }
            />
          </dl>
        </section>

        <section
          className="kg-card flex flex-col p-5"
          aria-labelledby="safety-title"
        >
          <SectionTitle icon={ShieldCheck} id="safety-title">
            {t('profile.safetyData')}
          </SectionTitle>
          <p className="mt-5 text-sm text-slate-500">
            {t('profile.lastReviewed')}
          </p>
          <p className="mt-1 font-semibold tabular-nums text-slate-950">
            {formatDate(profile.updated_at, language)}
          </p>
          <div className="my-4 border-t border-slate-200" />
          <p className="text-sm leading-6 text-slate-700">
            {t(
              hasNoReportedWarning
                ? 'profile.noWarningsReported'
                : 'profile.warningsReported'
            )}
          </p>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            {t('profile.notEvaluated')}
          </p>
          <Link
            className="mt-auto inline-flex min-h-11 items-center justify-between pt-4 text-sm font-semibold text-teal-700 no-underline hover:text-teal-900"
            to="/app/assessment"
          >
            {t('profile.reviewAssessment')}
            <ArrowRight aria-hidden="true" size={17} />
          </Link>
        </section>

        <section
          className="kg-card flex flex-col p-5"
          aria-labelledby="data-use-title"
        >
          <SectionTitle icon={LockKeyhole} id="data-use-title">
            {t('profile.dataUse')}
          </SectionTitle>
          <p className="mt-5 text-sm leading-6 text-slate-700">
            {t('profile.dataUseBody')}
          </p>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            {t('profile.retention', {
              date: formatDate(profile.retention_until, language)
            })}
          </p>
          <Link
            className="kg-button-secondary mt-auto w-full text-sm"
            to="/app/settings"
          >
            {t('profile.privacySettings')}
          </Link>
        </section>

        <section
          className="kg-card flex flex-col p-5"
          aria-labelledby="latest-weight-title"
        >
          <SectionTitle icon={Weight} id="latest-weight-title">
            {t('profile.latestWeight')}
          </SectionTitle>
          <p className="mt-5 text-sm text-slate-500">
            {t('healthProfile.basics.weight')}
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-slate-950">
            {formatNumber(profile.weight_kg, language)}{' '}
            <span className="text-base font-semibold">
              {t('healthProfile.units.kg')}
            </span>
          </p>
          <p className="mt-1 text-xs tabular-nums text-slate-500">
            {formatDate(profile.updated_at, language)}
          </p>
          <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-xs leading-5 text-slate-500">
            {t('profile.noWeightHistory')}
          </div>
          <Link
            className="mt-auto inline-flex min-h-11 items-center justify-between pt-3 text-sm font-semibold text-teal-700 no-underline hover:text-teal-900"
            to="/onboarding"
          >
            {t('profile.updateMeasurement')}
            <ArrowRight aria-hidden="true" size={17} />
          </Link>
        </section>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          className="inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-red-700 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
          disabled={removing}
          onClick={onDelete}
          type="button"
        >
          <Trash2 aria-hidden="true" size={17} />
          {t('profile.healthDelete')}
        </button>
      </div>
    </>
  )
}

function SectionTitle({
  children,
  icon: Icon,
  id,
  inverse = false
}: {
  children: React.ReactNode
  icon: LucideIcon
  id: string
  inverse?: boolean
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon
        aria-hidden="true"
        className={inverse ? 'text-teal-100' : 'text-teal-700'}
        size={25}
      />
      <h2
        className={`text-lg font-bold ${inverse ? 'text-white' : 'text-slate-950'}`}
        id={id}
      >
        {children}
      </h2>
    </div>
  )
}

function Metric({
  icon: Icon,
  label,
  value
}: {
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <div className="grid min-w-0 place-items-center px-2 py-4 text-center first:pt-0 sm:py-0">
      <Icon
        aria-hidden="true"
        className="text-teal-700"
        size={27}
        strokeWidth={1.6}
      />
      <dt className="mt-2 text-xs text-slate-500 sm:text-sm">{label}</dt>
      <dd className="mt-1 text-lg font-bold tabular-nums text-slate-950 sm:text-xl">
        {value}
      </dd>
    </div>
  )
}

function ContextRow({
  icon: Icon,
  value
}: {
  icon: LucideIcon
  value: string
}) {
  return (
    <div className="flex min-h-14 items-center gap-3 py-3 first:pt-0 last:pb-0">
      <Icon aria-hidden="true" className="shrink-0 text-teal-700" size={22} />
      <dd className="text-sm leading-6 text-slate-700">{value}</dd>
    </div>
  )
}

function ageFromBirthDate(value: string) {
  const birthDate = new Date(`${value}T00:00:00`)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const birthdayPassed =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() >= birthDate.getDate())
  if (!birthdayPassed) age -= 1
  return age
}

function formatNumber(
  value: number,
  language: string,
  maximumFractionDigits = 0
) {
  return new Intl.NumberFormat(language === 'th' ? 'th-TH' : 'en-GB', {
    maximumFractionDigits,
    minimumFractionDigits: maximumFractionDigits
  }).format(value)
}
