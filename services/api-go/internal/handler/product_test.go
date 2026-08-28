package handler

import (
	"context"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/kineguide-ai/kineguide-ai/services/api-go/internal/config"
	"github.com/kineguide-ai/kineguide-ai/services/api-go/internal/product"
	"github.com/kineguide-ai/kineguide-ai/services/api-go/internal/security"
)

type registrationStore struct {
	product.Store
	refreshHash string
}

type healthProfileStore struct {
	product.Store
	saved product.HealthProfile
}

func (s *healthProfileStore) LatestConsent(context.Context, string) (product.Consent, error) {
	return product.Consent{
		ID:                    "7ce4f8ca-aa3b-4dfc-8bbd-a584e3b26da4",
		PolicyVersion:         product.CurrentConsentPolicyVersion,
		CameraProcessing:      true,
		SessionSummaryStorage: true,
	}, nil
}

func (s *healthProfileStore) SaveHealthProfile(_ context.Context, profile product.HealthProfile) (product.HealthProfile, error) {
	s.saved = profile
	profile.ID = "7ce4f8ca-aa3b-4dfc-8bbd-a584e3b26da5"
	profile.Status = "captured_not_evaluated"
	profile.ConsentedAt = time.Date(2026, 8, 28, 9, 0, 0, 0, time.UTC)
	profile.CreatedAt = profile.ConsentedAt
	profile.UpdatedAt = profile.ConsentedAt
	profile.RetentionUntil = profile.ConsentedAt.Add(365 * 24 * time.Hour)
	return profile, nil
}

func (s *registrationStore) CreateUser(_ context.Context, email, passwordHash, displayName string) (product.User, error) {
	return product.User{ID: "1af854ea-56cf-4e98-b7bb-93d347275568", Email: email, DisplayName: displayName, PasswordHash: passwordHash, CreatedAt: time.Now().UTC()}, nil
}

func (s *registrationStore) SaveRefreshToken(_ context.Context, _, tokenHash string, _ time.Time) error {
	s.refreshHash = tokenHash
	return nil
}

func (s *registrationStore) DeleteUser(context.Context, string) error { return nil }

func TestRegisterCreatesShortLivedAccessAndHTTPOnlyRefreshSession(t *testing.T) {
	store := &registrationStore{}
	signer, err := security.NewTokenSigner("test-secret-with-at-least-thirty-two-characters")
	require.NoError(t, err)
	cfg := config.Config{
		Environment: "test", Version: "0.2.0", Port: "8080",
		DatabaseURL: "postgres://localhost/test", AIServiceURL: "http://localhost:8001",
		CORSAllowedOrigins: []string{"http://localhost:5173"}, RequestTimeout: time.Second,
		ShutdownTimeout: time.Second, JWTSecret: "test-secret-with-at-least-thirty-two-characters",
		AccessTokenTTL: 15 * time.Minute, RefreshTokenTTL: 24 * time.Hour,
	}
	router := NewRouter(cfg, Dependencies{Store: store, Signer: signer}, slog.New(slog.NewTextHandler(io.Discard, nil)))
	request := httptest.NewRequest(http.MethodPost, "/v1/auth/register", strings.NewReader(`{"email":"demo@example.com","password":"long-demo-password","display_name":"Demo User"}`))
	request.Header.Set("Content-Type", "application/json")
	response := httptest.NewRecorder()

	router.ServeHTTP(response, request)

	require.Equal(t, http.StatusCreated, response.Code)
	assert.Contains(t, response.Body.String(), `"access_token"`)
	assert.NotEmpty(t, store.refreshHash)
	assert.Contains(t, response.Header().Get("Set-Cookie"), "HttpOnly")
	assert.NotContains(t, response.Body.String(), "long-demo-password")
}

func TestProtectedRouteDeniesMissingAccessToken(t *testing.T) {
	store := &registrationStore{}
	signer, err := security.NewTokenSigner("test-secret-with-at-least-thirty-two-characters")
	require.NoError(t, err)
	cfg := config.Config{Environment: "test", Version: "0.2.0", RequestTimeout: time.Second, ShutdownTimeout: time.Second, AccessTokenTTL: time.Minute, RefreshTokenTTL: time.Hour}
	router := NewRouter(cfg, Dependencies{Store: store, Signer: signer}, slog.New(slog.NewTextHandler(io.Discard, nil)))
	request := httptest.NewRequest(http.MethodGet, "/v1/me", nil)
	response := httptest.NewRecorder()

	router.ServeHTTP(response, request)

	assert.Equal(t, http.StatusUnauthorized, response.Code)
	assert.Contains(t, response.Body.String(), `"code":"AUTH_REQUIRED"`)
}

