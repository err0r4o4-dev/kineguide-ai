package handler

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/kineguide-ai/kineguide-ai/services/api-go/internal/security"
)

func TestActivityPlanRequiresAuthenticationAndReturnsDemoOnlySchedule(t *testing.T) {
	signer, err := security.NewTokenSigner("test-secret-with-at-least-thirty-two-characters")
	require.NoError(t, err)
	router := testRouter(Dependencies{Store: &registrationStore{}, Signer: signer})

	unauthorized := httptest.NewRecorder()
	router.ServeHTTP(unauthorized, httptest.NewRequest(http.MethodGet, "/v1/activity-plan", nil))
	assert.Equal(t, http.StatusUnauthorized, unauthorized.Code)

	token, err := signer.Sign("1af854ea-56cf-4e98-b7bb-93d347275568", "access", time.Minute)
	require.NoError(t, err)
	request := httptest.NewRequest(http.MethodGet, "/v1/activity-plan", nil)
	request.Header.Set("Authorization", "Bearer "+token)
	response := httptest.NewRecorder()

	router.ServeHTTP(response, request)

	require.Equal(t, http.StatusOK, response.Code)
	assert.Contains(t, response.Body.String(), `"plan_type":"demo_exploration"`)
	assert.Contains(t, response.Body.String(), `"personalized":false`)
	assert.NotContains(t, response.Body.String(), "concern_area")
}
