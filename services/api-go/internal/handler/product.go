package handler

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"net/http"
	"net/mail"
	"strings"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/kineguide-ai/kineguide-ai/services/api-go/internal/config"
	appmiddleware "github.com/kineguide-ai/kineguide-ai/services/api-go/internal/middleware"
	"github.com/kineguide-ai/kineguide-ai/services/api-go/internal/oauthprovider"
	"github.com/kineguide-ai/kineguide-ai/services/api-go/internal/product"
	"github.com/kineguide-ai/kineguide-ai/services/api-go/internal/security"
)

const userIDKey = "authenticated_user_id"

type productAPI struct {
	cfg       config.Config
	store     product.Store
	signer    *security.TokenSigner
	providers map[string]oauthprovider.Provider
}

type authResponse struct {
	AccessToken string       `json:"access_token"`
	ExpiresIn   int          `json:"expires_in"`
	User        product.User `json:"user"`
}

func registerProductRoutes(router *gin.Engine, cfg config.Config, store product.Store, signer *security.TokenSigner, providers map[string]oauthprovider.Provider) {
	if store == nil || signer == nil {
		return
	}
	api := &productAPI{cfg: cfg, store: store, signer: signer, providers: providers}
	v1 := router.Group(apiV1Prefix)
	auth := v1.Group("/auth")
	auth.POST("/register", api.register)
	auth.POST("/login", api.login)
	auth.POST("/refresh", api.refresh)
	auth.POST("/logout", api.logout)
	auth.GET("/providers", api.oauthProviders)
	auth.GET("/oauth/:provider/start", api.oauthStart)
	auth.GET("/oauth/:provider/callback", api.oauthCallback)

	secured := v1.Group("")
	secured.Use(api.requireAccessToken())
	secured.GET("/me", api.me)
	secured.DELETE("/me", api.deleteMe)
	secured.GET("/me/auth-identities", api.listAuthIdentities)
	secured.POST("/me/auth-identities/:provider/start", api.oauthLinkStart)
	secured.DELETE("/me/auth-identities/:provider", api.deleteAuthIdentity)
	secured.GET("/consents/current", api.currentConsent)
	secured.POST("/consents", api.saveConsent)
	secured.DELETE("/consents/current", api.revokeConsent)
	secured.GET("/assessments/latest", api.latestAssessment)
	secured.POST("/assessments", api.saveAssessment)
	secured.GET("/exercises", api.listExercises)
	secured.GET("/exercises/:slug", api.getExercise)
	secured.GET("/activity-plan", api.activityPlan)
	secured.GET("/dashboard", api.dashboard)
	secured.GET("/sessions", api.listSessions)
	secured.POST("/sessions", api.createSession)
	secured.GET("/sessions/:id", api.getSession)
	secured.PATCH("/sessions/:id", api.updateSession)
}

func (a *productAPI) register(c *gin.Context) {
	var request struct {
		Email       string `json:"email"`
		Password    string `json:"password"`
		DisplayName string `json:"display_name"`
	}
	if err := c.ShouldBindJSON(&request); err != nil {
		writeError(c, http.StatusBadRequest, "INVALID_REQUEST", "Please check the submitted information.")
		return
	}
	request.Email = strings.ToLower(strings.TrimSpace(request.Email))
	request.DisplayName = strings.TrimSpace(request.DisplayName)
	if !validEmail(request.Email) || len([]rune(request.DisplayName)) < 2 || len([]rune(request.DisplayName)) > 80 {
		writeError(c, http.StatusUnprocessableEntity, "VALIDATION_ERROR", "Email or display name is invalid.")
		return
	}
	if len(request.Password) > 128 {
		writeError(c, http.StatusUnprocessableEntity, "VALIDATION_ERROR", "Password must contain between 12 and 128 characters.")
		return
	}
	hash, err := security.HashPassword(request.Password)
	if err != nil {
		writeError(c, http.StatusUnprocessableEntity, "VALIDATION_ERROR", "Password must contain at least 12 characters.")
		return
	}
	user, err := a.store.CreateUser(c.Request.Context(), request.Email, hash, request.DisplayName)
	if errors.Is(err, product.ErrConflict) {
		writeError(c, http.StatusConflict, "EMAIL_EXISTS", "An account with this email already exists.")
		return
	}
	if err != nil {
		writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Unable to create the account.")
		return
	}
	response, err := a.startSession(c, user, "")
	if err != nil {
		_ = a.store.DeleteUser(c.Request.Context(), user.ID)
		writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Unable to start the session.")
		return
	}
	c.JSON(http.StatusCreated, response)
}

