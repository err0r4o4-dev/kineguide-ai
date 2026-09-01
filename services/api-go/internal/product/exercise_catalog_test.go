package product

import "testing"

func TestExercisesRemainPendingClinicalReviewAndCategorized(t *testing.T) {
	expected := map[string]string{
		"neck-flexion-demo":           "neck",
		"neck-rotation-demo":          "neck",
		"shoulder-movement-demo":      "shoulder",
		"arm-abduction-research-demo": "shoulder",
		"sit-to-stand-demo":           "lower_back",
		"seated-knee-demo":            "knee",
		"hand-wrist-demo":             "hand",
	}

	if len(Exercises) != 7 {
		t.Fatalf("expected 7 exercises, got %d", len(Exercises))
	}

	for slug, category := range expected {
		exercise, found := FindExercise(slug)
		if !found {
			t.Fatalf("expected exercise %q", slug)
		}
		if exercise.Category != category {
			t.Fatalf("expected category %q for exercise %q, got %q", category, slug, exercise.Category)
		}
		if exercise.ReviewStatus != "pending_clinical_review" {
			t.Fatalf("exercise %q must not bypass clinical review", slug)
		}
	}
}
