package handler

import (
	"context"
	_ "embed"
	"log/slog"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/kineguide-ai/kineguide-ai/services/api-go/internal/config"
	appmiddleware "github.com/kineguide-ai/kineguide-ai/services/api-go/internal/middleware"
	"github.com/kineguide-ai/kineguide-ai/services/api-go/internal/oauthprovider"
	"github.com/kineguide-ai/kineguide-ai/services/api-go/internal/product"
	"github.com/kineguide-ai/kineguide-ai/services/api-go/internal/security"
)

const apiV1Prefix = "/v1"

type Pinger interface {
	Ping(context.Context) error
}

type Dependencies struct {
	Database       Pinger
	AI             Pinger
	Store          product.Store
	Signer         *security.TokenSigner
	OAuthProviders map[string]oauthprovider.Provider
}

type HealthResponse struct {
	Status  string `json:"status"`
	Service string `json:"service"`
	Version string `json:"version"`
}

type DependencyStatus struct {
	Name      string `json:"name"`
	Status    string `json:"status"`
	LatencyMS int64  `json:"latency_ms"`
}

type SystemStatusResponse struct {
	Status       string                      `json:"status"`
	Service      string                      `json:"service"`
	Version      string                      `json:"version"`
	Dependencies map[string]DependencyStatus `json:"dependencies"`
}

func NewRouter(cfg config.Config, dependencies Dependencies, logger *slog.Logger) *gin.Engine {
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}
	router := gin.New()
	router.Use(
		appmiddleware.RequestID(),
		appmiddleware.StructuredLogger(logger),
		appmiddleware.Recovery(logger),
		appmiddleware.Timeout(cfg.RequestTimeout),
		appmiddleware.CORS(cfg.CORSAllowedOrigins),
	)

	health := func(c *gin.Context) {
		c.JSON(http.StatusOK, HealthResponse{Status: "ok", Service: "api-go", Version: cfg.Version})
	}
	router.GET("/health", health)
	router.GET(apiV1Prefix+"/health", health)
	router.GET("/ready", readinessHandler(cfg.Version, dependencies))
	router.GET(apiV1Prefix+"/system/status", systemStatusHandler(cfg.Version, dependencies))
	router.GET("/openapi.json", openAPIHandler)
	router.GET("/docs", docsHandler)
	registerProductRoutes(router, cfg, dependencies.Store, dependencies.Signer, dependencies.OAuthProviders)
	return router
}

func readinessHandler(version string, dependencies Dependencies) gin.HandlerFunc {
	return func(c *gin.Context) {
		status, ready := collectStatus(c.Request.Context(), version, dependencies)
		if !ready {
			c.JSON(http.StatusServiceUnavailable, status)
			return
		}
		c.JSON(http.StatusOK, status)
	}
}

func systemStatusHandler(version string, dependencies Dependencies) gin.HandlerFunc {
	return func(c *gin.Context) {
		status, _ := collectStatus(c.Request.Context(), version, dependencies)
		c.JSON(http.StatusOK, status)
	}
}

func collectStatus(ctx context.Context, version string, dependencies Dependencies) (SystemStatusResponse, bool) {
	postgres := checkDependency(ctx, "postgres", dependencies.Database)
	aiPython := checkDependency(ctx, "ai-python", dependencies.AI)
	ready := postgres.Status == "ok" && aiPython.Status == "ok"
	status := "ok"
	if !ready {
		status = "degraded"
	}
	return SystemStatusResponse{
		Status:  status,
		Service: "api-go",
		Version: version,
		Dependencies: map[string]DependencyStatus{
			"postgres":  postgres,
			"ai_python": aiPython,
		},
	}, ready
}

func checkDependency(ctx context.Context, name string, pinger Pinger) DependencyStatus {
	started := time.Now()
	status := "ok"
	if pinger == nil || pinger.Ping(ctx) != nil {
		status = "unavailable"
	}
	return DependencyStatus{Name: name, Status: status, LatencyMS: time.Since(started).Milliseconds()}
}

func openAPIHandler(c *gin.Context) {
	c.Data(http.StatusOK, "application/json; charset=utf-8", []byte(openAPIDocument))
}

func docsHandler(c *gin.Context) {
	c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(apiReferenceHTML))
}

const apiReferenceHTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>KineGuide AI API Reference</title>
</head>
<body>
  <script id="api-reference" data-url="/openapi.json"></script>
  <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
</body>
</html>`

//go:embed openapi.json
var openAPIDocument string
