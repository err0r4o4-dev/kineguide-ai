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
	request := httptest.NewRequest(http.MethodPost, "/api/v1/auth/register", strings.NewReader(`{"email":"demo@example.com","password":"long-demo-password","display_name":"Demo User"}`))
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
	request := httptest.NewRequest(http.MethodGet, "/api/v1/me", nil)
	response := httptest.NewRecorder()

	router.ServeHTTP(response, request)

	assert.Equal(t, http.StatusUnauthorized, response.Code)
	assert.Contains(t, response.Body.String(), `"code":"AUTH_REQUIRED"`)
}
