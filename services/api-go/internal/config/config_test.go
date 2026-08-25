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
		AccessTokenTTL: time.Minute, RefreshTokenTTL: time.Hour,
	}

	require.ErrorContains(t, cfg.Validate(), "JWT_SECRET must be replaced")
}

func TestValidateAcceptsTwentyNineCharacterJWTSecretInDevelopment(t *testing.T) {
	cfg := validConfigForTest()
	cfg.Environment = "development"
	cfg.JWTSecret = "12345678901234567890123456789"

	require.NoError(t, cfg.Validate())
}

func TestValidateRejectsTwentyNineCharacterJWTSecretInProduction(t *testing.T) {
	cfg := validConfigForTest()
	cfg.Environment = "production"
	cfg.JWTSecret = "12345678901234567890123456789"

	require.ErrorContains(t, cfg.Validate(), "at least 32 characters in production")
}

func validConfigForTest() Config {
	return Config{
		Environment: "development", Version: "0.2.0", Port: "8080",
		DatabaseURL: "postgres://localhost/test", AIServiceURL: "http://localhost:8001",
		CORSAllowedOrigins: []string{"http://localhost:5173"}, RequestTimeout: time.Second,
		ShutdownTimeout: time.Second, JWTSecret: "test-secret-with-at-least-thirty-two-characters",
		AccessTokenTTL: time.Minute, RefreshTokenTTL: time.Hour,
	}
}
