import { http } from './http'

export interface User {
  id: string
  email: string
  display_name: string
  created_at: string
}

export interface AuthResponse {
  access_token: string
  expires_in: number
  user: User
}

export type OAuthProvider = 'google' | 'facebook'

export interface OAuthProviderAvailability {
  provider: OAuthProvider
  enabled: boolean
}

export interface AuthIdentity {
  provider: OAuthProvider
  created_at: string
}

export interface Consent {
  id: string
  policy_version: string
  camera_processing: boolean
  session_summary_storage: boolean
  ai_chat_storage: boolean
  research_use: boolean
  accepted_at: string
  revoked_at: string | null
}

export type AssessmentConcernArea =
  'lower_back' | 'knee' | 'shoulder' | 'general_mobility' | 'prefer_not_to_say'
export type AssessmentDurationBand =
  'lt_week' | 'one_to_four_weeks' | 'gt_four_weeks' | 'unsure'
export type AssessmentDailyImpact =
  'none' | 'some' | 'much' | 'prefer_not_to_say'
export type AssessmentGoal = 'understand' | 'camera_demo' | 'track_activity'

export interface AssessmentInput {
  concern_area: AssessmentConcernArea
  duration_band: AssessmentDurationBand
  daily_impact: AssessmentDailyImpact
  goal: AssessmentGoal
}

export interface Assessment extends AssessmentInput {
  id: string
  status: 'captured_not_evaluated'
  created_at: string
  retention_until: string
}

export type HealthProfileSex = 'female' | 'male' | 'unspecified'
export type HealthProfileCareArea =
  'lower_back' | 'knee' | 'shoulder' | 'general_mobility' | 'prefer_not_to_say'
export type HealthProfileAssistiveDevice =
  'none' | 'cane' | 'walker' | 'wheelchair' | 'other'
export type HealthProfileWarningSign =
  | 'chest_pain'
  | 'shortness_of_breath'
  | 'dizziness_or_fainting'
  | 'weakness_or_severe_fatigue'
  | 'severe_pain'
  | 'none'
export type HealthProfileGoal =
  | 'strength'
  | 'balance_fall_prevention'
  | 'flexibility'
  | 'daily_activity'
  | 'progress'
export type HealthProfileActivityLevel = 'low' | 'moderate' | 'regular'
export type HealthProfilePreferredTime = 'morning' | 'afternoon' | 'evening'
export type HealthProfileEquipment =
  'chair' | 'mat' | 'resistance_band' | 'none'
export type HealthProfileCameraPreference = 'front' | 'rear'

export interface HealthProfileInput {
  birth_date: string
  sex: HealthProfileSex
  height_cm: number
  weight_kg: number
  track_weight: boolean
  care_areas: HealthProfileCareArea[]
  recent_injury: boolean
  clinician_managed: boolean
  assistive_device: HealthProfileAssistiveDevice
  warning_signs: HealthProfileWarningSign[]
  goals: HealthProfileGoal[]
  activity_level: HealthProfileActivityLevel
  preferred_time: HealthProfilePreferredTime
  equipment: HealthProfileEquipment[]
  camera_preference: HealthProfileCameraPreference
  activity_notifications: boolean
  notes: string
  profile_storage_consent: true
}

export interface HealthProfile extends Omit<
  HealthProfileInput,
  'profile_storage_consent'
> {
  id: string
  status: 'captured_not_evaluated'
  consent_version: 'health-profile-v1'
  consented_at: string
  created_at: string
  updated_at: string
  retention_until: string
}

export const CURRENT_CONSENT_POLICY_VERSION = 'prototype-v3'

export interface Exercise {
  slug: string
  title_th: string
  title_en: string
  category: 'lower_body' | 'upper_body'
  review_status: 'pending_clinical_review'
}

export type ClinicalReviewStatus =
  'draft' | 'pending_clinical_review' | 'approved' | 'rejected' | 'archived'

export interface ClinicalMetadata {
  id: string
  version: string
  locale: 'th' | 'en'
  reviewStatus: ClinicalReviewStatus
  demoOnly: boolean
  notForClinicalUse: boolean
  reviewedBy: string | null
  reviewedAt: string | null
  sourceReferences: string[]
  lastUpdatedAt: string
}