func (a *productAPI) login(c *gin.Context) {
	var request struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&request); err != nil {
		writeError(c, http.StatusBadRequest, "INVALID_REQUEST", "Please check the submitted information.")
		return
	}
	if len(request.Password) > 128 {
		writeError(c, http.StatusUnauthorized, "INVALID_CREDENTIALS", "Email or password is incorrect.")
		return
	}
	user, err := a.store.UserByEmail(c.Request.Context(), strings.ToLower(strings.TrimSpace(request.Email)))
	if err != nil {
		writeError(c, http.StatusUnauthorized, "INVALID_CREDENTIALS", "Email or password is incorrect.")
		return
	}
	ok, err := security.VerifyPassword(request.Password, user.PasswordHash)
	if err != nil || !ok {
		writeError(c, http.StatusUnauthorized, "INVALID_CREDENTIALS", "Email or password is incorrect.")
		return
	}
	response, err := a.startSession(c, user, "")
	if err != nil {
		writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Unable to start the session.")
		return
	}
	c.JSON(http.StatusOK, response)
}

func (a *productAPI) refresh(c *gin.Context) {
	oldToken, err := c.Cookie("kg_refresh")
	if err != nil || oldToken == "" {
		writeError(c, http.StatusUnauthorized, "REFRESH_REQUIRED", "Please sign in again.")
		return
	}
	stored, err := a.store.RefreshToken(c.Request.Context(), tokenHash(oldToken))
	if err != nil {
		a.clearRefreshCookie(c)
		writeError(c, http.StatusUnauthorized, "REFRESH_EXPIRED", "Please sign in again.")
		return
	}
	user, err := a.store.UserByID(c.Request.Context(), stored.UserID)
	if err != nil {
		a.clearRefreshCookie(c)
		writeError(c, http.StatusUnauthorized, "REFRESH_EXPIRED", "Please sign in again.")
		return
	}
	response, err := a.startSession(c, user, tokenHash(oldToken))
	if err != nil {
		writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Unable to refresh the session.")
		return
	}
	c.JSON(http.StatusOK, response)
}

func (a *productAPI) logout(c *gin.Context) {
	if token, err := c.Cookie("kg_refresh"); err == nil && token != "" {
		_ = a.store.RevokeRefreshToken(c.Request.Context(), tokenHash(token))
	}
	a.clearRefreshCookie(c)
	c.Status(http.StatusNoContent)
}

func (a *productAPI) startSession(c *gin.Context, user product.User, oldHash string) (authResponse, error) {
	accessToken, err := a.signer.Sign(user.ID, "access", a.cfg.AccessTokenTTL)
	if err != nil {
		return authResponse{}, err
	}
	refreshToken, err := randomToken()
	if err != nil {
		return authResponse{}, err
	}
	expiresAt := time.Now().UTC().Add(a.cfg.RefreshTokenTTL)
	if oldHash == "" {
		err = a.store.SaveRefreshToken(c.Request.Context(), user.ID, tokenHash(refreshToken), expiresAt)
	} else {
		err = a.store.RotateRefreshToken(c.Request.Context(), oldHash, tokenHash(refreshToken), user.ID, expiresAt)
	}
	if err != nil {
		return authResponse{}, err
	}
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("kg_refresh", refreshToken, int(a.cfg.RefreshTokenTTL.Seconds()), apiV1Prefix+"/auth", "", a.cfg.Environment == "production", true)
	return authResponse{AccessToken: accessToken, ExpiresIn: int(a.cfg.AccessTokenTTL.Seconds()), User: user}, nil
}

func (a *productAPI) requireAccessToken() gin.HandlerFunc {
	return func(c *gin.Context) {
		header := strings.TrimSpace(c.GetHeader("Authorization"))
		if !strings.HasPrefix(header, "Bearer ") {
			writeError(c, http.StatusUnauthorized, "AUTH_REQUIRED", "Authentication is required.")
			c.Abort()
			return
		}
		claims, err := a.signer.Parse(strings.TrimSpace(strings.TrimPrefix(header, "Bearer ")))
		if err != nil || claims.TokenType != "access" || claims.Subject == "" {
			writeError(c, http.StatusUnauthorized, "INVALID_TOKEN", "The session is invalid or expired.")
			c.Abort()
			return
		}
		c.Set(userIDKey, claims.Subject)
		c.Next()
	}
}

func (a *productAPI) me(c *gin.Context) {
	user, err := a.store.UserByID(c.Request.Context(), c.GetString(userIDKey))
	if err != nil {
		writeError(c, http.StatusNotFound, "USER_NOT_FOUND", "The account was not found.")
		return
	}
	c.JSON(http.StatusOK, user)
}

