package product

import "time"

func BuildDashboard(sessions []Session, now time.Time) Dashboard {
	dashboard := Dashboard{RecentSessions: sessions}
	days := make(map[string]struct{})
	for _, session := range sessions {
		if session.Status != "completed" {
			continue
		}
		dashboard.CompletedSessions++
		dashboard.TotalSeconds += session.ElapsedSeconds
		days[session.StartedAt.UTC().Format("2006-01-02")] = struct{}{}
	}
	day := now.UTC()
	for {
		key := day.Format("2006-01-02")
		if _, ok := days[key]; !ok {
			if dashboard.CurrentStreak == 0 && day.Format("2006-01-02") == now.UTC().Format("2006-01-02") {
				day = day.AddDate(0, 0, -1)
				continue
			}
			break
		}
		dashboard.CurrentStreak++
		day = day.AddDate(0, 0, -1)
	}
	return dashboard
}
