package product

import (
	"fmt"
	"strings"
)

// EducationalExerciseChatResponse returns a deterministic list of the existing
// pending-review demonstrations. It never selects an exercise for a symptom.
func EducationalExerciseChatResponse(locale, message string) (string, bool) {
	if !requestsMovementDemonstrations(message) {
		return "", false
	}

	catalog := BuildEducationalClinicalCatalog(locale)
	exercises := make([]EducationalExercise, 0, len(catalog.Exercises))
	for _, exercise := range catalog.Exercises {
		if exercise.ReviewStatus == ReviewPendingClinical && exercise.DemoOnly && exercise.NotForClinicalUse {
			exercises = append(exercises, exercise)
		}
	}
	if len(exercises) == 0 {
		return "", false
	}

	var response strings.Builder
	if normalizeEducationalLocale(locale) == "en" {
		response.WriteString("Sure. Here are the movement demonstrations currently available for you to explore:\n\n")
		for index, exercise := range exercises {
			fmt.Fprintf(&response, "%d. %s\n", index+1, exercise.Title)
		}
		response.WriteString("\nPending professional review · Educational prototype")
	} else {
		response.WriteString("ได้เลย นี่คือรายการท่าสาธิตที่มีในระบบให้คุณเลือกดู:\n\n")
		for index, exercise := range exercises {
			fmt.Fprintf(&response, "%d. %s\n", index+1, exercise.Title)
		}
		response.WriteString("\nรอตรวจสอบโดยผู้เชี่ยวชาญ · ต้นแบบเพื่อการศึกษา")
	}
	return response.String(), true
}

func requestsMovementDemonstrations(message string) bool {
	normalized := strings.ToLower(strings.TrimSpace(message))
	movementTerms := []string{"ท่า", "ออกกำลังกาย", "exercise", "movement"}
	requestTerms := []string{"แนะนำ", "มีอะไร", "มีท่า", "ขอดู", "แสดง", "recommend", "suggest", "show", "what", "which"}
	return containsAny(normalized, movementTerms) && containsAny(normalized, requestTerms)
}

func containsAny(value string, terms []string) bool {
	for _, term := range terms {
		if strings.Contains(value, term) {
			return true
		}
	}
	return false
}
