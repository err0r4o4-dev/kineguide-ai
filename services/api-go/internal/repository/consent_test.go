package repository

import (
	"context"
	"os"
	"testing"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/stretchr/testify/require"

	"github.com/kineguide-ai/kineguide-ai/services/api-go/internal/database"
	"github.com/kineguide-ai/kineguide-ai/services/api-go/internal/product"
)

func TestLatestConsentRepeatedReads(t *testing.T) {
	databaseURL := os.Getenv("TEST_DATABASE_URL")
	if databaseURL == "" {
		t.Skip("TEST_DATABASE_URL is required for PostgreSQL integration coverage")
	}
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	poolConfig, err := pgxpool.ParseConfig(databaseURL)
	require.NoError(t, err)
	poolConfig.MaxConns = 1
	connectionPool, err := pgxpool.NewWithConfig(ctx, poolConfig)
	require.NoError(t, err)
	pool := &database.Pool{Pool: connectionPool}
	defer pool.Close()
	store := NewPostgres(pool)
	_, err = pool.Exec(ctx, `CREATE TEMP TABLE consent_records (LIKE public.consent_records INCLUDING DEFAULTS)`)
	require.NoError(t, err)
	_, err = pool.Exec(ctx, `INSERT INTO consent_records (user_id, policy_version, camera_processing, session_summary_storage) VALUES ('00000000-0000-0000-0000-000000000001', 'prototype-v3', true, true)`)
	require.NoError(t, err)
	for attempt := 0; attempt < 10; attempt++ {
		_, err := store.LatestConsent(ctx, "00000000-0000-0000-0000-000000000000")
		require.ErrorIs(t, err, product.ErrNotFound, "read %d", attempt)
		consent, err := store.LatestConsent(ctx, "00000000-0000-0000-0000-000000000001")
		require.NoError(t, err, "read %d", attempt)
		require.Nil(t, consent.RevokedAt)
		require.True(t, consent.CameraProcessing)
		require.True(t, consent.SessionSummaryStorage)
		require.False(t, consent.AIChatStorage)
	}
	_, err = pool.Exec(ctx, `INSERT INTO consent_records (user_id, policy_version, camera_processing, session_summary_storage, accepted_at, revoked_at) VALUES ('00000000-0000-0000-0000-000000000001', 'prototype-v3', true, true, now() + interval '1 second', now() + interval '2 seconds')`)
	require.NoError(t, err)
	consent, err := store.LatestConsent(ctx, "00000000-0000-0000-0000-000000000001")
	require.NoError(t, err)
	require.NotNil(t, consent.RevokedAt)
	require.False(t, consent.IsActive())
}
