import type { ExerciseFeatures, JointName } from './exerciseFeatures'

export interface KeyFramesDefinition {
  start: number
  peak: number
  end: number
}

export interface AngleRangeDefinition {
  min: number
  max: number
  target: number
  toleranceDegrees?: number
}

export interface ExerciseConfig {
  id: string
  name: string
  slug: string
  requiredJoints: number[]
  importantAngles: JointName[]
  similarityWeights: {
    landmark: number
    angle: number
    temporal: number
  }
  thresholds?: {
    warning: number // e.g. error > 15 degrees
    incorrect: number // e.g. error > 30 degrees
  }
  repCounting?: {
    enabled: boolean
    primaryJoint?: JointName
    restAngle?: number
    peakAngle?: number
    threshold?: number
  }
}

export interface ReferenceMovementModel {
  exerciseId: string
  exerciseSlug: string
  exerciseName: string
  fps: number
  frameCount: number
  durationSeconds: number
  features: ExerciseFeatures[]
  keyFrames?: KeyFramesDefinition
  angleRanges?: Partial<Record<JointName, AngleRangeDefinition>>
  config: ExerciseConfig
}

export const EXERCISE_CONFIGS: Record<string, ExerciseConfig> = {
  'seated-posture-demo': {
    id: 'seated-posture-demo',
    slug: 'seated-posture-demo',
    name: 'Seated posture demonstration',
    requiredJoints: [0, 11, 12, 23, 24, 25, 26],
    importantAngles: ['leftHip', 'rightHip', 'leftKnee', 'rightKnee'],
    similarityWeights: { landmark: 0.3, angle: 0.5, temporal: 0.2 },
    repCounting: { enabled: false }
  },
  'standing-posture-demo': {
    id: 'standing-posture-demo',
    slug: 'standing-posture-demo',
    name: 'Standing posture demonstration',
    requiredJoints: [0, 11, 12, 23, 24, 25, 26, 27, 28],
    importantAngles: ['leftHip', 'rightHip', 'leftKnee', 'rightKnee'],
    similarityWeights: { landmark: 0.3, angle: 0.5, temporal: 0.2 },
    repCounting: { enabled: false }
  },
  'walking-demo': {
    id: 'walking-demo',
    slug: 'walking-demo',
    name: 'Walking demonstration',
    requiredJoints: [0, 11, 12, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32],
    importantAngles: ['leftHip', 'rightHip', 'leftKnee', 'rightKnee'],
    similarityWeights: { landmark: 0.3, angle: 0.5, temporal: 0.2 },
    repCounting: { enabled: false }
  },
  'shoulder-movement-demo': {
    id: 'shoulder-movement-demo',
    slug: 'shoulder-movement-demo',
    name: 'Shoulder Retraction / Movement',
    requiredJoints: [11, 12, 13, 14, 15, 16],
    importantAngles: [
      'leftShoulder',
      'rightShoulder',
      'leftElbow',
      'rightElbow'
    ],
    similarityWeights: {
      landmark: 0.3,
      angle: 0.5,
      temporal: 0.2
    },
    thresholds: {
      warning: 15,
      incorrect: 30
    },
    repCounting: {
      enabled: false,
      primaryJoint: 'leftShoulder',
      restAngle: 30,
      peakAngle: 90,
      threshold: 15
    }
  },
  'sit-to-stand-demo': {
    id: 'sit-to-stand-demo',
    slug: 'sit-to-stand-demo',
    name: 'Sit to Stand',
    requiredJoints: [11, 12, 23, 24, 25, 26, 27, 28],
    importantAngles: ['leftHip', 'rightHip', 'leftKnee', 'rightKnee'],
    similarityWeights: {
      landmark: 0.25,
      angle: 0.55,
      temporal: 0.2
    },
    repCounting: { enabled: false }
  },
  'seated-knee-demo': {
    id: 'seated-knee-demo',
    slug: 'seated-knee-demo',
    name: 'Seated Knee Extension',
    requiredJoints: [23, 24, 25, 26, 27, 28],
    importantAngles: ['leftKnee', 'rightKnee'],
    similarityWeights: {
      landmark: 0.2,
      angle: 0.6,
      temporal: 0.2
    },
    thresholds: {
      warning: 15,
      incorrect: 25
    },
    repCounting: {
      enabled: false,
      primaryJoint: 'rightKnee',
      restAngle: 90,
      peakAngle: 170,
      threshold: 15
    }
  },
  'squat-research-demo': {
    id: 'squat-research-demo',
    slug: 'squat-research-demo',
    name: 'Squat Exercise',
    requiredJoints: [11, 12, 23, 24, 25, 26, 27, 28],
    importantAngles: ['leftHip', 'rightHip', 'leftKnee', 'rightKnee'],
    similarityWeights: {
      landmark: 0.3,
      angle: 0.5,
      temporal: 0.2
    },
    thresholds: {
      warning: 15,
      incorrect: 30
    },
    repCounting: {
      enabled: false,
      primaryJoint: 'leftKnee',
      restAngle: 170,
      peakAngle: 95,
      threshold: 20
    }
  },
  'arm-abduction-research-demo': {
    id: 'arm-abduction-research-demo',
    slug: 'arm-abduction-research-demo',
    name: 'Arm Abduction',
    requiredJoints: [11, 12, 13, 14, 15, 16, 23, 24],
    importantAngles: [
      'leftShoulder',
      'rightShoulder',
      'leftElbow',
      'rightElbow'
    ],
    similarityWeights: {
      landmark: 0.3,
      angle: 0.5,
      temporal: 0.2
    },
    thresholds: {
      warning: 15,
      incorrect: 30
    },
    repCounting: {
      enabled: false,
      primaryJoint: 'leftShoulder',
      restAngle: 20,
      peakAngle: 160,
      threshold: 20
    }
  }
}

export function getExerciseConfig(exerciseSlug: string): ExerciseConfig {
  return (
    EXERCISE_CONFIGS[exerciseSlug] ?? {
      id: exerciseSlug,
      slug: exerciseSlug,
      name: exerciseSlug,
      requiredJoints: [11, 12, 13, 14, 15, 16, 23, 24, 25, 26],
      importantAngles: [
        'leftShoulder',
        'rightShoulder',
        'leftElbow',
        'rightElbow',
        'leftKnee',
        'rightKnee'
      ],
      similarityWeights: {
        landmark: 0.3,
        angle: 0.5,
        temporal: 0.2
      },
      repCounting: {
        enabled: false
      }
    }
  )
}

/**
 * Local storage / cache helper for saving and retrieving generated Reference Movement Models
 */
const STORAGE_PREFIX = 'kineguide_ref_model_'

export function saveReferenceModelToStorage(
  model: ReferenceMovementModel
): void {
  try {
    localStorage.setItem(
      `${STORAGE_PREFIX}${model.exerciseSlug}`,
      JSON.stringify(model)
    )
  } catch (error) {
    console.error('Failed to save reference model to localStorage', error)
  }
}

export function loadReferenceModelFromStorage(
  exerciseSlug: string
): ReferenceMovementModel | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${exerciseSlug}`)
    if (!raw) return null
    return JSON.parse(raw) as ReferenceMovementModel
  } catch {
    return null
  }
}

export function getAllStoredReferenceModels(): ReferenceMovementModel[] {
  const models: ReferenceMovementModel[] = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(STORAGE_PREFIX)) {
        const raw = localStorage.getItem(key)
        if (raw) {
          models.push(JSON.parse(raw))
        }
      }
    }
  } catch {
    // Ignore storage reading errors
  }
  return models
}
