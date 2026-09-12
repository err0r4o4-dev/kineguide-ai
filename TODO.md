# TODO

## Flow Migration: Real-Time Posture Monitoring

### Phase 1: Delete old files
- [x] Delete old route pages: AssessmentPage, EducationalClinicalFlowPage, ExerciseLibraryPage, ExerciseDetailPage, PlanPage, HealthProfileOnboardingPage, ReferenceManagementPage, ExerciseImages.test
- [x] Delete old feature files: ActivityDemonstration, ExerciseIllustration, HealthProfileRoute
- [x] Remove empty feature directories

### Phase 2: Update services & i18n
- [x] Update services/product.ts — remove old types and API functions
- [x] Update lib/i18n.ts — replace old copy with posture monitoring copy

### Phase 3: Update routing & navigation
- [x] Update App.tsx — new route tree
- [x] Update AppShell.tsx — new navigation links
- [x] Create CalibrationPage.tsx

### Phase 4: Refactor pages
- [x] Refactor LandingPage.tsx
- [x] Refactor DashboardPage.tsx
- [x] Refactor CameraSetupPage.tsx
- [x] Refactor LiveSessionPage.tsx
- [x] Refactor SessionSummaryPage.tsx
- [x] Refactor ProgressPage.tsx (→ Analytics)
- [x] Update ProfilePage.tsx
- [x] Update ConsentPage.tsx
- [x] Update NotificationsPage.tsx
- [x] Update SettingsPage.tsx

### Phase 5: Tests
- [x] Update all affected tests
- [x] Create CalibrationPage.test.tsx

### Phase 6: Verification
- [ ] Run format:check, lint, typecheck, test, build (Blocked by sandbox bash)
- [x] Final diff review and git status
