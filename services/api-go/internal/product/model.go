package product

import "time"

type User struct {
	ID           string    `json:"id"`
	Email        string    `json:"email"`
	DisplayName  string    `json:"display_name"`
	PasswordHash string    `json:"-"`
	CreatedAt    time.Time `json:"created_at"`
}

type Consent struct {
	ID                    string     `json:"id"`
	UserID                string     `json:"-"`
	PolicyVersion         string     `json:"policy_version"`
	CameraProcessing      bool       `json:"camera_processing"`
	SessionSummaryStorage bool       `json:"session_summary_storage"`
	ResearchUse           bool       `json:"research_use"`
	AcceptedAt            time.Time  `json:"accepted_at"`
	RevokedAt             *time.Time `json:"revoked_at"`
}

func (c Consent) IsActive() bool {
	return c.ID != "" && c.RevokedAt == nil && c.CameraProcessing
}

type Assessment struct {
	ID             string    `json:"id"`
	UserID         string    `json:"-"`
	ConcernArea    string    `json:"concern_area"`
	DurationBand   string    `json:"duration_band"`
	DailyImpact    string    `json:"daily_impact"`
	Goal           string    `json:"goal"`
	Status         string    `json:"status"`
	CreatedAt      time.Time `json:"created_at"`
	RetentionUntil time.Time `json:"retention_until"`
}

type Exercise struct {
	Slug         string `json:"slug"`
	TitleTH      string `json:"title_th"`
	TitleEN      string `json:"title_en"`
	Category     string `json:"category"`
	ReviewStatus string `json:"review_status"`
}

var Exercises = []Exercise{
	{Slug: "sit-to-stand-demo", TitleTH: "สาธิตการลุกนั่งจากเก้าอี้", TitleEN: "Sit-to-stand movement demo", Category: "lower_body", ReviewStatus: "pending_clinical_review"},
	{Slug: "seated-knee-demo", TitleTH: "สาธิตการเหยียดเข่าขณะนั่ง", TitleEN: "Seated knee movement demo", Category: "lower_body", ReviewStatus: "pending_clinical_review"},
	{Slug: "shoulder-movement-demo", TitleTH: "สาธิตการเคลื่อนไหวหัวไหล่", TitleEN: "Shoulder movement demo", Category: "upper_body", ReviewStatus: "pending_clinical_review"},
}

func FindExercise(slug string) (Exercise, bool) {
	for _, exercise := range Exercises {
		if exercise.Slug == slug {
			return exercise, true
		}
	}
	return Exercise{}, false
}

type Session struct {
	ID                string     `json:"id"`
	UserID            string     `json:"-"`
	ExerciseSlug      string     `json:"exercise_slug"`
	Status            string     `json:"status"`
	CameraUsed        bool       `json:"camera_used"`
	ManualRepetitions int        `json:"manual_repetitions"`
	ElapsedSeconds    int        `json:"elapsed_seconds"`
	StartedAt         time.Time  `json:"started_at"`
	CompletedAt       *time.Time `json:"completed_at"`
	RetentionUntil    time.Time  `json:"retention_until"`
}

type RefreshToken struct {
	UserID    string
	ExpiresAt time.Time
}

type Dashboard struct {
	CompletedSessions int       `json:"completed_sessions"`
	CurrentStreak     int       `json:"current_streak"`
	TotalSeconds      int       `json:"total_seconds"`
	RecentSessions    []Session `json:"recent_sessions"`
}
