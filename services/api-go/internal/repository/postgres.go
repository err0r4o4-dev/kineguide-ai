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

func (p *Postgres) CreateOAuthUser(ctx context.Context, email, displayName, provider, subject string) (product.User, error) {
	tx, err := p.pool.Begin(ctx)
	if err != nil {
		return product.User{}, err
	}
	defer tx.Rollback(ctx) //nolint:errcheck
	var user product.User
	err = tx.QueryRow(ctx, `
		INSERT INTO users (email, password_hash, display_name)
		VALUES ($1, NULL, $2)
		RETURNING id::text, email, display_name, COALESCE(password_hash, ''), created_at`, email, displayName).
		Scan(&user.ID, &user.Email, &user.DisplayName, &user.PasswordHash, &user.CreatedAt)
	if err != nil {
		return product.User{}, mapError(err)
	}
	if _, err = tx.Exec(ctx, `
		INSERT INTO auth_identities (user_id, provider, provider_subject)
		VALUES ($1, $2, $3)`, user.ID, provider, subject); err != nil {
		return product.User{}, mapError(err)
	}
	if err := tx.Commit(ctx); err != nil {
		return product.User{}, err
	}
	return user, nil
}

func (p *Postgres) UserByEmail(ctx context.Context, email string) (product.User, error) {
	var user product.User
	err := p.pool.QueryRow(ctx, `
		SELECT id::text, email, display_name, COALESCE(password_hash, ''), created_at
		FROM users WHERE email = $1`, email).
		Scan(&user.ID, &user.Email, &user.DisplayName, &user.PasswordHash, &user.CreatedAt)
	return user, mapError(err)
}

func (p *Postgres) UserByID(ctx context.Context, userID string) (product.User, error) {
	var user product.User
	err := p.pool.QueryRow(ctx, `
		SELECT id::text, email, display_name, COALESCE(password_hash, ''), created_at
		FROM users WHERE id = $1`, userID).
		Scan(&user.ID, &user.Email, &user.DisplayName, &user.PasswordHash, &user.CreatedAt)
	return user, mapError(err)
}

func (p *Postgres) UserByAuthIdentity(ctx context.Context, provider, subject string) (product.User, error) {
	var user product.User
	err := p.pool.QueryRow(ctx, `
		SELECT u.id::text, u.email, u.display_name, COALESCE(u.password_hash, ''), u.created_at
		FROM users u
		JOIN auth_identities i ON i.user_id = u.id
		WHERE i.provider = $1 AND i.provider_subject = $2`, provider, subject).
		Scan(&user.ID, &user.Email, &user.DisplayName, &user.PasswordHash, &user.CreatedAt)
	return user, mapError(err)
}

func (p *Postgres) LinkAuthIdentity(ctx context.Context, userID, provider, subject string) error {
	_, err := p.pool.Exec(ctx, `
		INSERT INTO auth_identities (user_id, provider, provider_subject)
		VALUES ($1, $2, $3)`, userID, provider, subject)
	return mapError(err)
}

