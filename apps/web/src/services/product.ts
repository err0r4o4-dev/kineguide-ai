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

export const CURRENT_CONSENT_POLICY_VERSION = 'prototype-v3'

export interface Exercise {
  slug: string
  title_th: string
  title_en: string
  category: 'lower_body' | 'upper_body'
  review_status: 'pending_clinical_review'
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

export async function getExercises(signal?: AbortSignal) {
  const response = await http.get<{ exercises: Exercise[] }>('/exercises', {
    signal
  })
  return response.data.exercises
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
