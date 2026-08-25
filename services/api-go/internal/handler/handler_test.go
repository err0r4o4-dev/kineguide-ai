package handler

import (
	"context"
	"errors"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/kineguide-ai/kineguide-ai/services/api-go/internal/config"
)

type stubPinger struct{ err error }

func (s stubPinger) Ping(context.Context) error { return s.err }

func testRouter(dependencies Dependencies) http.Handler {
	cfg := config.Config{
		Environment: "test", Version: "0.1.0", Port: "8080",
		DatabaseURL: "postgres://localhost/test", AIServiceURL: "http://localhost:8001",
		CORSAllowedOrigins: []string{"http://localhost:5173"},
		RequestTimeout:     time.Second, ShutdownTimeout: time.Second,
	}
	return NewRouter(cfg, dependencies, slog.New(slog.NewTextHandler(io.Discard, nil)))
}

func TestHealth(t *testing.T) {
	request := httptest.NewRequest(http.MethodGet, "/health", nil)
	response := httptest.NewRecorder()
	testRouter(Dependencies{}).ServeHTTP(response, request)
	require.Equal(t, http.StatusOK, response.Code)
	assert.JSONEq(t, `{"status":"ok","service":"api-go","version":"0.1.0"}`, response.Body.String())
	assert.NotEmpty(t, response.Header().Get("X-Request-ID"))
}

func TestVersionedHealthUsesV1Prefix(t *testing.T) {
	router := testRouter(Dependencies{})

	request := httptest.NewRequest(http.MethodGet, "/v1/health", nil)
	response := httptest.NewRecorder()
	router.ServeHTTP(response, request)
	require.Equal(t, http.StatusOK, response.Code)

	legacyRequest := httptest.NewRequest(http.MethodGet, "/api/v1/health", nil)
	legacyResponse := httptest.NewRecorder()
	router.ServeHTTP(legacyResponse, legacyRequest)
	require.Equal(t, http.StatusNotFound, legacyResponse.Code)
}

func TestReadinessWhenDependenciesAreReady(t *testing.T) {
	request := httptest.NewRequest(http.MethodGet, "/ready", nil)
	response := httptest.NewRecorder()
	testRouter(Dependencies{Database: stubPinger{}, AI: stubPinger{}}).ServeHTTP(response, request)
	require.Equal(t, http.StatusOK, response.Code)
	assert.Contains(t, response.Body.String(), `"status":"ok"`)
}

func TestReadinessWhenDependencyIsUnavailable(t *testing.T) {
	request := httptest.NewRequest(http.MethodGet, "/ready", nil)
	response := httptest.NewRecorder()
	testRouter(Dependencies{Database: stubPinger{}, AI: stubPinger{err: errors.New("offline")}}).ServeHTTP(response, request)
	require.Equal(t, http.StatusServiceUnavailable, response.Code)
	assert.Contains(t, response.Body.String(), `"ai_python":{"name":"ai-python","status":"unavailable"`)
}

func TestOpenAPI(t *testing.T) {
	request := httptest.NewRequest(http.MethodGet, "/openapi.json", nil)
	response := httptest.NewRecorder()
	testRouter(Dependencies{}).ServeHTTP(response, request)
	require.Equal(t, http.StatusOK, response.Code)
	assert.JSONEq(t, openAPIDocument, response.Body.String())
}

func TestDocsUsesScalarAPIReference(t *testing.T) {
	request := httptest.NewRequest(http.MethodGet, "/docs", nil)
	response := httptest.NewRecorder()
	testRouter(Dependencies{}).ServeHTTP(response, request)

	require.Equal(t, http.StatusOK, response.Code)
	assert.Equal(t, "text/html; charset=utf-8", response.Header().Get("Content-Type"))
	assert.Contains(t, response.Body.String(), "<title>KineGuide AI API Reference</title>")
	assert.Contains(t, response.Body.String(), `id="api-reference"`)
	assert.Contains(t, response.Body.String(), `data-url="/openapi.json"`)
	assert.NotContains(t, response.Body.String(), "swagger-ui-dist")
}