export interface ScreeningQuestion extends ClinicalMetadata {
  prompt: string
  options: Array<{ id: string; label: string }>
}

export interface RedFlagPlaceholder extends ClinicalMetadata {
  triggerOptionId: string
  label: string
}

export interface EducationalExercise extends ClinicalMetadata {
  slug: string
  title: string
  description: string
}

export interface ClinicalPlaceholder extends ClinicalMetadata {
  label: string
  triggerOptionId?: string
}

export interface ClinicalReference extends ClinicalMetadata {
  title: string
  url: string | null
}

export interface EducationalClinicalCatalog {
  reviewWorkflow: ClinicalReviewStatus[]
  screeningQuestions: ScreeningQuestion[]
  redFlags: RedFlagPlaceholder[]
  exercises: EducationalExercise[]
  contraindications: ClinicalPlaceholder[]
  stopConditions: ClinicalPlaceholder[]
  clinicalReferences: ClinicalReference[]
}

export interface EducationalScreeningResult {
  outcome: 'stopped_demo_placeholder' | 'demo_exercises_available'
  message: string
  demoOnly: true
  notForClinicalUse: true
  exercises: EducationalExercise[]
}

export interface TechnicalPoseFeedback {
  status: 'completed'
  movement_phase: 'unavailable'
  repetition_count: null
  confidence_score: number | null
  camera_feedback:
    | 'waiting_for_camera'
    | 'camera_ready'
    | 'adjust_camera'
    | 'multiple_people_detected'
    | 'unsupported_exercise'
    | 'technical_analysis_unavailable'
}

export interface ActivityPlanDay {
  day: number
  exercises: Exercise[]
}

export interface ActivityPlan {
  plan_type: 'demo_exploration'
  review_status: 'pending_clinical_review'
  personalized: false
  duration_days: 7
  days: ActivityPlanDay[]
}

export interface ExerciseSession {
  id: string
  exercise_slug: string
  status: 'active' | 'completed' | 'stopped'
  camera_used: boolean
  manual_repetitions: number
  elapsed_seconds: number
  started_at: string
  completed_at: string | null
  retention_until: string
}

export interface Dashboard {
  completed_sessions: number
  current_streak: number
  total_seconds: number
  recent_sessions: ExerciseSession[]
}

export interface Conversation {
  id: string
  title: string
  locale: 'th' | 'en'
  created_at: string
  updated_at: string
  retention_policy: 'until_deleted'
}