func (a *productAPI) deleteMe(c *gin.Context) {
	if err := a.store.DeleteUser(c.Request.Context(), c.GetString(userIDKey)); err != nil {
		writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Unable to delete the account.")
		return
	}
	a.clearRefreshCookie(c)
	c.Status(http.StatusNoContent)
}

func (a *productAPI) currentConsent(c *gin.Context) {
	consent, err := a.store.LatestConsent(c.Request.Context(), c.GetString(userIDKey))
	if errors.Is(err, product.ErrNotFound) {
		c.JSON(http.StatusOK, gin.H{"consent": nil})
		return
	}
	if err != nil {
		writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Unable to load consent.")
		return
	}
	c.JSON(http.StatusOK, gin.H{"consent": consent})
}

func (a *productAPI) saveConsent(c *gin.Context) {
	var request struct {
		CameraProcessing      bool `json:"camera_processing"`
		SessionSummaryStorage bool `json:"session_summary_storage"`
		ResearchUse           bool `json:"research_use"`
	}
	if err := c.ShouldBindJSON(&request); err != nil || !request.CameraProcessing || !request.SessionSummaryStorage {
		writeError(c, http.StatusUnprocessableEntity, "CONSENT_REQUIRED", "Camera processing and session-summary storage consent are required for guided sessions.")
		return
	}
	consent, err := a.store.SaveConsent(c.Request.Context(), product.Consent{UserID: c.GetString(userIDKey), PolicyVersion: "prototype-v1", CameraProcessing: request.CameraProcessing, SessionSummaryStorage: request.SessionSummaryStorage, ResearchUse: request.ResearchUse})
	if err != nil {
		writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Unable to save consent.")
		return
	}
	c.JSON(http.StatusCreated, consent)
}

func (a *productAPI) revokeConsent(c *gin.Context) {
	if err := a.store.RevokeConsent(c.Request.Context(), c.GetString(userIDKey)); err != nil {
		writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Unable to revoke consent.")
		return
	}
	c.Status(http.StatusNoContent)
}

func (a *productAPI) saveAssessment(c *gin.Context) {
	consent, err := a.store.LatestConsent(c.Request.Context(), c.GetString(userIDKey))
	if err != nil || !consent.IsActive() || !consent.SessionSummaryStorage {
		writeError(c, http.StatusForbidden, "CONSENT_REQUIRED", "Active consent is required before saving an assessment.")
		return
	}
	var assessment product.Assessment
	if err := c.ShouldBindJSON(&assessment); err != nil || !validAssessment(assessment) {
		writeError(c, http.StatusUnprocessableEntity, "VALIDATION_ERROR", "Please choose one option for every assessment question.")
		return
	}
	assessment.UserID = c.GetString(userIDKey)
	assessment, err = a.store.SaveAssessment(c.Request.Context(), assessment)
	if err != nil {
		writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Unable to save the assessment.")
		return
	}
	c.JSON(http.StatusCreated, assessment)
}

func (a *productAPI) latestAssessment(c *gin.Context) {
	assessment, err := a.store.LatestAssessment(c.Request.Context(), c.GetString(userIDKey))
	if errors.Is(err, product.ErrNotFound) {
		c.JSON(http.StatusOK, gin.H{"assessment": nil})
		return
	}
	if err != nil {
		writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Unable to load the assessment.")
		return
	}
	c.JSON(http.StatusOK, gin.H{"assessment": assessment})
}

func (a *productAPI) listExercises(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"exercises": product.Exercises})
}

func (a *productAPI) getExercise(c *gin.Context) {
	exercise, ok := product.FindExercise(c.Param("slug"))
	if !ok {
		writeError(c, http.StatusNotFound, "EXERCISE_NOT_FOUND", "The movement demo was not found.")
		return
	}
	c.JSON(http.StatusOK, exercise)
}

func (a *productAPI) activityPlan(c *gin.Context) {
	c.JSON(http.StatusOK, product.BuildDemoActivityPlan())
}

