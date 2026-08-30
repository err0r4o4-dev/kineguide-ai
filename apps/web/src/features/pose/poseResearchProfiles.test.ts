import {
  researchProfileForExercise,
  SHOULDER_FRONT_RESEARCH_PROFILE
} from './poseResearchProfiles'

describe('pose research profiles', () => {
  it('registers the cited method only for its supported shoulder scope', () => {
    expect(researchProfileForExercise('shoulder-movement-demo')).toBe(
      SHOULDER_FRONT_RESEARCH_PROFILE
    )
    expect(researchProfileForExercise('sit-to-stand-demo')).toBeNull()
  })

  it('cannot be mistaken for a released clinical rule', () => {
    expect(SHOULDER_FRONT_RESEARCH_PROFILE).toMatchObject({
      releaseStatus: 'research_only',
      referenceSequenceStatus: 'missing_clinician_reference',
      requiredView: 'front'
    })
  })
})
