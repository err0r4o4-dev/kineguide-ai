package config

import (
	"fmt"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/go-playground/validator/v10"
)

const minimumProductionJWTSecretLength = 32

type Config struct {
	Environment        string        `validate:"required"`
	Version            string        `validate:"required"`
	Port               string        `validate:"required,numeric"`
	DatabaseURL        string        `validate:"required"`
	AIServiceURL       string        `validate:"required"`
	CORSAllowedOrigins []string      `validate:"min=1,dive,required"`
	RequestTimeout     time.Duration `validate:"gt=0"`
	ShutdownTimeout    time.Duration `validate:"gt=0"`
	JWTSecret          string        `validate:"required,min=29"`
	AccessTokenTTL     time.Duration `validate:"gt=0"`
	RefreshTokenTTL    time.Duration `validate:"gt=0"`
}

func Load() (Config, error) {
	requestTimeout, err := durationEnv("REQUEST_TIMEOUT", 10*time.Second)
	if err != nil {
		return Config{}, err
	}
	shutdownTimeout, err := durationEnv("SHUTDOWN_TIMEOUT", 10*time.Second)
	if err != nil {
		return Config{}, err
	}

	cfg := Config{
		Environment:        envOr("APP_ENV", "development"),
		Version:            envOr("APP_VERSION", "0.1.0"),
		Port:               envOr("API_PORT", "8080"),
		DatabaseURL:        envOr("DATABASE_URL", "postgres://kineguide:change-me@localhost:5432/kineguide?sslmode=disable"),
		AIServiceURL:       envOr("AI_SERVICE_URL", "http://localhost:8001"),
		CORSAllowedOrigins: splitCSV(envOr("CORS_ALLOWED_ORIGINS", "http://localhost:5173")),
		RequestTimeout:     requestTimeout,
		ShutdownTimeout:    shutdownTimeout,
		JWTSecret:          envOr("JWT_SECRET", "development-only-secret-change-me-32-chars"),
		AccessTokenTTL:     15 * time.Minute,
		RefreshTokenTTL:    7 * 24 * time.Hour,
	}
	return cfg, cfg.Validate()
}

func (c Config) Validate() error {
	if err := validator.New().Struct(c); err != nil {
		return fmt.Errorf("validate configuration: %w", err)
	}
	if c.Environment == "production" && c.JWTSecret == "development-only-secret-change-me-32-chars" {
		return fmt.Errorf("JWT_SECRET must be replaced in production")
	}
	if c.Environment == "production" && len(c.JWTSecret) < minimumProductionJWTSecretLength {
		return fmt.Errorf("JWT_SECRET must contain at least %d characters in production", minimumProductionJWTSecretLength)
	}
	for label, value := range map[string]string{"DATABASE_URL": c.DatabaseURL, "AI_SERVICE_URL": c.AIServiceURL} {
		parsed, err := url.ParseRequestURI(value)
		if err != nil || parsed.Scheme == "" || parsed.Host == "" {
			return fmt.Errorf("%s must be an absolute URL", label)
		}
	}
	for _, origin := range c.CORSAllowedOrigins {
		parsed, err := url.ParseRequestURI(origin)
		if err != nil || parsed.Scheme == "" || parsed.Host == "" {
			return fmt.Errorf("invalid CORS origin %q", origin)
		}
	}
	return nil
}

func envOr(key, fallback string) string {
	if value := strings.TrimSpace(os.Getenv(key)); value != "" {
		return value
	}
	return fallback
}

func durationEnv(key string, fallback time.Duration) (time.Duration, error) {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback, nil
	}
	duration, err := time.ParseDuration(value)
	if err != nil {
		return 0, fmt.Errorf("%s must be a duration: %w", key, err)
	}
	return duration, nil
}

func splitCSV(value string) []string {
	parts := strings.Split(value, ",")
	result := make([]string, 0, len(parts))
	for _, part := range parts {
		if trimmed := strings.TrimSpace(part); trimmed != "" {
			result = append(result, trimmed)
		}
	}
	return result
}
