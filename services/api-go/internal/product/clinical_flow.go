package product

import (
	"errors"
	"time"
)

type ReviewStatus string

const (
	ReviewDraft           ReviewStatus = "draft"
	ReviewPendingClinical ReviewStatus = "pending_clinical_review"
	ReviewApproved        ReviewStatus = "approved"
	ReviewRejected        ReviewStatus = "rejected"
	ReviewArchived        ReviewStatus = "archived"

	ScreeningStopped   = "stopped_demo_placeholder"
	ScreeningContinues = "demo_exercises_available"
)

var reviewWorkflow = []ReviewStatus{
	ReviewDraft,
	ReviewPendingClinical,
	ReviewApproved,
	ReviewRejected,
	ReviewArchived,
}

var educationalContentUpdatedAt = time.Date(2026, 8, 31, 0, 0, 0, 0, time.UTC)

// ClinicalMetadata is embedded into every educational-clinical content record.
// Pending mock records intentionally have no reviewer, review time, or source reference.
type ClinicalMetadata struct {
	ID                string       `json:"id"`
	Version           string       `json:"version"`
	Locale            string       `json:"locale"`
	ReviewStatus      ReviewStatus `json:"reviewStatus"`
	DemoOnly          bool         `json:"demoOnly"`
	NotForClinicalUse bool         `json:"notForClinicalUse"`
	ReviewedBy        *string      `json:"reviewedBy"`
	ReviewedAt        *time.Time   `json:"reviewedAt"`
	SourceReferences  []string     `json:"sourceReferences"`
	LastUpdatedAt     time.Time    `json:"lastUpdatedAt"`
}

type ScreeningOption struct {
	ID    string `json:"id"`
	Label string `json:"label"`
}

type ScreeningQuestion struct {
	ClinicalMetadata
	Prompt  string            `json:"prompt"`
	Options []ScreeningOption `json:"options"`
}

type RedFlagPlaceholder struct {
	ClinicalMetadata
	TriggerOptionID string `json:"triggerOptionId"`
	Label           string `json:"label"`
}

type EducationalExercise struct {
	ClinicalMetadata
	Slug        string `json:"slug"`
	Title       string `json:"title"`
	Description string `json:"description"`
}

type ContraindicationPlaceholder struct {
	ClinicalMetadata
	Label string `json:"label"`
}

type StopConditionPlaceholder struct {
	ClinicalMetadata
	TriggerOptionID string `json:"triggerOptionId"`
	Label           string `json:"label"`
}

type ClinicalReference struct {
	ClinicalMetadata
	Title string  `json:"title"`
	URL   *string `json:"url"`
}

func referenceURL(value string) *string { return &value }

func pendingClinicalReferences(locale string) []ClinicalReference {
	items := []struct{ id, title, url string }{
		{"evidence-pmid-25780258", "Neck and shoulder stretching among office workers (PMID 25780258)", "https://pubmed.ncbi.nlm.nih.gov/25780258/"},
		{"evidence-jphys-2023-0176", "Self-administered stretching versus motor control exercise for chronic non-specific low back pain", "https://doi.org/10.1016/j.jphys.2023.02.016"},
		{"evidence-pmc-9824820", "Physiotherapy Exercise Classification with Single-Camera Pose Detection", "https://pmc.ncbi.nlm.nih.gov/articles/PMC9824820/"},
		{"evidence-pmc-10781250", "A Machine Learning App for Monitoring Physical Therapy at Home", "https://pmc.ncbi.nlm.nih.gov/articles/PMC10781250/"},
		{"evidence-offistretch", "OffiStretch: camera-based real-time feedback for daily stretching exercises", "https://doi.org/10.1007/s00371-024-03450-y"},
		{"evidence-pmc-12749503", "Real-time Action Scoring System", "https://pmc.ncbi.nlm.nih.gov/articles/PMC12749503/"},
		{"evidence-who-low-back-pain", "WHO guideline for non-surgical management of chronic primary low back pain", "https://www.who.int/publications/i/item/9789240081789"},
		{"evidence-nice-ng59", "NICE guideline NG59: Low back pain and sciatica", "https://www.nice.org.uk/guidance/ng59"},
		{"evidence-jospt-neck-2017", "Neck Pain Clinical Practice Guideline", "https://doi.org/10.2519/jospt.2017.0302"},
		{"evidence-jospt-rotator-cuff-2025", "Rotator Cuff Tendinopathy Clinical Practice Guideline", "https://doi.org/10.2519/jospt.2025.13182"},
	}
	result := make([]ClinicalReference, 0, len(items))
	for _, item := range items {
		result = append(result, ClinicalReference{ClinicalMetadata: pendingMetadata(item.id, locale), Title: item.title, URL: referenceURL(item.url)})
	}
	return result
}

type EducationalClinicalCatalog struct {
	ReviewWorkflow     []ReviewStatus                `json:"reviewWorkflow"`
	ScreeningQuestions []ScreeningQuestion           `json:"screeningQuestions"`
	RedFlags           []RedFlagPlaceholder          `json:"redFlags"`
	Exercises          []EducationalExercise         `json:"exercises"`
	Contraindications  []ContraindicationPlaceholder `json:"contraindications"`
	StopConditions     []StopConditionPlaceholder    `json:"stopConditions"`
	ClinicalReferences []ClinicalReference           `json:"clinicalReferences"`
}