func (p *Postgres) ListAuthIdentities(ctx context.Context, userID string) ([]product.AuthIdentity, error) {
	rows, err := p.pool.Query(ctx, `
		SELECT provider, created_at FROM auth_identities
		WHERE user_id = $1 ORDER BY provider`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	identities := make([]product.AuthIdentity, 0)
	for rows.Next() {
		var identity product.AuthIdentity
		if err := rows.Scan(&identity.Provider, &identity.CreatedAt); err != nil {
			return nil, err
		}
		identities = append(identities, identity)
	}
	return identities, rows.Err()
}

func (p *Postgres) DeleteAuthIdentity(ctx context.Context, userID, provider string) error {
	tx, err := p.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx) //nolint:errcheck
	var hasPassword bool
	var identityCount int
	if err := tx.QueryRow(ctx, `
		SELECT password_hash IS NOT NULL,
		       (SELECT count(*) FROM auth_identities WHERE user_id = users.id)
		FROM users WHERE id = $1 FOR UPDATE`, userID).Scan(&hasPassword, &identityCount); err != nil {
		return mapError(err)
	}
	if !hasPassword && identityCount <= 1 {
		return product.ErrLastLoginMethod
	}
	command, err := tx.Exec(ctx, `DELETE FROM auth_identities WHERE user_id = $1 AND provider = $2`, userID, provider)
	if err != nil {
		return err
	}
	if command.RowsAffected() == 0 {
		return product.ErrNotFound
	}
	return tx.Commit(ctx)
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
			(user_id, policy_version, camera_processing, session_summary_storage, ai_chat_storage, research_use)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id::text, accepted_at`, consent.UserID, consent.PolicyVersion, consent.CameraProcessing, consent.SessionSummaryStorage, consent.AIChatStorage, consent.ResearchUse).
		Scan(&consent.ID, &consent.AcceptedAt)
	return consent, mapError(err)
}

func (p *Postgres) LatestConsent(ctx context.Context, userID string) (product.Consent, error) {
	var consent product.Consent
	err := p.pool.QueryRow(ctx, `
		SELECT id::text, user_id::text, policy_version, camera_processing,
		       session_summary_storage, ai_chat_storage, research_use, accepted_at, revoked_at
		FROM consent_records WHERE user_id = $1
		ORDER BY accepted_at DESC LIMIT 1`, userID).
		Scan(&consent.ID, &consent.UserID, &consent.PolicyVersion, &consent.CameraProcessing, &consent.SessionSummaryStorage, &consent.AIChatStorage, &consent.ResearchUse, &consent.AcceptedAt, &consent.RevokedAt)
	return consent, mapError(err)
}

func (p *Postgres) CreateConversation(ctx context.Context, conversation product.Conversation) (product.Conversation, error) {
	err := p.pool.QueryRow(ctx, `
		INSERT INTO conversations (user_id, title, locale)
		VALUES ($1, $2, $3)
		RETURNING id::text, created_at, updated_at, retention_policy`,
		conversation.UserID, conversation.Title, conversation.Locale).
		Scan(&conversation.ID, &conversation.CreatedAt, &conversation.UpdatedAt, &conversation.RetentionPolicy)
	return conversation, mapError(err)
}

func (p *Postgres) ConversationByID(ctx context.Context, userID, conversationID string) (product.Conversation, error) {
	var conversation product.Conversation
	err := p.pool.QueryRow(ctx, `
		SELECT id::text, user_id::text, title, locale, created_at, updated_at, retention_policy
		FROM conversations
		WHERE id = $1 AND user_id = $2`, conversationID, userID).
		Scan(&conversation.ID, &conversation.UserID, &conversation.Title, &conversation.Locale, &conversation.CreatedAt, &conversation.UpdatedAt, &conversation.RetentionPolicy)
	return conversation, mapError(err)
}

func (p *Postgres) ListConversations(ctx context.Context, userID string, limit int) ([]product.Conversation, error) {
	rows, err := p.pool.Query(ctx, `
		SELECT id::text, user_id::text, title, locale, created_at, updated_at, retention_policy
		FROM conversations
		WHERE user_id = $1
		ORDER BY updated_at DESC LIMIT $2`, userID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	conversations := make([]product.Conversation, 0)
	for rows.Next() {
		var conversation product.Conversation
		if err := rows.Scan(&conversation.ID, &conversation.UserID, &conversation.Title, &conversation.Locale, &conversation.CreatedAt, &conversation.UpdatedAt, &conversation.RetentionPolicy); err != nil {
			return nil, err
		}
		conversations = append(conversations, conversation)
	}
	return conversations, rows.Err()
}

func (p *Postgres) DeleteConversation(ctx context.Context, userID, conversationID string) error {
	command, err := p.pool.Exec(ctx, `DELETE FROM conversations WHERE id = $1 AND user_id = $2`, conversationID, userID)
	if err != nil {
		return err
	}
	if command.RowsAffected() == 0 {
		return product.ErrNotFound
	}
	return nil
}

func (p *Postgres) ListMessages(ctx context.Context, userID, conversationID string, limit int) ([]product.Message, error) {
	rows, err := p.pool.Query(ctx, `
		SELECT m.id::text, m.conversation_id::text, m.role, m.content, m.created_at
		FROM conversation_messages m
		JOIN conversations c ON c.id = m.conversation_id
		WHERE c.id = $1 AND c.user_id = $2
		ORDER BY m.sequence DESC LIMIT $3`, conversationID, userID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	messages := make([]product.Message, 0)
	for rows.Next() {
		var message product.Message
		if err := rows.Scan(&message.ID, &message.ConversationID, &message.Role, &message.Content, &message.CreatedAt); err != nil {
			return nil, err
		}
		messages = append(messages, message)
	}
	for left, right := 0, len(messages)-1; left < right; left, right = left+1, right-1 {
		messages[left], messages[right] = messages[right], messages[left]
	}
	return messages, rows.Err()
}

func (p *Postgres) SaveConversationExchange(ctx context.Context, userID, conversationID, title, userContent, assistantContent string) ([]product.Message, error) {
	tx, err := p.pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx) //nolint:errcheck
	var lockedConversationID string
	var hasMessages bool
	if err := tx.QueryRow(ctx, `
		SELECT c.id::text, EXISTS (
			SELECT 1 FROM conversation_messages m WHERE m.conversation_id = c.id
		)
		FROM conversations c
		WHERE c.id = $1 AND c.user_id = $2
		FOR UPDATE`, conversationID, userID).Scan(&lockedConversationID, &hasMessages); err != nil {
		return nil, mapError(err)
	}
	messages := make([]product.Message, 0, 2)
	for _, message := range []product.Message{
		{ConversationID: conversationID, Role: "user", Content: userContent},
		{ConversationID: conversationID, Role: "assistant", Content: assistantContent},
	} {
		err := tx.QueryRow(ctx, `
			INSERT INTO conversation_messages (conversation_id, role, content)
			VALUES ($1, $2, $3)
			RETURNING id::text, created_at`, conversationID, message.Role, message.Content).
			Scan(&message.ID, &message.CreatedAt)
		if err != nil {
			return nil, err
		}
		messages = append(messages, message)
	}
	if _, err := tx.Exec(ctx, `
		UPDATE conversations
		SET title = CASE WHEN $2 THEN title ELSE $3 END, updated_at = now()
		WHERE id = $1`, conversationID, hasMessages, title); err != nil {
		return nil, err
	}
	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}
	return messages, nil
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

func (p *Postgres) SaveHealthProfile(ctx context.Context, profile product.HealthProfile) (product.HealthProfile, error) {
	err := p.pool.QueryRow(ctx, `
		INSERT INTO health_profiles
			(user_id, birth_date, sex, height_cm, weight_kg, track_weight, care_areas,
			 recent_injury, clinician_managed, assistive_device, warning_signs, goals,
			 activity_level, preferred_time, equipment, camera_preference, activity_notifications, notes, consent_version)
		VALUES ($1, $2::date, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
		ON CONFLICT (user_id) DO UPDATE SET
			birth_date = EXCLUDED.birth_date, sex = EXCLUDED.sex,
			height_cm = EXCLUDED.height_cm, weight_kg = EXCLUDED.weight_kg,
			track_weight = EXCLUDED.track_weight, care_areas = EXCLUDED.care_areas,
			recent_injury = EXCLUDED.recent_injury, clinician_managed = EXCLUDED.clinician_managed,
			assistive_device = EXCLUDED.assistive_device, warning_signs = EXCLUDED.warning_signs,
			goals = EXCLUDED.goals, activity_level = EXCLUDED.activity_level,
			preferred_time = EXCLUDED.preferred_time, equipment = EXCLUDED.equipment,
			camera_preference = EXCLUDED.camera_preference, activity_notifications = EXCLUDED.activity_notifications,
			notes = EXCLUDED.notes,
			consent_version = EXCLUDED.consent_version, consented_at = now(), updated_at = now(),
			retention_until = now() + interval '365 days'
		RETURNING id::text, user_id::text, birth_date::text, sex, height_cm, weight_kg,
		          track_weight, care_areas, recent_injury, clinician_managed, assistive_device,
		          warning_signs, goals, activity_level, preferred_time, equipment,
		          camera_preference, activity_notifications, notes, status, consent_version, consented_at,
		          created_at, updated_at, retention_until`,
		profile.UserID, profile.BirthDate, profile.Sex, profile.HeightCM, profile.WeightKG,
		profile.TrackWeight, profile.CareAreas, profile.RecentInjury, profile.ClinicianManaged,
		profile.AssistiveDevice, profile.WarningSigns, profile.Goals, profile.ActivityLevel,
		profile.PreferredTime, profile.Equipment, profile.CameraPreference, profile.ActivityNotifications, profile.Notes,
		profile.ConsentVersion).
		Scan(&profile.ID, &profile.UserID, &profile.BirthDate, &profile.Sex, &profile.HeightCM,
			&profile.WeightKG, &profile.TrackWeight, &profile.CareAreas, &profile.RecentInjury,
			&profile.ClinicianManaged, &profile.AssistiveDevice, &profile.WarningSigns,
			&profile.Goals, &profile.ActivityLevel, &profile.PreferredTime, &profile.Equipment,
			&profile.CameraPreference, &profile.ActivityNotifications, &profile.Notes, &profile.Status, &profile.ConsentVersion,
			&profile.ConsentedAt, &profile.CreatedAt, &profile.UpdatedAt, &profile.RetentionUntil)
	return profile, mapError(err)
}

func (p *Postgres) HealthProfile(ctx context.Context, userID string) (product.HealthProfile, error) {
	var profile product.HealthProfile
	err := p.pool.QueryRow(ctx, `
		SELECT id::text, user_id::text, birth_date::text, sex, height_cm, weight_kg,
		       track_weight, care_areas, recent_injury, clinician_managed, assistive_device,
		       warning_signs, goals, activity_level, preferred_time, equipment,
		       camera_preference, activity_notifications, notes, status, consent_version, consented_at,
		       created_at, updated_at, retention_until
		FROM health_profiles WHERE user_id = $1`, userID).
		Scan(&profile.ID, &profile.UserID, &profile.BirthDate, &profile.Sex, &profile.HeightCM,
			&profile.WeightKG, &profile.TrackWeight, &profile.CareAreas, &profile.RecentInjury,
			&profile.ClinicianManaged, &profile.AssistiveDevice, &profile.WarningSigns,
			&profile.Goals, &profile.ActivityLevel, &profile.PreferredTime, &profile.Equipment,
			&profile.CameraPreference, &profile.ActivityNotifications, &profile.Notes, &profile.Status, &profile.ConsentVersion,
			&profile.ConsentedAt, &profile.CreatedAt, &profile.UpdatedAt, &profile.RetentionUntil)
	return profile, mapError(err)
}

func (p *Postgres) DeleteHealthProfile(ctx context.Context, userID string) error {
	_, err := p.pool.Exec(ctx, `DELETE FROM health_profiles WHERE user_id = $1`, userID)
	return err
}

func (p *Postgres) CreateSession(ctx context.Context, session product.Session) (product.Session, error) {
	err := p.pool.QueryRow(ctx, `
		INSERT INTO exercise_sessions (user_id, exercise_slug, activity_kind, measurement_mode, camera_used)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id::text, status, manual_repetitions, elapsed_seconds, started_at, retention_until`, session.UserID, session.ExerciseSlug, session.ActivityKind, session.MeasurementMode, session.CameraUsed).
		Scan(&session.ID, &session.Status, &session.ManualRepetitions, &session.ElapsedSeconds, &session.StartedAt, &session.RetentionUntil)
	session.ActivitySlug = session.ExerciseSlug
	session.ManualCycles = session.ManualRepetitions
	return session, mapError(err)
}

func (p *Postgres) UpdateSession(ctx context.Context, session product.Session) (product.Session, error) {
	err := p.pool.QueryRow(ctx, `
		UPDATE exercise_sessions
		SET status = $3, manual_repetitions = $4, elapsed_seconds = $5,
		    completed_at = CASE WHEN $3 IN ('completed', 'stopped') THEN now() ELSE completed_at END
		WHERE id = $1 AND user_id = $2
		RETURNING exercise_slug, activity_kind, measurement_mode, camera_used, started_at, completed_at, retention_until`, session.ID, session.UserID, session.Status, session.ManualRepetitions, session.ElapsedSeconds).
		Scan(&session.ExerciseSlug, &session.ActivityKind, &session.MeasurementMode, &session.CameraUsed, &session.StartedAt, &session.CompletedAt, &session.RetentionUntil)
	session.ActivitySlug = session.ExerciseSlug
	session.ManualCycles = session.ManualRepetitions
	return session, mapError(err)
}

func (p *Postgres) SessionByID(ctx context.Context, userID, sessionID string) (product.Session, error) {
	var session product.Session
	err := p.pool.QueryRow(ctx, `
		SELECT id::text, user_id::text, exercise_slug, activity_kind, measurement_mode, status, camera_used,
		       manual_repetitions, elapsed_seconds, started_at, completed_at, retention_until
		FROM exercise_sessions WHERE id = $1 AND user_id = $2`, sessionID, userID).
		Scan(&session.ID, &session.UserID, &session.ExerciseSlug, &session.ActivityKind, &session.MeasurementMode, &session.Status, &session.CameraUsed, &session.ManualRepetitions, &session.ElapsedSeconds, &session.StartedAt, &session.CompletedAt, &session.RetentionUntil)
	session.ActivitySlug = session.ExerciseSlug
	session.ManualCycles = session.ManualRepetitions
	return session, mapError(err)
}

func (p *Postgres) ListSessions(ctx context.Context, userID string, limit int) ([]product.Session, error) {
	rows, err := p.pool.Query(ctx, `
		SELECT id::text, user_id::text, exercise_slug, activity_kind, measurement_mode, status, camera_used,
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
		if err := rows.Scan(&session.ID, &session.UserID, &session.ExerciseSlug, &session.ActivityKind, &session.MeasurementMode, &session.Status, &session.CameraUsed, &session.ManualRepetitions, &session.ElapsedSeconds, &session.StartedAt, &session.CompletedAt, &session.RetentionUntil); err != nil {
			return nil, err
		}
		session.ActivitySlug = session.ExerciseSlug
		session.ManualCycles = session.ManualRepetitions
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
