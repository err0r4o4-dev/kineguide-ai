package handler

import (
	"crypto/sha256"
	"crypto/subtle"
	"encoding/base64"
	"errors"
	"net/http"
	"net/url"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/gin-gonic/gin"

	"github.com/kineguide-ai/kineguide-ai/services/api-go/internal/oauthprovider"
	"github.com/kineguide-ai/kineguide-ai/services/api-go/internal/product"
	"github.com/kineguide-ai/kineguide-ai/services/api-go/internal/security"
)

const (
	oauthCookieName = "kg_oauth"
	oauthStateTTL   = 10 * time.Minute
	oauthModeLogin  = "login"
	oauthModeLink   = "link"
)

type providerAvailability struct {
	Provider string `json:"provider"`
	Enabled  bool   `json:"enabled"`
}

func (a *productAPI) oauthProviders(c *gin.Context) {
	providers := []providerAvailability{
		{Provider: oauthprovider.Google, Enabled: a.providers[oauthprovider.Google] != nil},
		{Provider: oauthprovider.Facebook, Enabled: a.providers[oauthprovider.Facebook] != nil},
	}
	c.JSON(http.StatusOK, gin.H{"providers": providers})
}

func (a *productAPI) oauthStart(c *gin.Context) {
	authorizationURL, err := a.prepareOAuth(c, c.Param("provider"), oauthModeLogin, "")
	if errors.Is(err, product.ErrNotFound) {
		writeError(c, http.StatusNotFound, "OAUTH_PROVIDER_UNAVAILABLE", "This sign-in provider is not available.")
		return
	}
	if err != nil {
		writeError(c, http.StatusInternalServerError, "OAUTH_START_FAILED", "Unable to start social sign-in.")
		return
	}
	c.Redirect(http.StatusFound, authorizationURL)
}

func (a *productAPI) oauthLinkStart(c *gin.Context) {
	authorizationURL, err := a.prepareOAuth(c, c.Param("provider"), oauthModeLink, c.GetString(userIDKey))
	if errors.Is(err, product.ErrNotFound) {
		writeError(c, http.StatusNotFound, "OAUTH_PROVIDER_UNAVAILABLE", "This sign-in provider is not available.")
		return
	}
	if err != nil {
		writeError(c, http.StatusInternalServerError, "OAUTH_START_FAILED", "Unable to start account linking.")
		return
	}
	c.JSON(http.StatusOK, gin.H{"authorization_url": authorizationURL})
}

func (a *productAPI) prepareOAuth(c *gin.Context, providerName, mode, userID string) (string, error) {
	provider := a.providers[providerName]
	if provider == nil {
		return "", product.ErrNotFound
	}
	state, err := randomToken()
	if err != nil {
		return "", err
	}
	nonce, err := randomToken()
	if err != nil {
		return "", err
	}
	verifier, err := randomToken()
	if err != nil {
		return "", err
	}
	signedState, err := a.signer.SignOAuthState(providerName, state, nonce, verifier, mode, userID, oauthStateTTL)
	if err != nil {
		return "", err
	}
	a.setOAuthCookie(c, signedState, int(oauthStateTTL.Seconds()))
	challengeBytes := sha256.Sum256([]byte(verifier))
	challenge := base64.RawURLEncoding.EncodeToString(challengeBytes[:])
	return provider.AuthorizationURL(state, nonce, challenge), nil
}

