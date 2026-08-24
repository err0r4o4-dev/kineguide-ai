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
	"github.com/kineguide-ai/kineguide-ai/services/api-go/internal/product"
	"github.com/kineguide-ai/kineguide-ai/services/api-go/internal/security"
)

type Pinger interface {
	Ping(context.Context) error
}

type Dependencies struct {
	Database Pinger
	AI       Pinger
	Store    product.Store
	Signer   *security.TokenSigner
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
	router.GET("/api/v1/health", health)
	router.GET("/ready", readinessHandler(cfg.Version, dependencies))
	router.GET("/api/v1/system/status", systemStatusHandler(cfg.Version, dependencies))
	router.GET("/openapi.json", openAPIHandler)
	router.GET("/docs", docsHandler)
	registerProductRoutes(router, cfg, dependencies.Store, dependencies.Signer)
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
	c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(swaggerHTML))
}

const swaggerHTML = `<!doctype html><html><head><meta charset="utf-8"><title>KineGuide API Docs</title>
<link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"></head>
<body><div id="swagger-ui"></div><script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
<script>SwaggerUIBundle({url:'/openapi.json',dom_id:'#swagger-ui',deepLinking:true});</script></body></html>`

//go:embed openapi.json
var openAPIDocument string