export interface ConversationMessage {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export async function registerAccount(input: {
  email: string
  password: string
  display_name: string
}) {
  const response = await http.post<AuthResponse>('/auth/register', input)
  return response.data
}

export async function loginAccount(input: { email: string; password: string }) {
  const response = await http.post<AuthResponse>('/auth/login', input)
  return response.data
}

export async function refreshAccount() {
  const response = await http.post<AuthResponse>('/auth/refresh')
  return response.data
}

export async function logoutAccount() {
  await http.post('/auth/logout')
}

export async function getOAuthProviders() {
  const response = await http.get<{
    providers: OAuthProviderAvailability[]
  }>('/auth/providers')
  return response.data
}

export function getOAuthLoginURL(provider: OAuthProvider) {
  return `${http.defaults.baseURL?.replace(/\/$/, '') ?? '/v1'}/auth/oauth/${provider}/start`
}

export async function getAuthIdentities(signal?: AbortSignal) {
  const response = await http.get<{ identities: AuthIdentity[] }>(
    '/me/auth-identities',
    { signal }
  )
  return response.data.identities
}

export async function startAuthIdentityLink(provider: OAuthProvider) {
  const response = await http.post<{ authorization_url: string }>(
    `/me/auth-identities/${provider}/start`
  )
  return response.data.authorization_url
}

export async function deleteAuthIdentity(provider: OAuthProvider) {
  await http.delete(`/me/auth-identities/${provider}`)
}

export async function deleteAccount() {
  await http.delete('/me')
}

export async function getCurrentUser(signal?: AbortSignal) {
  const response = await http.get<User>('/me', { signal })
  return response.data
}

export async function getConsent(signal?: AbortSignal) {
  const response = await http.get<{ consent: Consent | null }>(
    '/consents/current',
    { signal }
  )
  return response.data.consent
}

export async function saveConsent(input: {
  camera_processing: boolean
  session_summary_storage: boolean
  ai_chat_storage: boolean
  research_use: boolean
}) {
  const response = await http.post<Consent>('/consents', input)
  return response.data
}

export async function getConversations(signal?: AbortSignal) {
  const response = await http.get<{ conversations: Conversation[] }>(
    '/conversations',
    { signal }
  )
  return response.data.conversations
}

export async function createConversation(input: { locale: 'th' | 'en' }) {
  const response = await http.post<Conversation>('/conversations', input)
  return response.data
}

export async function deleteConversation(id: string) {
  await http.delete(`/conversations/${id}`)
}

export async function getConversationMessages(
  id: string,
  signal?: AbortSignal
) {
  const response = await http.get<{ messages: ConversationMessage[] }>(
    `/conversations/${id}/messages`,
    { signal }
  )
  return response.data.messages
}

export async function sendConversationMessage(
  id: string,
  input: { content: string }
) {
  const response = await http.post<{ messages: ConversationMessage[] }>(
    `/conversations/${id}/messages`,
    input
  )
  return response.data.messages
}

export async function revokeConsent() {
  await http.delete('/consents/current')
}

export async function getLatestAssessment(signal?: AbortSignal) {
  const response = await http.get<{ assessment: Assessment | null }>(
    '/assessments/latest',
    { signal }
  )
  return response.data.assessment
}

export async function saveAssessment(input: AssessmentInput) {
  const response = await http.post<Assessment>('/assessments', input)
  return response.data
}

export async function getHealthProfile(signal?: AbortSignal) {
  const response = await http.get<{ profile: HealthProfile | null }>(
    '/health-profile',
    { signal }
  )
  return response.data.profile
}

export async function saveHealthProfile(input: HealthProfileInput) {
  const response = await http.put<HealthProfile>('/health-profile', input)
  return response.data
}

export async function deleteHealthProfile() {
  await http.delete('/health-profile')
}

export async function getExercises(signal?: AbortSignal) {
  const response = await http.get<{ exercises: Exercise[] }>('/exercises', {
    signal
  })
  return response.data.exercises
}

export async function getEducationalClinicalCatalog(
  locale: 'th' | 'en',
  signal?: AbortSignal
) {
  const response = await http.get<EducationalClinicalCatalog>(
    '/educational-clinical-flow/catalog',
    { params: { locale }, signal }
  )
  return response.data
}

export async function evaluateEducationalScreening(input: {
  locale: 'th' | 'en'
  answers: Array<{ questionId: string; optionId: string }>
}) {
  const response = await http.post<EducationalScreeningResult>(
    '/educational-clinical-flow/evaluate',
    input
  )
  return response.data
}

export async function getExercise(slug: string, signal?: AbortSignal) {
  const response = await http.get<Exercise>(`/exercises/${slug}`, { signal })
  return response.data
}

export async function getActivityPlan(signal?: AbortSignal) {
  const response = await http.get<ActivityPlan>('/activity-plan', { signal })
  return response.data
}

export async function getDashboard(signal?: AbortSignal) {
  const response = await http.get<Dashboard>('/dashboard', { signal })
  return response.data
}

export async function getSessions(signal?: AbortSignal) {
  const response = await http.get<{ sessions: ExerciseSession[] }>(
    '/sessions',
    {
      signal
    }
  )
  return response.data.sessions
}

export async function getSession(id: string, signal?: AbortSignal) {
  const response = await http.get<ExerciseSession>(`/sessions/${id}`, {
    signal
  })
  return response.data
}

export async function createSession(input: {
  exercise_slug: string
  camera_used: boolean
}) {
  const response = await http.post<ExerciseSession>('/sessions', input)
  return response.data
}

export async function updateSession(
  id: string,
  input: Pick<
    ExerciseSession,
    'status' | 'manual_repetitions' | 'elapsed_seconds'
  >
) {
  const response = await http.patch<ExerciseSession>(`/sessions/${id}`, input)
  return response.data
}

export async function getTechnicalPoseFeedback(
  id: string,
  input: {
    pose_status: string
    landmark_visibility: number[]
  }
) {
  const response = await http.post<TechnicalPoseFeedback>(
    `/sessions/${id}/technical-feedback`,
    input
  )
  return response.data
}
