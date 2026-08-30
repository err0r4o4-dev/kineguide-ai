package product

import "testing"

func TestREHAB246ResearchExercisesRemainPendingClinicalReview(t *testing.T) {
	slugs := []string{
		"arm-abduction-research-demo",
		"arm-vw-research-demo",
		"table-push-up-research-demo",
		"standing-leg-abduction-research-demo",
		"lunge-research-demo",
		"squat-research-demo",
	}

	for _, slug := range slugs {
		exercise, found := FindExercise(slug)
		if !found {
			t.Fatalf("expected research exercise %q", slug)
		}
		if exercise.ReviewStatus != "pending_clinical_review" {
			t.Fatalf("exercise %q must not bypass clinical review", slug)
		}
	}
}
