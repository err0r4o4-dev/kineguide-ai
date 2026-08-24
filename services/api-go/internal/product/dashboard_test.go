package product

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestBuildDashboardUsesOnlyCompletedSelfRecordedSessions(t *testing.T) {
	now := time.Date(2026, time.August, 24, 12, 0, 0, 0, time.UTC)
	sessions := []Session{
		{Status: "completed", ElapsedSeconds: 90, StartedAt: now},
		{Status: "completed", ElapsedSeconds: 30, StartedAt: now.AddDate(0, 0, -1)},
		{Status: "stopped", ElapsedSeconds: 999, StartedAt: now.AddDate(0, 0, -2)},
	}

	dashboard := BuildDashboard(sessions, now)

	assert.Equal(t, 2, dashboard.CompletedSessions)
	assert.Equal(t, 120, dashboard.TotalSeconds)
	assert.Equal(t, 2, dashboard.CurrentStreak)
}
