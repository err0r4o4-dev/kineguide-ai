import { Camera } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const exerciseMedia: Record<
  string,
  {
    src: string
    altKey: 'exercises.sitToStandImageAlt' | 'exercises.shoulderImageAlt'
  }
> = {
  'sit-to-stand-demo': {
    src: '/exercises/sit-to-stand-demo.png',
    altKey: 'exercises.sitToStandImageAlt'
  },
  'shoulder-movement-demo': {
    src: '/exercises/shoulder-movement-demo.png',
    altKey: 'exercises.shoulderImageAlt'
  }
}

export function ExerciseIllustration({
  slug,
  className
}: {
  slug: string
  className?: string
}) {
  const { t } = useTranslation()
  const media = exerciseMedia[slug]

  if (!media) {
    return <Camera aria-hidden="true" className={className} size={54} />
  }

  return (
    <img
      alt={t(media.altKey)}
      className={className}
      decoding="async"
      loading="lazy"
      src={media.src}
    />
  )
}
