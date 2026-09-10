package middleware

import (
	"bytes"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestStructuredLoggerHealthProbe(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name       string
		path       string
		status     int
		wantLogged bool
	}{
		{name: "successful root health probe is omitted", path: "/health", status: http.StatusOK, wantLogged: false},
		{name: "failed root health probe is logged", path: "/health", status: http.StatusServiceUnavailable, wantLogged: true},
		{name: "successful versioned health request is logged", path: "/v1/health", status: http.StatusOK, wantLogged: true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var output bytes.Buffer
			logger := slog.New(slog.NewJSONHandler(&output, nil))
			router := gin.New()
			router.Use(StructuredLogger(logger))
			router.GET(tt.path, func(c *gin.Context) { c.Status(tt.status) })

			request := httptest.NewRequest(http.MethodGet, tt.path, nil)
			router.ServeHTTP(httptest.NewRecorder(), request)

			logged := strings.Contains(output.String(), `"msg":"http_request"`)
			if logged != tt.wantLogged {
				t.Fatalf("http request logged = %v, want %v; output = %q", logged, tt.wantLogged, output.String())
			}
		})
	}
}
