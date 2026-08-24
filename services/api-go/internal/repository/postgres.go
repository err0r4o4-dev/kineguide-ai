package repository

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"

	"github.com/kineguide-ai/kineguide-ai/services/api-go/internal/database"
	"github.com/kineguide-ai/kineguide-ai/services/api-go/internal/product"
)

type Postgres struct {
	pool *database.Pool
}

func NewPostgres(pool *database.Pool) *Postgres { return &Postgres{pool: pool} }

func (p *Postgres) CreateUser(ctx context.Context, email, passwordHash, displayName string) (product.User, error) {
	var user product.User
	err := p.pool.QueryRow(ctx, `
		INSERT INTO users (email, password_hash, display_name)
		VALUES ($1, $2, $3)
		RETURNING id::text, email, display_name, password_hash, created_at`, email, passwordHash, displayName).
		Scan(&user.ID, &user.Email, &user.DisplayName, &user.PasswordHash, &user.CreatedAt)
	return user, mapError(err)
}

func (p *Postgres) UserByEmail(ctx context.Context, email string) (product.User, error) {
	var user product.User
	err := p.pool.QueryRow(ctx, `
		SELECT id::text, email, display_name, password_hash, created_at
		FROM users WHERE email = $1`, email).
		Scan(&user.ID, &user.Email, &user.DisplayName, &user.PasswordHash, &user.CreatedAt)
	return user, mapError(err)
}

func (p *Postgres) UserByID(ctx context.Context, userID string) (product.User, error) {
	var user product.User
	err := p.pool.QueryRow(ctx, `
		SELECT id::text, email, display_name, password_hash, created_at
		FROM users WHERE id = $1`, userID).
		Scan(&user.ID, &user.Email, &user.DisplayName, &user.PasswordHash, &user.CreatedAt)
	return user, mapError(err)
}

func (p *Postgres) DeleteUser(ctx context.Context, userID string) error {
	command, err := p.pool.Exec(ctx, `DELETE FROM users WHERE id = $1`, userID)
	if err != nil {
		return err
	}
	if command.RowsAffected() == 0 {
		return product.ErrNotFound
	}
	return nil
}

func (p *Postgres) SaveRefreshToken(ctx context.Context, userID, tokenHash string, expiresAt time.Time) error {
	_, err := p.pool.Exec(ctx, `
		INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
		VALUES ($1, $2, $3)`, userID, tokenHash, expiresAt)
	return mapError(err)
}

func (p *Postgres) RefreshToken(ctx context.Context, tokenHash string) (product.RefreshToken, error) {
	var token product.RefreshToken
	err := p.pool.QueryRow(ctx, `
		SELECT user_id::text, expires_at FROM refresh_tokens
		WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > now()`, tokenHash).
		Scan(&token.UserID, &token.ExpiresAt)
	return token, mapError(err)
}

func (p *Postgres) RotateRefreshToken(ctx context.Context, oldHash, newHash, userID string, expiresAt time.Time) error {
	tx, err := p.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx) //nolint:errcheck
	command, err := tx.Exec(ctx, `
		UPDATE refresh_tokens SET revoked_at = now()
		WHERE token_hash = $1 AND user_id = $2 AND revoked_at IS NULL AND expires_at > now()`, oldHash, userID)
	if err != nil {
		return err
	}
	if command.RowsAffected() != 1 {
		return product.ErrNotFound
	}
	if _, err = tx.Exec(ctx, `
		INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
		VALUES ($1, $2, $3)`, userID, newHash, expiresAt); err != nil {
		return err
	}
	return tx.Commit(ctx)
}

func (p *Postgres) RevokeRefreshToken(ctx context.Context, tokenHash string) error {
	_, err := p.pool.Exec(ctx, `
		UPDATE refresh_tokens SET revoked_at = now()
		WHERE token_hash = $1 AND revoked_at IS NULL`, tokenHash)
	return err
}

func (p *Postgres) SaveConsent(ctx context.Context, consent product.Consent) (product.Consent, error) {
	err := p.pool.QueryRow(ctx, `
		INSERT INTO consent_records
			(user_id, policy_version, camera_processing, session_summary_storage, research_use)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id::text, accepted_at`, consent.UserID, consent.PolicyVersion, consent.CameraProcessing, consent.SessionSummaryStorage, consent.ResearchUse).
		Scan(&consent.ID, &consent.AcceptedAt)
	return consent, mapError(err)
}

func (p *Postgres) LatestConsent(ctx context.Context, userID string) (product.Consent, error) {
	var consent product.Consent
	err := p.pool.QueryRow(ctx, `
		SELECT id::text, user_id::text, policy_version, camera_processing,
		       session_summary_storage, research_use, accepted_at, revoked_at
		FROM consent_records WHERE user_id = $1
		ORDER BY accepted_at DESC LIMIT 1`, userID).
		Scan(&consent.ID, &consent.UserID, &consent.PolicyVersion, &consent.CameraProcessing, &consent.SessionSummaryStorage, &consent.ResearchUse, &consent.AcceptedAt, &consent.RevokedAt)
	return consent, mapError(err)
}

