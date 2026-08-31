import type { PoseResearchProfile } from './poseSimilarity'

export interface RegisteredPoseResearchProfile extends PoseResearchProfile {
  exerciseSlug: string
  requiredView: 'front'
  referenceSequenceStatus: 'missing_clinician_reference'
  evidenceScope: string
  limitations: readonly string[]
}

// This profile records a reproducible research method, not an enabled clinical
// rule. The cited paper did not publish KineGuide-compatible landmark reference
// sequences, so comparison remains unavailable until a physiotherapist supplies
// and approves a purpose-recorded reference asset.
export const SHOULDER_FRONT_RESEARCH_PROFILE: RegisteredPoseResearchProfile = {
  id: 'shoulder-front-cosine-dtw-v1',
  exerciseSlug: 'shoulder-movement-demo',
  sourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10781250/',
  method: 'cosine_dtw',
  researchSimilarityThreshold: 0.9,
  releaseStatus: 'research_only',
  requiredView: 'front',
  referenceSequenceStatus: 'missing_clinician_reference',
  evidenceScope:
    'Six head, trunk, and shoulder movements compared with frontal smartphone video and motion capture.',
  limitations: [
    'The study included 15 volunteers and excluded relevant musculoskeletal and neurological conditions.',
    'The reported threshold is study-specific and is not validated for the other KineGuide exercises.',
    'The study calls for larger, more diverse samples and evaluation of additional camera views.',
    'A research similarity measurement is not proof of safe or clinically correct movement.'
  ]
}

export function researchProfileForExercise(
  exerciseSlug: string
): RegisteredPoseResearchProfile | null {
  return exerciseSlug === SHOULDER_FRONT_RESEARCH_PROFILE.exerciseSlug
    ? SHOULDER_FRONT_RESEARCH_PROFILE
    : null
}
