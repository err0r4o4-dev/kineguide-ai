package product

import "strings"

const maxConversationTitleRunes = 60

// ConversationTitle returns a compact, deterministic topic label derived from
// the user's first message. It avoids sending sensitive chat content to another
// AI request solely to name the conversation.
func ConversationTitle(content string) string {
	normalized := strings.Join(strings.Fields(content), " ")
	runes := []rune(normalized)
	if len(runes) <= maxConversationTitleRunes {
		return normalized
	}
	return strings.TrimSpace(string(runes[:maxConversationTitleRunes-1])) + "…"
}
