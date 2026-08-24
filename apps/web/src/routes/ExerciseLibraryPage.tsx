import { useQuery } from '@tanstack/react-query'
import { Camera, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { QueryError, QueryLoading } from '@/components/QueryState'
import { getExercises } from '@/services/product'

export function ExerciseLibraryPage() {
  const { t, i18n } = useTranslation()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const query = useQuery({
    queryKey: ['exercises'],
    queryFn: ({ signal }) => getExercises(signal),
    staleTime: 60_000
  })
  const items = useMemo(
    () =>
      (query.data ?? []).filter(
        (exercise) =>
          (category === 'all' || exercise.category === category) &&
          `${exercise.title_th} ${exercise.title_en}`
            .toLowerCase()
            .includes(search.toLowerCase())
      ),
    [category, query.data, search]
  )
  return (
    <div>
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold sm:text-4xl">
            {t('exercises.title')}
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            {t('exercises.subtitle')}
          </p>
        </div>
        <label className="relative block">
          <span className="sr-only">{t('exercises.search')}</span>
          <Search
            aria-hidden="true"
            className="absolute left-4 top-3.5 text-slate-500"
            size={20}
          />
          <input
            className="min-w-72 rounded-xl border border-slate-300 bg-white py-3 pl-12 pr-4"
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('exercises.search')}
            value={search}
          />
        </label>
      </header>
      <div className="mt-7 flex flex-wrap gap-2">
        {[
          ['all', 'all'],
          ['upper_body', 'upper'],
          ['lower_body', 'lower']
        ].map(([value, key]) => (
          <button
            className={category === value ? 'kg-filter-active' : 'kg-filter'}
            key={value}
            onClick={() => setCategory(value)}
            type="button"
          >
            {t(`exercises.${key}`)}
          </button>
        ))}
      </div>
      {query.isLoading && <QueryLoading />}
      {query.isError && (
        <div className="mt-6">
          <QueryError retry={() => void query.refetch()} />
        </div>
      )}
      {query.isSuccess && (
        <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((exercise) => (
            <article className="kg-card overflow-hidden" key={exercise.slug}>
              <div className="grid aspect-[16/9] place-items-center bg-indigo-50 text-teal-700">
                <Camera aria-hidden="true" size={54} />
              </div>
              <div className="p-6">
                <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800">
                  {t('exercises.review')}
                </span>
                <h2 className="mt-4 text-xl font-bold">
                  {i18n.resolvedLanguage === 'th'
                    ? exercise.title_th
                    : exercise.title_en}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  {exercise.category === 'upper_body'
                    ? t('exercises.upper')
                    : t('exercises.lower')}
                </p>
                <div className="mt-6 flex gap-3">
                  <Link
                    className="kg-button-secondary flex-1"
                    to={`/app/exercises/${exercise.slug}`}
                  >
                    {t('exercises.details')}
                  </Link>
                  <Link
                    className="kg-button-primary flex-1"
                    to={`/app/exercises/${exercise.slug}/setup`}
                  >
                    {t('exercises.start')}
                  </Link>
                </div>
              </div>
            </article>
          ))}
          {items.length === 0 && (
            <p className="col-span-full kg-card p-8 text-center text-slate-500">
              {t('exercises.empty')}
            </p>
          )}
        </section>
      )}
    </div>
  )
}
