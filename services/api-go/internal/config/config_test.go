package config

import (
	"testing"
	"time"

	"github.com/stretchr/testify/require"
)

func TestValidateRejectsInvalidAIURL(t *testing.T) {
	cfg := Config{
		Version:            "0.1.0",
		Port:               "8080",
		DatabaseURL:        "postgres://localhost/test",
		AIServiceURL:       "not-a-url",
		CORSAllowedOrigins: []string{"http://localhost:5173"},
		RequestTimeout:     time.Second,
		ShutdownTimeout:    time.Second,
	}
	require.Error(t, cfg.Validate())
}

func TestValidateRejectsDevelopmentJWTSecretInProduction(t *testing.T) {
	cfg := Config{
		Environment: "production", Version: "0.2.0", Port: "8080",
		DatabaseURL: "postgres://localhost/test", AIServiceURL: "http://localhost:8001",
		CORSAllowedOrigins: []string{"https://example.com"}, RequestTimeout: time.Second,
		ShutdownTimeout: time.Second, JWTSecret: "development-only-secret-change-me-32-chars",
		JWTIssuer: "kineguide-api", AccessTokenTTL: time.Minute, RefreshTokenTTL: time.Hour,
	}

	require.ErrorContains(t, cfg.Validate(), "JWT_SECRET must be replaced")
}
