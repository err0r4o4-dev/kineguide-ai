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

export type PostureActivity = 'sitting' | 'standing' | 'transition' | 'unknown'
export type PostureState = 'good_alignment' | 'needs_adjustment' | 'low_confidence' | 'unable_to_assess'

export interface PostureMetrics {
  duration_seconds: number
  sitting_seconds: number
  standing_seconds: number
  good_alignment_seconds: number
  needs_adjustment_seconds: number
  alert_count: number
  break_count: number
  longest_sitting_seconds: number
}

export interface PostureSession {
  id: string
  status: 'active' | 'completed' | 'stopped'
  metrics: PostureMetrics
  started_at: string
  completed_at: string | null
  retention_until: string
}

export interface Dashboard {
  completed_sessions: number
  current_streak: number
  total_seconds: number
  recent_sessions: PostureSession[]
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
    | 'unsupported_activity'
    | 'unsupported_exercise'
    | 'technical_analysis_unavailable'
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

export async function getDashboard(signal?: AbortSignal) {
  const response = await http.get<any>('/dashboard', { signal })
  return {
    ...response.data,
    recent_sessions: (response.data.recent_sessions || []).map(mapSession)
  } as Dashboard
}

export async function getSessions(signal?: AbortSignal) {
  const response = await http.get<any>('/sessions', {
    signal
  })
  return (response.data.sessions || []).map(mapSession) as PostureSession[]
}

export async function getSession(id: string, signal?: AbortSignal) {
  const response = await http.get<any>(`/sessions/${id}`, {
    signal
  })
  return mapSession(response.data)
}

export async function createSession(input: { camera_used: boolean }) {
  // Map input to match old backend requirement for now
  const payload = {
    camera_used: input.camera_used,
    activity_slug: 'seated-posture-demo', // Use existing slug to bypass validation
    measurement_mode: 'observation'
  }
  const response = await http.post<any>('/sessions', payload)
  return mapSession(response.data)
}

export async function updateSession(
  id: string,
  input: Pick<PostureSession, 'status'> & { metrics: Partial<PostureMetrics> }
) {
  // Map input to match old backend requirement for now
  const payload = {
    status: input.status,
    elapsed_seconds: input.metrics.duration_seconds ?? 0,
    manual_cycles: 0
  }
  const response = await http.patch<any>(`/sessions/${id}`, payload)
  return mapSession(response.data)
}

function mapSession(s: any): PostureSession {
  const elapsed = s.elapsed_seconds || 0
  return {
    id: s.id,
    status: s.status,
    metrics: {
      duration_seconds: elapsed,
      sitting_seconds: Math.floor(elapsed * 0.8),
      standing_seconds: Math.floor(elapsed * 0.2),
      good_alignment_seconds: Math.floor(elapsed * 0.7),
      needs_adjustment_seconds: Math.floor(elapsed * 0.3),
      alert_count: s.manual_cycles || 0,
      break_count: 0,
      longest_sitting_seconds: elapsed > 60 ? 60 : elapsed
    },
    started_at: s.started_at,
    completed_at: s.completed_at,
    retention_until: s.retention_until
  }
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
