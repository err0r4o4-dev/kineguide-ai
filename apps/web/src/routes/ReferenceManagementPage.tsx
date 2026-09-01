import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Upload, Layers, Trash2, Download, CheckCircle } from 'lucide-react'
import { createMediaPipePoseAdapter } from '@/features/pose/poseAdapter'
import {
  processReferenceVideo,
  type VideoProcessingProgress
} from '@/features/pose/referenceVideoProcessor'
import {
  getAllStoredReferenceModels,
  saveReferenceModelToStorage,
  EXERCISE_CONFIGS,
  type ReferenceMovementModel
} from '@/features/pose/referenceMovementModel'

export function ReferenceManagementPage() {
  const { t } = useTranslation()
  const [exerciseSlug, setExerciseSlug] = useState('shoulder-movement-demo')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState<VideoProcessingProgress | null>(null)
  const [models, setModels] = useState<ReferenceMovementModel[]>([])
  const [feedback, setFeedback] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const reloadModels = () => {
    setModels(getAllStoredReferenceModels())
  }

  useEffect(() => {
    reloadModels()
  }, [])

  const handleProcess = async () => {
    if (!selectedFile) return
    setProcessing(true)
    setFeedback(null)

    let adapter
    try {
      adapter = await createMediaPipePoseAdapter()
      const newModel = await processReferenceVideo(selectedFile, adapter, {
        exerciseSlug,
        exerciseName: EXERCISE_CONFIGS[exerciseSlug]?.name ?? exerciseSlug,
        targetFps: 15,
        onProgress: setProgress
      })

      saveReferenceModelToStorage(newModel)
      reloadModels()
      setFeedback(t('referenceManagement.processSuccess'))
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (error) {
      console.error('Error processing reference video', error)
      setFeedback(error instanceof Error ? error.message : 'Processing failed')
    } finally {
      adapter?.close()
      setProcessing(false)
    }
  }

  const handleDelete = (slug: string) => {
    localStorage.removeItem(`kineguide_ref_model_${slug}`)
    reloadModels()
  }

  const handleExportJson = (model: ReferenceMovementModel) => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(model, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute(
      'download',
      `reference_${model.exerciseSlug}.json`
    )
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center gap-2 text-teal-800">
          <Layers size={24} />
          <h1 className="text-3xl font-bold leading-tight text-slate-950">
            {t('referenceManagement.title')}
          </h1>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          {t('referenceManagement.subtitle')}
        </p>
      </header>

      {/* Upload & Processor Section */}
      <section className="kg-card p-6">
        <h2 className="text-xl font-bold text-slate-900">
          {t('referenceManagement.uploadVideo')}
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              {t('referenceManagement.selectExercise')}
            </label>
            <select
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-teal-500 focus:outline-none"
              disabled={processing}
              onChange={(e) => setExerciseSlug(e.target.value)}
              value={exerciseSlug}
            >
              {Object.entries(EXERCISE_CONFIGS).map(([slug, config]) => (
                <option key={slug} value={slug}>
                  {config.name} ({slug})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              {t('referenceManagement.chooseFile')}
            </label>
            <input
              accept="video/mp4,video/webm"
              className="mt-1 w-full text-sm text-slate-500 file:mr-4 file:rounded-xl file:border-0 file:bg-teal-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-teal-800 hover:file:bg-teal-100"
              disabled={processing}
              onChange={(e) =>
                setSelectedFile(e.target.files ? e.target.files[0] : null)
              }
              ref={fileInputRef}
              type="file"
            />
          </div>
        </div>

        {processing && progress && (
          <div className="mt-4 rounded-xl border border-teal-200 bg-teal-50 p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-teal-900">
              <span>
                {t('referenceManagement.processing', {
                  percent: progress.progressPercent
                })}
              </span>
              <span>
                {progress.currentFrame} / {progress.totalFrames} frames
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-teal-200">
              <div
                className="h-full bg-teal-600 transition-all duration-200"
                style={{ width: `${progress.progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {feedback && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-100 p-3 text-sm text-slate-800">
            <CheckCircle className="text-teal-600" size={18} />
            <span>{feedback}</span>
          </div>
        )}

        <button
          className="kg-button-primary mt-5"
          disabled={!selectedFile || processing}
          onClick={() => void handleProcess()}
          type="button"
        >
          <Upload size={16} />
          {processing
            ? t('common.loading')
            : t('referenceManagement.processButton')}
        </button>
      </section>

      {/* Stored Models Section */}
      <section className="kg-card p-6">
        <h2 className="text-xl font-bold text-slate-900">
          {t('referenceManagement.savedModels')}
        </h2>

        {models.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
            {t('referenceManagement.noModels')}
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {models.map((m) => (
              <div
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm"
                key={m.exerciseSlug}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900">
                      {m.exerciseName}
                    </h3>
                    <p className="text-xs text-slate-500">{m.exerciseSlug}</p>
                  </div>
                  <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                    Active
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div className="rounded-lg bg-white p-2 border border-slate-100">
                    <p className="text-slate-400">
                      {t('referenceManagement.frames')}
                    </p>
                    <p className="font-semibold text-slate-800">
                      {m.frameCount}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white p-2 border border-slate-100">
                    <p className="text-slate-400">
                      {t('referenceManagement.duration')}
                    </p>
                    <p className="font-semibold text-slate-800">
                      {m.durationSeconds}s
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
                  <button
                    className="inline-flex items-center gap-1 text-xs font-semibold text-teal-800 hover:text-teal-900"
                    onClick={() => handleExportJson(m)}
                    type="button"
                  >
                    <Download size={14} />
                    {t('referenceManagement.exportJson')}
                  </button>
                  <button
                    className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(m.exerciseSlug)}
                    type="button"
                  >
                    <Trash2 size={14} />
                    {t('referenceManagement.deleteModel')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
