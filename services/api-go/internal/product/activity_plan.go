package product

type ActivityPlanDay struct {
	Day       int        `json:"day"`
	Exercises []Exercise `json:"exercises"`
}

type ActivityPlan struct {
	PlanType     string            `json:"plan_type"`
	ReviewStatus string            `json:"review_status"`
	Personalized bool              `json:"personalized"`
	DurationDays int               `json:"duration_days"`
	Days         []ActivityPlanDay `json:"days"`
}

// BuildDemoActivityPlan returns a deterministic, non-personalized exploration
// schedule. It deliberately carries no dosage, pain score, eligibility rule,
// symptom mapping, or treatment claim while clinical review is pending.
func BuildDemoActivityPlan() ActivityPlan {
	days := make([]ActivityPlanDay, 7)
	for day := range days {
		rotated := make([]Exercise, len(Exercises))
		for index := range Exercises {
			rotated[index] = Exercises[(day+index)%len(Exercises)]
		}
		days[day] = ActivityPlanDay{Day: day + 1, Exercises: rotated}
	}
	return ActivityPlan{
		PlanType:     "demo_exploration",
		ReviewStatus: "pending_clinical_review",
		Personalized: false,
		DurationDays: len(days),
		Days:         days,
	}
}
