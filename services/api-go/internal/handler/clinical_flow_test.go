package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/kineguide-ai/kineguide-ai/services/api-go/internal/client/ai"
	"github.com/kineguide-ai/kineguide-ai/services/api-go/internal/product"
	"github.com/kineguide-ai/kineguide-ai/services/api-go/internal/security"
)

type technicalFeedbackStub struct {
	response ai.TechnicalPoseResponse
}

func (s technicalFeedbackStub) TechnicalPoseFeedback(context.Context, ai.TechnicalPoseRequest) (ai.TechnicalPoseResponse, error) {
	return s.response, nil
}

type clinicalFlowStore struct {
	product.Store
	session        product.Session
	createdSession product.Session
	updatedSession product.Session
}

func (s *clinicalFlowStore) LatestConsent(context.Context, string) (product.Consent, error) {
	return product.Consent{
		ID: "consent-fixture", PolicyVersion: product.CurrentConsentPolicyVersion,
		CameraProcessing: true, SessionSummaryStorage: true,
	}, nil
}

func (s *clinicalFlowStore) SessionByID(context.Context, string, string) (product.Session, error) {
	return s.session, nil
}

func (s *clinicalFlowStore) CreateSession(_ context.Context, session product.Session) (product.Session, error) {
	s.createdSession = session
	session.ID = "864cb7ae-64dd-4db4-8200-12b44e5bcab1"
	session.Status = "active"
	return session, nil
}

func (s *clinicalFlowStore) UpdateSession(_ context.Context, session product.Session) (product.Session, error) {
	s.updatedSession = session
	return session, nil
}

func clinicalFlowRouter(t *testing.T, store product.Store, technical technicalFeedbackStub) http.Handler {
	t.Helper()
	signer, err := security.NewTokenSigner("test-secret-with-at-least-thirty-two-characters")
	require.NoError(t, err)
	return testRouter(Dependencies{Store: store, Signer: signer, TechnicalAI: technical})
}

func TestEducationalCatalogNeverReturnsUnreviewedContentAsApproved(t *testing.T) {
	router := clinicalFlowRouter(t, &clinicalFlowStore{}, technicalFeedbackStub{})
	response := httptest.NewRecorder()
	router.ServeHTTP(response, authenticatedChatRequest(t, http.MethodGet, "/v1/educational-clinical-flow/catalog?locale=th", ""))

	require.Equal(t, http.StatusOK, response.Code)
	assert.Contains(t, response.Body.String(), `"reviewStatus":"pending_clinical_review"`)
	assert.Contains(t, response.Body.String(), `"demoOnly":true`)
	assert.Contains(t, response.Body.String(), `"reviewedBy":null`)
	assert.NotContains(t, response.Body.String(), `"reviewStatus":"approved"`)
}

func TestEducationalScreeningPlaceholderStopsFlow(t *testing.T) {
	router := clinicalFlowRouter(t, &clinicalFlowStore{}, technicalFeedbackStub{})
	body := `{"locale":"th","answers":[{"questionId":"demo-screening-placeholder-v1","optionId":"demo-stop-selected"}]}`
	response := httptest.NewRecorder()
	router.ServeHTTP(response, authenticatedChatRequest(t, http.MethodPost, "/v1/educational-clinical-flow/evaluate", body))

	require.Equal(t, http.StatusOK, response.Code)
	assert.Contains(t, response.Body.String(), `"outcome":"stopped_demo_placeholder"`)
	assert.Contains(t, response.Body.String(), `"exercises":[]`)
}

func TestTechnicalFeedbackContainsNoDiagnosisTreatmentOrRawMedia(t *testing.T) {
	store := &clinicalFlowStore{session: product.Session{ID: "864cb7ae-64dd-4db4-8200-12b44e5bcab1", UserID: chatTestUserID}}
	technical := technicalFeedbackStub{response: ai.TechnicalPoseResponse{
		Status: "completed", MovementPhase: "unavailable", CameraFeedback: "camera_ready",
		ConfidenceScore: floatPointer(0.75), RepetitionCount: nil,
	}}
	router := clinicalFlowRouter(t, store, technical)
	body := `{"pose_status":"ready","landmark_visibility":[0.5,1.0]}`
	response := httptest.NewRecorder()
	router.ServeHTTP(response, authenticatedChatRequest(t, http.MethodPost, "/v1/sessions/864cb7ae-64dd-4db4-8200-12b44e5bcab1/technical-feedback", body))

	require.Equal(t, http.StatusOK, response.Code)
	for _, forbidden := range []string{"diagnosis", "treatment", "video", "image", "landmarks"} {
		assert.NotContains(t, strings.ToLower(response.Body.String()), forbidden)
	}
}

func floatPointer(value float64) *float64 { return &value }

func TestSessionContractDoesNotStoreRawVideoByDefault(t *testing.T) {
	session := product.Session{ID: "fixture", StartedAt: time.Now().UTC()}
	payload, err := json.Marshal(session)
	require.NoError(t, err)
	for _, forbidden := range []string{"video", "image", "frame", "landmark", "recording"} {
		assert.NotContains(t, strings.ToLower(string(payload)), forbidden)
	}
}

func TestCreateSessionDerivesActivityMetadataAndAcceptsNoCameraMode(t *testing.T) {
	store := &clinicalFlowStore{}
	router := clinicalFlowRouter(t, store, technicalFeedbackStub{})
	response := httptest.NewRecorder()
	body := `{"activity_slug":"walking-demo","camera_used":false}`

	router.ServeHTTP(response, authenticatedChatRequest(t, http.MethodPost, "/v1/sessions", body))

	require.Equal(t, http.StatusCreated, response.Code)
	assert.Equal(t, "walking-demo", store.createdSession.ActivitySlug)
	assert.Equal(t, "gait", store.createdSession.ActivityKind)
	assert.Equal(t, "observation", store.createdSession.MeasurementMode)
	assert.False(t, store.createdSession.CameraUsed)
	assert.Contains(t, response.Body.String(), `"activity_slug":"walking-demo"`)
}

func TestObservationActivityRejectsManualCycles(t *testing.T) {
	store := &clinicalFlowStore{session: product.Session{
		ID:              "864cb7ae-64dd-4db4-8200-12b44e5bcab1",
		UserID:          chatTestUserID,
		ActivitySlug:    "walking-demo",
		MeasurementMode: "observation",
	}}
	router := clinicalFlowRouter(t, store, technicalFeedbackStub{})
	response := httptest.NewRecorder()
	body := `{"status":"completed","manual_cycles":1,"elapsed_seconds":30}`

	router.ServeHTTP(response, authenticatedChatRequest(t, http.MethodPatch, "/v1/sessions/864cb7ae-64dd-4db4-8200-12b44e5bcab1", body))

	require.Equal(t, http.StatusUnprocessableEntity, response.Code)
	assert.Empty(t, store.updatedSession.ID)
	assert.Contains(t, response.Body.String(), `"code":"VALIDATION_ERROR"`)
}