func (p *Postgres) RevokeConsent(ctx context.Context, userID string) error {
	_, err := p.pool.Exec(ctx, `
		UPDATE consent_records SET revoked_at = now()
		WHERE user_id = $1 AND revoked_at IS NULL`, userID)
	return err
}

func (p *Postgres) SaveAssessment(ctx context.Context, assessment product.Assessment) (product.Assessment, error) {
	err := p.pool.QueryRow(ctx, `
		INSERT INTO symptom_assessments
			(user_id, concern_area, duration_band, daily_impact, goal)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id::text, status, created_at, retention_until`, assessment.UserID, assessment.ConcernArea, assessment.DurationBand, assessment.DailyImpact, assessment.Goal).
		Scan(&assessment.ID, &assessment.Status, &assessment.CreatedAt, &assessment.RetentionUntil)
	return assessment, mapError(err)
}

func (p *Postgres) LatestAssessment(ctx context.Context, userID string) (product.Assessment, error) {
	var assessment product.Assessment
	err := p.pool.QueryRow(ctx, `
		SELECT id::text, user_id::text, concern_area, duration_band, daily_impact,
		       goal, status, created_at, retention_until
		FROM symptom_assessments WHERE user_id = $1
		ORDER BY created_at DESC LIMIT 1`, userID).
		Scan(&assessment.ID, &assessment.UserID, &assessment.ConcernArea, &assessment.DurationBand, &assessment.DailyImpact, &assessment.Goal, &assessment.Status, &assessment.CreatedAt, &assessment.RetentionUntil)
	return assessment, mapError(err)
}

func (p *Postgres) CreateSession(ctx context.Context, session product.Session) (product.Session, error) {
	err := p.pool.QueryRow(ctx, `
		INSERT INTO exercise_sessions (user_id, exercise_slug, camera_used)
		VALUES ($1, $2, $3)
		RETURNING id::text, status, manual_repetitions, elapsed_seconds, started_at, retention_until`, session.UserID, session.ExerciseSlug, session.CameraUsed).
		Scan(&session.ID, &session.Status, &session.ManualRepetitions, &session.ElapsedSeconds, &session.StartedAt, &session.RetentionUntil)
	return session, mapError(err)
}

func (p *Postgres) UpdateSession(ctx context.Context, session product.Session) (product.Session, error) {
	err := p.pool.QueryRow(ctx, `
		UPDATE exercise_sessions
		SET status = $3, manual_repetitions = $4, elapsed_seconds = $5,
		    completed_at = CASE WHEN $3 IN ('completed', 'stopped') THEN now() ELSE completed_at END
		WHERE id = $1 AND user_id = $2
		RETURNING exercise_slug, camera_used, started_at, completed_at, retention_until`, session.ID, session.UserID, session.Status, session.ManualRepetitions, session.ElapsedSeconds).
		Scan(&session.ExerciseSlug, &session.CameraUsed, &session.StartedAt, &session.CompletedAt, &session.RetentionUntil)
	return session, mapError(err)
}

func (p *Postgres) SessionByID(ctx context.Context, userID, sessionID string) (product.Session, error) {
	var session product.Session
	err := p.pool.QueryRow(ctx, `
		SELECT id::text, user_id::text, exercise_slug, status, camera_used,
		       manual_repetitions, elapsed_seconds, started_at, completed_at, retention_until
		FROM exercise_sessions WHERE id = $1 AND user_id = $2`, sessionID, userID).
		Scan(&session.ID, &session.UserID, &session.ExerciseSlug, &session.Status, &session.CameraUsed, &session.ManualRepetitions, &session.ElapsedSeconds, &session.StartedAt, &session.CompletedAt, &session.RetentionUntil)
	return session, mapError(err)
}

func (p *Postgres) ListSessions(ctx context.Context, userID string, limit int) ([]product.Session, error) {
	rows, err := p.pool.Query(ctx, `
		SELECT id::text, user_id::text, exercise_slug, status, camera_used,
		       manual_repetitions, elapsed_seconds, started_at, completed_at, retention_until
		FROM exercise_sessions WHERE user_id = $1
		ORDER BY started_at DESC LIMIT $2`, userID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	sessions := make([]product.Session, 0)
	for rows.Next() {
		var session product.Session
		if err := rows.Scan(&session.ID, &session.UserID, &session.ExerciseSlug, &session.Status, &session.CameraUsed, &session.ManualRepetitions, &session.ElapsedSeconds, &session.StartedAt, &session.CompletedAt, &session.RetentionUntil); err != nil {
			return nil, err
		}
		sessions = append(sessions, session)
	}
	return sessions, rows.Err()
}

func mapError(err error) error {
	if errors.Is(err, pgx.ErrNoRows) {
		return product.ErrNotFound
	}
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) && pgErr.Code == "23505" {
		return product.ErrConflict
	}
	return err
}