func (a *productAPI) oauthCallback(c *gin.Context) {
	providerName := c.Param("provider")
	provider := a.providers[providerName]
	if provider == nil {
		a.redirectOAuth(c, "", providerName, "provider_unavailable")
		return
	}
	encodedState, cookieErr := c.Cookie(oauthCookieName)
	a.clearOAuthCookie(c)
	if c.Query("error") != "" {
		state, _ := a.signer.ParseOAuthState(encodedState)
		a.redirectOAuth(c, stateMode(state), providerName, "cancelled")
		return
	}
	if cookieErr != nil {
		a.redirectOAuth(c, "", providerName, "state_invalid")
		return
	}
	state, err := a.signer.ParseOAuthState(encodedState)
	if err != nil || state.Provider != providerName || subtle.ConstantTimeCompare([]byte(state.State), []byte(c.Query("state"))) != 1 {
		a.redirectOAuth(c, stateMode(state), providerName, "state_invalid")
		return
	}
	code := strings.TrimSpace(c.Query("code"))
	if code == "" {
		a.redirectOAuth(c, state.Mode, providerName, "provider_failed")
		return
	}
	identity, err := provider.Exchange(c.Request.Context(), code, state.CodeVerifier, state.Nonce)
	if err != nil || identity.Provider != providerName || identity.Subject == "" {
		a.redirectOAuth(c, state.Mode, providerName, "provider_failed")
		return
	}
	identity.Email = strings.ToLower(strings.TrimSpace(identity.Email))
	identity.DisplayName = normalizedDisplayName(identity.DisplayName, identity.Email)
	if !validEmail(identity.Email) {
		a.redirectOAuth(c, state.Mode, providerName, "email_required")
		return
	}

	if state.Mode == oauthModeLink {
		if state.UserID == "" {
			a.redirectOAuth(c, state.Mode, providerName, "session_expired")
			return
		}
		if _, err := a.store.UserByID(c.Request.Context(), state.UserID); err != nil {
			a.redirectOAuth(c, state.Mode, providerName, "session_expired")
			return
		}
		if err := a.store.LinkAuthIdentity(c.Request.Context(), state.UserID, providerName, identity.Subject); err != nil {
			a.redirectOAuth(c, state.Mode, providerName, "identity_conflict")
			return
		}
		a.redirectOAuth(c, state.Mode, providerName, "")
		return
	}

	user, err := a.store.UserByAuthIdentity(c.Request.Context(), providerName, identity.Subject)
	if errors.Is(err, product.ErrNotFound) {
		if _, emailErr := a.store.UserByEmail(c.Request.Context(), identity.Email); emailErr == nil {
			a.redirectOAuth(c, oauthModeLogin, providerName, "account_link_required")
			return
		} else if !errors.Is(emailErr, product.ErrNotFound) {
			a.redirectOAuth(c, oauthModeLogin, providerName, "account_unavailable")
			return
		}
		user, err = a.store.CreateOAuthUser(c.Request.Context(), identity.Email, identity.DisplayName, providerName, identity.Subject)
	}
	if errors.Is(err, product.ErrConflict) {
		a.redirectOAuth(c, oauthModeLogin, providerName, "account_link_required")
		return
	}
	if err != nil {
		a.redirectOAuth(c, oauthModeLogin, providerName, "account_unavailable")
		return
	}
	if _, err := a.startSession(c, user, ""); err != nil {
		a.redirectOAuth(c, oauthModeLogin, providerName, "session_failed")
		return
	}
	a.redirectOAuth(c, oauthModeLogin, providerName, "")
}

func (a *productAPI) listAuthIdentities(c *gin.Context) {
	identities, err := a.store.ListAuthIdentities(c.Request.Context(), c.GetString(userIDKey))
	if err != nil {
		writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Unable to load connected accounts.")
		return
	}
	c.JSON(http.StatusOK, gin.H{"identities": identities})
}

func (a *productAPI) deleteAuthIdentity(c *gin.Context) {
	providerName := c.Param("provider")
	if providerName != oauthprovider.Google && providerName != oauthprovider.Facebook {
		writeError(c, http.StatusNotFound, "OAUTH_IDENTITY_NOT_FOUND", "The connected account was not found.")
		return
	}
	err := a.store.DeleteAuthIdentity(c.Request.Context(), c.GetString(userIDKey), providerName)
	if errors.Is(err, product.ErrLastLoginMethod) {
		writeError(c, http.StatusConflict, "LAST_LOGIN_METHOD", "Add another sign-in method before disconnecting this account.")
		return
	}
	if errors.Is(err, product.ErrNotFound) {
		writeError(c, http.StatusNotFound, "OAUTH_IDENTITY_NOT_FOUND", "The connected account was not found.")
		return
	}
	if err != nil {
		writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Unable to disconnect the account.")
		return
	}
	c.Status(http.StatusNoContent)
}

func (a *productAPI) redirectOAuth(c *gin.Context, mode, providerName, errorCode string) {
	destination, err := url.Parse(a.cfg.OAuthWebRedirectURL)
	if err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}
	query := destination.Query()
	if mode != "" {
		query.Set("mode", mode)
	}
	if providerName != "" {
		query.Set("provider", providerName)
	}
	if errorCode != "" {
		query.Set("error", errorCode)
	}
	destination.RawQuery = query.Encode()
	c.Redirect(http.StatusSeeOther, destination.String())
}

func (a *productAPI) setOAuthCookie(c *gin.Context, value string, maxAge int) {
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(oauthCookieName, value, maxAge, apiV1Prefix+"/auth/oauth", "", a.cfg.Environment == "production", true)
}

func (a *productAPI) clearOAuthCookie(c *gin.Context) {
	a.setOAuthCookie(c, "", -1)
}

func stateMode(state *security.OAuthStateClaims) string {
	if state == nil {
		return ""
	}
	return state.Mode
}

func normalizedDisplayName(value, email string) string {
	value = strings.TrimSpace(value)
	if utf8.RuneCountInString(value) < 2 {
		value = strings.SplitN(email, "@", 2)[0]
	}
	runes := []rune(value)
	if len(runes) > 80 {
		runes = runes[:80]
	}
	if len(runes) < 2 {
		return "KineGuide user"
	}
	return string(runes)
}
