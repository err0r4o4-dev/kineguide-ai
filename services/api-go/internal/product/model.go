package product

import "time"

const (
	CurrentConsentPolicyVersion = "prototype-v3"
	RetentionUntilDeleted       = "until_deleted"
	HealthProfileConsentVersion = "health-profile-v1"
)

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
	AIChatStorage         bool       `json:"ai_chat_storage"`
	ResearchUse           bool       `json:"research_use"`
	AcceptedAt            time.Time  `json:"accepted_at"`
	RevokedAt             *time.Time `json:"revoked_at"`
}

func (c Consent) IsActive() bool {
	return c.ID != "" && c.RevokedAt == nil && c.CameraProcessing
}

func (c Consent) AllowsAIChat() bool {
	return c.ID != "" && c.PolicyVersion == CurrentConsentPolicyVersion && c.RevokedAt == nil && c.AIChatStorage
}

type Conversation struct {
	ID              string    `json:"id"`
	UserID          string    `json:"-"`
	Title           string    `json:"title"`
	Locale          string    `json:"locale"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
	RetentionPolicy string    `json:"retention_policy"`
}

type Message struct {
	ID             string    `json:"id"`
	ConversationID string    `json:"conversation_id"`
	Role           string    `json:"role"`
	Content        string    `json:"content"`
	CreatedAt      time.Time `json:"created_at"`
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

type HealthProfile struct {
	ID                    string    `json:"id"`
	UserID                string    `json:"-"`
	BirthDate             string    `json:"birth_date"`
	Sex                   string    `json:"sex"`
	HeightCM              float64   `json:"height_cm"`
	WeightKG              float64   `json:"weight_kg"`
	TrackWeight           bool      `json:"track_weight"`
	CareAreas             []string  `json:"care_areas"`
	RecentInjury          bool      `json:"recent_injury"`
	ClinicianManaged      bool      `json:"clinician_managed"`
	AssistiveDevice       string    `json:"assistive_device"`
	WarningSigns          []string  `json:"warning_signs"`
	Goals                 []string  `json:"goals"`
	ActivityLevel         string    `json:"activity_level"`
	PreferredTime         string    `json:"preferred_time"`
	Equipment             []string  `json:"equipment"`
	CameraPreference      string    `json:"camera_preference"`
	ActivityNotifications bool      `json:"activity_notifications"`
	Notes                 string    `json:"notes"`
	ProfileStorageConsent bool      `json:"profile_storage_consent,omitempty"`
	Status                string    `json:"status"`
	ConsentVersion        string    `json:"consent_version"`
	ConsentedAt           time.Time `json:"consented_at"`
	CreatedAt             time.Time `json:"created_at"`
	UpdatedAt             time.Time `json:"updated_at"`
	RetentionUntil        time.Time `json:"retention_until"`
}

type Activity struct {
	Slug              string `json:"slug"`
	TitleTH           string `json:"title_th"`
	TitleEN           string `json:"title_en"`
	Category          string `json:"category"`
	Kind              string `json:"kind"`
	RequiredView      string `json:"required_view"`
	MeasurementMode   string `json:"measurement_mode"`
	ReviewStatus      string `json:"review_status"`
	DemoOnly          bool   `json:"demo_only"`
	NotForClinicalUse bool   `json:"not_for_clinical_use"`
	AnalysisAvailable bool   `json:"analysis_available"`
}

var Activities = []Activity{
	{Slug: "seated-posture-demo", TitleTH: "สาธิตท่านั่ง", TitleEN: "Seated posture demonstration", Category: "sitting", Kind: "static_posture", RequiredView: "side", MeasurementMode: "hold_duration", ReviewStatus: "pending_clinical_review", DemoOnly: true, NotForClinicalUse: true, AnalysisAvailable: false},
	{Slug: "standing-posture-demo", TitleTH: "สาธิตท่ายืน", TitleEN: "Standing posture demonstration", Category: "standing", Kind: "static_posture", RequiredView: "front", MeasurementMode: "hold_duration", ReviewStatus: "pending_clinical_review", DemoOnly: true, NotForClinicalUse: true, AnalysisAvailable: false},
	{Slug: "sit-to-stand-demo", TitleTH: "สาธิตการเปลี่ยนจากนั่งเป็นยืน", TitleEN: "Sit-to-stand demonstration", Category: "transition", Kind: "transition", RequiredView: "side", MeasurementMode: "manual_cycles", ReviewStatus: "pending_clinical_review", DemoOnly: true, NotForClinicalUse: true, AnalysisAvailable: false},
	{Slug: "walking-demo", TitleTH: "สาธิตการเดิน", TitleEN: "Walking demonstration", Category: "walking", Kind: "gait", RequiredView: "full_body", MeasurementMode: "observation", ReviewStatus: "pending_clinical_review", DemoOnly: true, NotForClinicalUse: true, AnalysisAvailable: false},
}

// Exercise remains as a compatibility alias while older clients migrate to Activity.
type Exercise = Activity

// Exercises remains as a compatibility view for the existing activity-plan response.
var Exercises = Activities

func FindActivity(slug string) (Activity, bool) {
	for _, activity := range Activities {
		if activity.Slug == slug {
			return activity, true
		}
	}
	return Activity{}, false
}

func FindExercise(slug string) (Exercise, bool) { return FindActivity(slug) }

type Session struct {
	ID              string `json:"id"`
	UserID          string `json:"-"`
	ActivitySlug    string `json:"activity_slug"`
	ActivityKind    string `json:"activity_kind"`
	MeasurementMode string `json:"measurement_mode"`
	ManualCycles    int    `json:"manual_cycles"`
	// Deprecated compatibility fields; use ActivitySlug and ManualCycles.
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

type AuthIdentity struct {
	Provider  string    `json:"provider"`
	CreatedAt time.Time `json:"created_at"`
}

type Dashboard struct {
	CompletedSessions int       `json:"completed_sessions"`
	CurrentStreak     int       `json:"current_streak"`
	TotalSeconds      int       `json:"total_seconds"`
	RecentSessions    []Session `json:"recent_sessions"`
}
