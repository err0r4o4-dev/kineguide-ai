package product

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestBuildDemoActivityPlanUsesOnlyKnownPendingReviewDemos(t *testing.T) {
	plan := BuildDemoActivityPlan()

	assert.Equal(t, "demo_exploration", plan.PlanType)
	assert.Equal(t, "pending_clinical_review", plan.ReviewStatus)
	assert.False(t, plan.Personalized)
	require.Len(t, plan.Days, 7)

	for index, day := range plan.Days {
		assert.Equal(t, index+1, day.Day)
		require.NotEmpty(t, day.Activities)
		require.NotEmpty(t, day.Exercises)
		assert.Equal(t, day.Activities, day.Exercises)
		for _, exercise := range day.Exercises {
			assert.Equal(t, "pending_clinical_review", exercise.ReviewStatus)
			_, found := FindExercise(exercise.Slug)
			assert.True(t, found)
		}
	}
}
