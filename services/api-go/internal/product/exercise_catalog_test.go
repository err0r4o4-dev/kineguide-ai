package product

import "testing"

func TestActivitiesRemainPendingClinicalReviewAndDeclareCaptureBehavior(t *testing.T) {
	expected := map[string]struct {
		kind, view, measurement string
	}{
		"seated-posture-demo":   {"static_posture", "side", "hold_duration"},
		"standing-posture-demo": {"static_posture", "front", "hold_duration"},
		"sit-to-stand-demo":     {"transition", "side", "manual_cycles"},
		"walking-demo":          {"gait", "full_body", "observation"},
	}

	if len(Activities) != 4 {
		t.Fatalf("expected 4 activities, got %d", len(Activities))
	}

	for slug, want := range expected {
		activity, found := FindActivity(slug)
		if !found {
			t.Fatalf("expected activity %q", slug)
		}
		if activity.Kind != want.kind || activity.RequiredView != want.view || activity.MeasurementMode != want.measurement {
			t.Fatalf("unexpected capture behavior for %q: %#v", slug, activity)
		}
		if activity.ReviewStatus != "pending_clinical_review" || !activity.DemoOnly || !activity.NotForClinicalUse {
			t.Fatalf("activity %q must not bypass clinical review", slug)
		}
	}
}

func TestUnknownActivityIsDeniedByDefault(t *testing.T) {
	if _, found := FindActivity("unknown-demo"); found {
		t.Fatal("unknown activity must not receive a fallback definition")
	}
}
