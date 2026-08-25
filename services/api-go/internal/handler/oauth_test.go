package handler

import (
	"context"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"net/url"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/kineguide-ai/kineguide-ai/services/api-go/internal/config"
	"github.com/kineguide-ai/kineguide-ai/services/api-go/internal/oauthprovider"
	"github.com/kineguide-ai/kineguide-ai/services/api-go/internal/product"
	"github.com/kineguide-ai/kineguide-ai/services/api-go/internal/security"
)

type stubOAuthProvider struct {
	identity  oauthprovider.Identity
	exchanges int
}

func (p *stubOAuthProvider) Name() string { return oauthprovider.Google }
func (p *stubOAuthProvider) AuthorizationURL(state, nonce, challenge string) string {
	values := url.Values{"state": {state}, "nonce": {nonce}, "code_challenge": {challenge}}
	return "https://provider.example/authorize?" + values.Encode()
}
func (p *stubOAuthProvider) Exchange(context.Context, string, string, string) (oauthprovider.Identity, error) {
	p.exchanges++
	return p.identity, nil
}

type oauthStore struct {
	product.Store
	created     bool
	refreshHash string
}

func (s *oauthStore) UserByAuthIdentity(context.Context, string, string) (product.User, error) {
	return product.User{}, product.ErrNotFound
}
func (s *oauthStore) UserByEmail(context.Context, string) (product.User, error) {
	return product.User{}, product.ErrNotFound
}
func (s *oauthStore) CreateOAuthUser(_ context.Context, email, displayName, _, _ string) (product.User, error) {
	s.created = true
	return product.User{ID: "1af854ea-56cf-4e98-b7bb-93d347275568", Email: email, DisplayName: displayName, CreatedAt: time.Now().UTC()}, nil
}
func (s *oauthStore) SaveRefreshToken(_ context.Context, _, tokenHash string, _ time.Time) error {
	s.refreshHash = tokenHash
	return nil
}

func oauthTestRouter(t *testing.T, store product.Store, provider oauthprovider.Provider) http.Handler {
	t.Helper()
	signer, err := security.NewTokenSigner("test-secret-with-at-least-thirty-two-characters")
	require.NoError(t, err)
	cfg := config.Config{
		Environment: "test", Version: "0.2.0", RequestTimeout: time.Second,
		AccessTokenTTL: time.Minute, RefreshTokenTTL: time.Hour,
		OAuthWebRedirectURL: "http://localhost:5173/auth/callback",
	}
	return NewRouter(cfg, Dependencies{
		Store: store, Signer: signer,
		OAuthProviders: map[string]oauthprovider.Provider{oauthprovider.Google: provider},
	}, slog.New(slog.NewTextHandler(io.Discard, nil)))
}

func TestOAuthLoginCreatesSessionWithoutExposingProviderToken(t *testing.T) {
	store := &oauthStore{}
	provider := &stubOAuthProvider{identity: oauthprovider.Identity{
		Provider: oauthprovider.Google, Subject: "provider-user-1", Email: "oauth@example.com", DisplayName: "OAuth User",
	}}
	router := oauthTestRouter(t, store, provider)

	startResponse := httptest.NewRecorder()
	router.ServeHTTP(startResponse, httptest.NewRequest(http.MethodGet, "/v1/auth/oauth/google/start", nil))
	require.Equal(t, http.StatusFound, startResponse.Code)
	providerURL, err := url.Parse(startResponse.Header().Get("Location"))
	require.NoError(t, err)
	var stateCookie *http.Cookie
	for _, cookie := range startResponse.Result().Cookies() {
		if cookie.Name == oauthCookieName {
			stateCookie = cookie
		}
	}
	require.NotNil(t, stateCookie)
	assert.True(t, stateCookie.HttpOnly)

	callback := httptest.NewRequest(http.MethodGet, "/v1/auth/oauth/google/callback?code=one-time-code&state="+url.QueryEscape(providerURL.Query().Get("state")), nil)
	callback.AddCookie(stateCookie)
	callbackResponse := httptest.NewRecorder()
	router.ServeHTTP(callbackResponse, callback)

	require.Equal(t, http.StatusSeeOther, callbackResponse.Code)
	assert.Equal(t, "http://localhost:5173/auth/callback?mode=login&provider=google", callbackResponse.Header().Get("Location"))
	assert.True(t, store.created)
	assert.NotEmpty(t, store.refreshHash)
	assert.NotContains(t, callbackResponse.Body.String(), "one-time-code")
	assert.NotContains(t, callbackResponse.Body.String(), "provider-user-1")
}

func TestOAuthCallbackRejectsMismatchedStateBeforeExchange(t *testing.T) {
	store := &oauthStore{}
	provider := &stubOAuthProvider{}
	router := oauthTestRouter(t, store, provider)
	startResponse := httptest.NewRecorder()
	router.ServeHTTP(startResponse, httptest.NewRequest(http.MethodGet, "/v1/auth/oauth/google/start", nil))
	var stateCookie *http.Cookie
	for _, cookie := range startResponse.Result().Cookies() {
		if cookie.Name == oauthCookieName {
			stateCookie = cookie
		}
	}
	require.NotNil(t, stateCookie)

	callback := httptest.NewRequest(http.MethodGet, "/v1/auth/oauth/google/callback?code=code&state=wrong", nil)
	callback.AddCookie(stateCookie)
	response := httptest.NewRecorder()
	router.ServeHTTP(response, callback)

	require.Equal(t, http.StatusSeeOther, response.Code)
	assert.Contains(t, response.Header().Get("Location"), "error=state_invalid")
	assert.Zero(t, provider.exchanges)
}
