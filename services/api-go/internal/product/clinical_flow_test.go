package product

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestPendingEducationalContentCannotBecomeClinicalRecommendation(t *testing.T) {
	catalog := BuildEducationalClinicalCatalog("th")

	require.NotEmpty(t, catalog.Exercises)
	for _, exercise := range catalog.Exercises {
		assert.Equal(t, ReviewPendingClinical, exercise.ReviewStatus)
		assert.True(t, exercise.DemoOnly)
		assert.True(t, exercise.NotForClinicalUse)
		assert.False(t, EligibleForProductionClinicalFlow(exercise.ClinicalMetadata))
		assert.Empty(t, exercise.SourceReferences)
	}
}
func TestApprovedReviewMetadataRequiresReviewerTimestampAndSource(t *testing.T) {
	metadata := ClinicalMetadata{
		ID: "synthetic-review-fixture", Version: "1.0.0", Locale: "en",
		ReviewStatus: ReviewApproved, DemoOnly: false, NotForClinicalUse: false,
		LastUpdatedAt: time.Date(2026, 8, 31, 0, 0, 0, 0, time.UTC),
	}

	assert.False(t, EligibleForProductionClinicalFlow(metadata))
	reviewer := "qualified-reviewer-fixture"
	reviewedAt := time.Date(2026, 8, 31, 1, 0, 0, 0, time.UTC)
	metadata.ReviewedBy = &reviewer
	metadata.ReviewedAt = &reviewedAt
	metadata.SourceReferences = []string{"reference-fixture-v1"}

	assert.True(t, EligibleForProductionClinicalFlow(metadata))
}

func TestDemoStopPlaceholderStopsEducationalFlow(t *testing.T) {
	result, err := EvaluateEducationalScreening("th", []ScreeningAnswer{{
		QuestionID: "demo-screening-placeholder-v1",
		OptionID:   "demo-stop-selected",
	}})

	require.NoError(t, err)
	assert.Equal(t, ScreeningStopped, result.Outcome)
	assert.Empty(t, result.Exercises)
	assert.True(t, result.DemoOnly)
}