func (a *productAPI) createSession(c *gin.Context) {
	consent, err := a.store.LatestConsent(c.Request.Context(), c.GetString(userIDKey))
	if err != nil || !consent.IsActive() || !consent.SessionSummaryStorage {
		writeError(c, http.StatusForbidden, "CAMERA_CONSENT_REQUIRED", "Camera consent is required before starting a camera session.")
		return
	}
	var request struct {
		ExerciseSlug string `json:"exercise_slug"`
		CameraUsed   bool   `json:"camera_used"`
	}
	if err := c.ShouldBindJSON(&request); err != nil {
		writeError(c, http.StatusBadRequest, "INVALID_REQUEST", "Please check the session information.")
		return
	}
	if _, ok := product.FindExercise(request.ExerciseSlug); !ok {
		writeError(c, http.StatusUnprocessableEntity, "VALIDATION_ERROR", "Unknown movement demo.")
		return
	}
	session, err := a.store.CreateSession(c.Request.Context(), product.Session{UserID: c.GetString(userIDKey), ExerciseSlug: request.ExerciseSlug, CameraUsed: request.CameraUsed})
	if err != nil {
		writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Unable to start the session.")
		return
	}
	c.JSON(http.StatusCreated, session)
}

func (a *productAPI) updateSession(c *gin.Context) {
	var request struct {
		Status            string `json:"status"`
		ManualRepetitions int    `json:"manual_repetitions"`
		ElapsedSeconds    int    `json:"elapsed_seconds"`
	}
	if err := c.ShouldBindJSON(&request); err != nil || !oneOf(request.Status, "active", "completed", "stopped") || request.ManualRepetitions < 0 || request.ManualRepetitions > 1000 || request.ElapsedSeconds < 0 || request.ElapsedSeconds > 86400 {
		writeError(c, http.StatusUnprocessableEntity, "VALIDATION_ERROR", "Session values are outside the accepted range.")
		return
	}
	session, err := a.store.UpdateSession(c.Request.Context(), product.Session{ID: c.Param("id"), UserID: c.GetString(userIDKey), Status: request.Status, ManualRepetitions: request.ManualRepetitions, ElapsedSeconds: request.ElapsedSeconds})
	if errors.Is(err, product.ErrNotFound) {
		writeError(c, http.StatusNotFound, "SESSION_NOT_FOUND", "The session was not found.")
		return
	}
	if err != nil {
		writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Unable to update the session.")
		return
	}
	c.JSON(http.StatusOK, session)
}

func (a *productAPI) getSession(c *gin.Context) {
	session, err := a.store.SessionByID(c.Request.Context(), c.GetString(userIDKey), c.Param("id"))
	if errors.Is(err, product.ErrNotFound) {
		writeError(c, http.StatusNotFound, "SESSION_NOT_FOUND", "The session was not found.")
		return
	}
	if err != nil {
		writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Unable to load the session.")
		return
	}
	c.JSON(http.StatusOK, session)
}

func (a *productAPI) listSessions(c *gin.Context) {
	sessions, err := a.store.ListSessions(c.Request.Context(), c.GetString(userIDKey), 50)
	if err != nil {
		writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Unable to load session history.")
		return
	}
	c.JSON(http.StatusOK, gin.H{"sessions": sessions})
}

func (a *productAPI) dashboard(c *gin.Context) {
	sessions, err := a.store.ListSessions(c.Request.Context(), c.GetString(userIDKey), 50)
	if err != nil {
		writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Unable to load the dashboard.")
		return
	}
	c.JSON(http.StatusOK, product.BuildDashboard(sessions, time.Now()))
}

func (a *productAPI) clearRefreshCookie(c *gin.Context) {
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("kg_refresh", "", -1, apiV1Prefix+"/auth", "", a.cfg.Environment == "production", true)
}

func validEmail(value string) bool {
	address, err := mail.ParseAddress(value)
	return err == nil && address.Address == value && len(value) <= 254
}

func validAssessment(a product.Assessment) bool {
	return oneOf(a.ConcernArea, "lower_back", "knee", "shoulder", "general_mobility", "prefer_not_to_say") &&
		oneOf(a.DurationBand, "lt_week", "one_to_four_weeks", "gt_four_weeks", "unsure") &&
		oneOf(a.DailyImpact, "none", "some", "much", "prefer_not_to_say") &&
		oneOf(a.Goal, "understand", "camera_demo", "track_activity")
}

func oneOf(value string, options ...string) bool {
	for _, option := range options {
		if value == option {
			return true
		}
	}
	return false
}

func randomToken() (string, error) {
	value := make([]byte, 32)
	if _, err := rand.Read(value); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(value), nil
}

func tokenHash(value string) string {
	sum := sha256.Sum256([]byte(value))
	return hex.EncodeToString(sum[:])
}

func writeError(c *gin.Context, status int, code, message string) {
	c.JSON(status, gin.H{"error": gin.H{"code": code, "message": message, "details": nil, "request_id": c.GetString(appmiddleware.RequestIDKey)}})
}
