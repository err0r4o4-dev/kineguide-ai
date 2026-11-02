package handler

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/jackc/pgx/v5/pgconn"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/kineguide-ai/kineguide-ai/services/api-go/internal/config"
	"github.com/kineguide-ai/kineguide-ai/services/api-go/internal/product"
	"github.com/kineguide-ai/kineguide-ai/services/api-go/internal/security"
)

type currentConsentStore struct {
	product.Store
	consent product.Consent
	err     error
	userID  string
}

func (s *currentConsentStore) LatestConsent(_ context.Context, userID string) (product.Consent, error) {
	s.userID = userID
	return s.consent, s.err
}

func TestCurrentConsentFailureDiagnosticsAreRedacted(t *testing.T) {
	const sensitive = "synthetic-secret-and-private-payload"
	tests := []struct {
		name     string
		err      error
		sqlState string
	}{
		{name: "database failure", err: fmt.Errorf("lookup: %w", &pgconn.PgError{Code: "42703", Message: sensitive, Detail: sensitive}), sqlState: "42703"},
		{name: "unknown failure", err: errors.New(sensitive)},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			store := &currentConsentStore{err: test.err}
			var logs bytes.Buffer
			signer, err := security.NewTokenSigner("test-secret-with-at-least-thirty-two-characters")
			require.NoError(t, err)
			token, err := signer.Sign("00000000-0000-0000-0000-000000000001", "access", time.Minute)
			require.NoError(t, err)
			router := NewRouter(config.Config{Environment: "test", RequestTimeout: time.Second}, Dependencies{Store: store, Signer: signer}, slog.New(slog.NewJSONHandler(&logs, nil)))
			request := httptest.NewRequest(http.MethodGet, "/v1/consents/current", nil)
			request.Header.Set("Authorization", "Bearer "+token)
			request.Header.Set("X-Request-ID", "consent-diagnostic-test")
			response := httptest.NewRecorder()
			router.ServeHTTP(response, request)

			require.Equal(t, http.StatusInternalServerError, response.Code)
			assert.Contains(t, response.Body.String(), `"code":"INTERNAL_ERROR"`)
			assert.Contains(t, logs.String(), `"msg":"consent_lookup_failed"`)
			assert.Contains(t, logs.String(), `"request_id":"consent-diagnostic-test"`)
			assert.Contains(t, logs.String(), `"error_type":`)
			if test.sqlState != "" {
				assert.Contains(t, logs.String(), `"sqlstate":"42703"`)
			}
			assert.NotContains(t, logs.String(), sensitive)
			assert.NotContains(t, logs.String(), token)
			assert.NotContains(t, logs.String(), store.userID)
			assert.NotContains(t, response.Body.String(), sensitive)
			assert.NotContains(t, response.Body.String(), "42703")
		})
	}
}

func TestCurrentConsentStatesAndAuthorization(t *testing.T) {
	const userID = "00000000-0000-0000-0000-000000000001"
	revokedAt := time.Date(2026, 10, 18, 19, 0, 0, 0, time.UTC)
	tests := []struct {
		name       string
		consent    product.Consent
		err        error
		tokenType  string
		wantStatus int
		wantBody   string
	}{
		{name: "no consent", err: product.ErrNotFound, tokenType: "access", wantStatus: 200, wantBody: `"consent":null`},
		{name: "active consent", consent: product.Consent{ID: "synthetic-consent", UserID: userID, PolicyVersion: "prototype-v3", CameraProcessing: true, SessionSummaryStorage: true}, tokenType: "access", wantStatus: 200, wantBody: `"revoked_at":null`},
		{name: "revoked consent", consent: product.Consent{ID: "synthetic-consent", UserID: userID, RevokedAt: &revokedAt}, tokenType: "access", wantStatus: 200, wantBody: `"revoked_at":"2026-10-18T19:00:00Z"`},
		{name: "missing token", wantStatus: 401, wantBody: `"code":"AUTH_REQUIRED"`},
		{name: "wrong token type", tokenType: "refresh", wantStatus: 401, wantBody: `"code":"AUTH_REQUIRED"`},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			store := &currentConsentStore{consent: test.consent, err: test.err}
			signer, err := security.NewTokenSigner("test-secret-with-at-least-thirty-two-characters")
			require.NoError(t, err)
			router := NewRouter(config.Config{Environment: "test", RequestTimeout: time.Second}, Dependencies{Store: store, Signer: signer}, slog.New(slog.NewTextHandler(io.Discard, nil)))
			request := httptest.NewRequest(http.MethodGet, "/v1/consents/current", nil)
			if test.tokenType != "" {
				token, err := signer.Sign(userID, test.tokenType, time.Minute)
				require.NoError(t, err)
				request.Header.Set("Authorization", "Bearer "+token)
			}
			response := httptest.NewRecorder()
			router.ServeHTTP(response, request)
			require.Equal(t, test.wantStatus, response.Code)
			assert.Contains(t, response.Body.String(), test.wantBody)
			assert.NotContains(t, response.Body.String(), userID)
			if test.wantStatus == http.StatusOK {
				assert.Equal(t, userID, store.userID)
			} else {
				assert.Empty(t, store.userID)
			}
		})
	}
}