type ScreeningAnswer struct {
	QuestionID string `json:"questionId"`
	OptionID   string `json:"optionId"`
}

type EducationalScreeningResult struct {
	Outcome           string                `json:"outcome"`
	Message           string                `json:"message"`
	DemoOnly          bool                  `json:"demoOnly"`
	NotForClinicalUse bool                  `json:"notForClinicalUse"`
	Exercises         []EducationalExercise `json:"exercises"`
}

func pendingMetadata(id, locale string) ClinicalMetadata {
	return ClinicalMetadata{
		ID: id, Version: "1.0.0", Locale: locale,
		ReviewStatus: ReviewPendingClinical, DemoOnly: true, NotForClinicalUse: true,
		ReviewedBy: nil, ReviewedAt: nil, SourceReferences: []string{},
		LastUpdatedAt: educationalContentUpdatedAt,
	}
}

func normalizeEducationalLocale(locale string) string {
	if locale == "en" {
		return "en"
	}
	return "th"
}

func BuildEducationalClinicalCatalog(locale string) EducationalClinicalCatalog {
	locale = normalizeEducationalLocale(locale)
	prompt := "คำถามคัดกรองสาธิต ไม่ใช่การคัดกรองทางคลินิก"
	stopLabel := "จำลองการหยุด flow"
	continueLabel := "ดำเนินการสาธิต"
	placeholderLabel := "ตัวหยุดสาธิตแบบ mock ไม่มีความหมายทางคลินิก"
	description := "ท่าสาธิตในระบบต้นแบบ"
	if locale == "en" {
		prompt = "Demonstration screening question; this is not clinical screening."
		stopLabel = "Simulate stopping the flow"
		continueLabel = "Continue the demonstration"
		placeholderLabel = "Mock stop placeholder with no clinical meaning"
		description = "Movement demonstration in the prototype"
	}

	exercises := make([]EducationalExercise, 0, len(Exercises))
	for _, exercise := range Exercises {
		title := exercise.TitleTH
		if locale == "en" {
			title = exercise.TitleEN
		}
		exercises = append(exercises, EducationalExercise{
			ClinicalMetadata: pendingMetadata("educational-"+exercise.Slug, locale),
			Slug:             exercise.Slug, Title: title, Description: description,
		})
	}

	return EducationalClinicalCatalog{
		ReviewWorkflow: append([]ReviewStatus(nil), reviewWorkflow...),
		ScreeningQuestions: []ScreeningQuestion{{
			ClinicalMetadata: pendingMetadata("demo-screening-placeholder-v1", locale),
			Prompt:           prompt,
			Options: []ScreeningOption{
				{ID: "demo-stop-selected", Label: stopLabel},
				{ID: "demo-continue-selected", Label: continueLabel},
			},
		}},
		RedFlags: []RedFlagPlaceholder{{
			ClinicalMetadata: pendingMetadata("demo-red-flag-placeholder-v1", locale),
			TriggerOptionID:  "demo-stop-selected", Label: placeholderLabel,
		}},
		Exercises:         exercises,
		Contraindications: []ContraindicationPlaceholder{},
		StopConditions: []StopConditionPlaceholder{{
			ClinicalMetadata: pendingMetadata("demo-stop-condition-placeholder-v1", locale),
			TriggerOptionID:  "demo-stop-selected", Label: placeholderLabel,
		}},
		ClinicalReferences: pendingClinicalReferences(locale),
	}
}
func EligibleForProductionClinicalFlow(metadata ClinicalMetadata) bool {
	return metadata.ReviewStatus == ReviewApproved &&
		!metadata.DemoOnly &&
		!metadata.NotForClinicalUse &&
		metadata.ReviewedBy != nil && *metadata.ReviewedBy != "" &&
		metadata.ReviewedAt != nil &&
		len(metadata.SourceReferences) > 0
}

func EvaluateEducationalScreening(locale string, answers []ScreeningAnswer) (EducationalScreeningResult, error) {
	locale = normalizeEducationalLocale(locale)
	if len(answers) != 1 || answers[0].QuestionID != "demo-screening-placeholder-v1" {
		return EducationalScreeningResult{}, errors.New("invalid educational screening answer")
	}
	message := "แสดงเฉพาะท่าสาธิตที่ยังรอการตรวจสอบโดยผู้เชี่ยวชาญ"
	if locale == "en" {
		message = "Only pending-review movement demonstrations are shown."
	}
	if answers[0].OptionID == "demo-stop-selected" {
		if locale == "th" {
			message = "ระบบหยุด flow จาก placeholder สาธิต โปรดติดต่อผู้เชี่ยวชาญหากคุณมีข้อกังวลจริง"
		} else {
			message = "The flow stopped at the demo placeholder. Contact a qualified professional for real concerns."
		}
		return EducationalScreeningResult{
			Outcome: ScreeningStopped, Message: message, DemoOnly: true,
			NotForClinicalUse: true, Exercises: []EducationalExercise{},
		}, nil
	}
	if answers[0].OptionID != "demo-continue-selected" {
		return EducationalScreeningResult{}, errors.New("invalid educational screening option")
	}
	return EducationalScreeningResult{
		Outcome: ScreeningContinues, Message: message, DemoOnly: true,
		NotForClinicalUse: true, Exercises: BuildEducationalClinicalCatalog(locale).Exercises,
	}, nil
}