func TestValidHealthProfileAcceptsBoundedSelfReportedData(t *testing.T) {
	valid := product.HealthProfile{
		BirthDate: "2000-01-02", Sex: "unspecified", HeightCM: 170, WeightKG: 60,
		TrackWeight: true, CareAreas: []string{"lower_back", "general_mobility"},
		RecentInjury: false, ClinicianManaged: false, AssistiveDevice: "none",
		WarningSigns: []string{"none"}, Goals: []string{"strength", "progress"},
		ActivityLevel: "moderate", PreferredTime: "morning",
		Equipment: []string{"chair", "mat"}, CameraPreference: "front",
		ActivityNotifications: true, Notes: "Synthetic test note", ProfileStorageConsent: true,
	}

	require.True(t, validHealthProfile(valid))

	tests := []struct {
		name   string
		mutate func(*product.HealthProfile)
	}{
		{name: "future birth date", mutate: func(profile *product.HealthProfile) { profile.BirthDate = "2999-01-01" }},
		{name: "missing consent", mutate: func(profile *product.HealthProfile) { profile.ProfileStorageConsent = false }},
		{name: "none mixed with warning", mutate: func(profile *product.HealthProfile) { profile.WarningSigns = []string{"none", "chest_pain"} }},
		{name: "none mixed with equipment", mutate: func(profile *product.HealthProfile) { profile.Equipment = []string{"none", "chair"} }},
		{name: "long notes", mutate: func(profile *product.HealthProfile) { profile.Notes = strings.Repeat("ก", 301) }},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			profile := valid
			tt.mutate(&profile)
			assert.False(t, validHealthProfile(profile))
		})
	}
}

func TestPutHealthProfileStoresOnlyForAuthenticatedOwner(t *testing.T) {
	const userID = "d4097457-7bd9-4e02-884d-78259b043973"
	store := &healthProfileStore{}
	signer, err := security.NewTokenSigner("test-secret-with-at-least-thirty-two-characters")
	require.NoError(t, err)
	token, err := signer.Sign(userID, "access", time.Minute)
	require.NoError(t, err)
	cfg := config.Config{
		Environment: "test", Version: "0.2.0", RequestTimeout: time.Second,
		ShutdownTimeout: time.Second, AccessTokenTTL: time.Minute, RefreshTokenTTL: time.Hour,
	}
	router := NewRouter(cfg, Dependencies{Store: store, Signer: signer}, slog.New(slog.NewTextHandler(io.Discard, nil)))
	body := `{
		"birth_date":"2000-01-02","sex":"unspecified","height_cm":170,"weight_kg":60,
		"track_weight":true,"care_areas":["lower_back","general_mobility"],
		"recent_injury":false,"clinician_managed":false,"assistive_device":"none",
		"warning_signs":["none"],"goals":["strength","progress"],
		"activity_level":"moderate","preferred_time":"morning","equipment":["chair","mat"],
		"camera_preference":"front","activity_notifications":true,"notes":"Synthetic test note","profile_storage_consent":true
	}`
	request := httptest.NewRequest(http.MethodPut, "/v1/health-profile", strings.NewReader(body))
	request.Header.Set("Authorization", "Bearer "+token)
	request.Header.Set("Content-Type", "application/json")
	response := httptest.NewRecorder()

	router.ServeHTTP(response, request)

	require.Equal(t, http.StatusOK, response.Code)
	assert.Equal(t, userID, store.saved.UserID)
	assert.Equal(t, product.HealthProfileConsentVersion, store.saved.ConsentVersion)
	assert.False(t, store.saved.ProfileStorageConsent)
	assert.Contains(t, response.Body.String(), `"status":"captured_not_evaluated"`)
	assert.NotContains(t, response.Body.String(), "profile_storage_consent")
}
