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
