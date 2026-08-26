package handler

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/kineguide-ai/kineguide-ai/services/api-go/internal/client/ai"
	"github.com/kineguide-ai/kineguide-ai/services/api-go/internal/product"
	"github.com/kineguide-ai/kineguide-ai/services/api-go/internal/security"
)

const chatTestUserID = "1af854ea-56cf-4e98-b7bb-93d347275568"

type chatStore struct {
	product.Store
	consent      product.Consent
	conversation product.Conversation
	saved        []product.Message
}

func (s *chatStore) DeleteConversation(_ context.Context, userID, conversationID string) error {
	if s.conversation.UserID != userID || s.conversation.ID != conversationID {
		return product.ErrNotFound
	}
	s.conversation = product.Conversation{}
	s.saved = nil
	return nil
}

func (s *chatStore) LatestConsent(context.Context, string) (product.Consent, error) {
	return s.consent, nil
}

func (s *chatStore) CreateConversation(_ context.Context, conversation product.Conversation) (product.Conversation, error) {
	conversation.ID = "864cb7ae-64dd-4db4-8200-12b44e5bcab1"
	conversation.CreatedAt = time.Now().UTC()
	conversation.UpdatedAt = conversation.CreatedAt
	conversation.RetentionUntil = conversation.CreatedAt.Add(30 * 24 * time.Hour)
	s.conversation = conversation
	return conversation, nil
}

func (s *chatStore) ConversationByID(_ context.Context, userID, conversationID string) (product.Conversation, error) {
	if s.conversation.UserID != userID || s.conversation.ID != conversationID {
		return product.Conversation{}, product.ErrNotFound
	}
	return s.conversation, nil
}

func (s *chatStore) ListMessages(context.Context, string, string, int) ([]product.Message, error) {
	return append([]product.Message(nil), s.saved...), nil
}

func (s *chatStore) SaveConversationExchange(_ context.Context, userID, conversationID, userContent, assistantContent string) ([]product.Message, error) {
	if s.conversation.UserID != userID || s.conversation.ID != conversationID {
		return nil, product.ErrNotFound
	}
	now := time.Now().UTC()
	s.saved = []product.Message{
		{ID: "55eaef83-72c6-4180-a442-49f6cb698c12", ConversationID: conversationID, Role: "user", Content: userContent, CreatedAt: now},
		{ID: "1eb4cb23-7615-46d6-a702-fe557578b1d6", ConversationID: conversationID, Role: "assistant", Content: assistantContent, CreatedAt: now},
	}
	return s.saved, nil
}

type stubChatAI struct {
	response ai.ChatResponse
	err      error
	calls    int
}

func (s *stubChatAI) Respond(context.Context, ai.ChatRequest) (ai.ChatResponse, error) {
	s.calls++
	return s.response, s.err
}

func authenticatedChatRequest(t *testing.T, method, path, body string) *http.Request {
	t.Helper()
	signer, err := security.NewTokenSigner("test-secret-with-at-least-thirty-two-characters")
	require.NoError(t, err)
	token, err := signer.Sign(chatTestUserID, "access", time.Minute)
	require.NoError(t, err)
	request := httptest.NewRequest(method, path, strings.NewReader(body))
	request.Header.Set("Authorization", "Bearer "+token)
	request.Header.Set("Content-Type", "application/json")
	return request
}

func chatRouter(t *testing.T, store *chatStore, chatAI *stubChatAI) http.Handler {
	t.Helper()
	signer, err := security.NewTokenSigner("test-secret-with-at-least-thirty-two-characters")
	require.NoError(t, err)
	return testRouter(Dependencies{Store: store, Signer: signer, ChatAI: chatAI})
}

func TestChatCreatesAccountScopedConversationAndStoresSuccessfulExchange(t *testing.T) {
	store := &chatStore{consent: product.Consent{ID: "consent", AIChatStorage: true}}
	chatAI := &stubChatAI{response: ai.ChatResponse{Status: "completed", Message: "คำตอบจำลองที่ปลอดภัย"}}
	router := chatRouter(t, store, chatAI)

	created := httptest.NewRecorder()
	router.ServeHTTP(created, authenticatedChatRequest(t, http.MethodPost, "/v1/conversations", `{"locale":"th"}`))
	require.Equal(t, http.StatusCreated, created.Code)

	response := httptest.NewRecorder()
	router.ServeHTTP(response, authenticatedChatRequest(t, http.MethodPost, "/v1/conversations/"+store.conversation.ID+"/messages", `{"content":"ข้อความทดสอบทั่วไป"}`))

	require.Equal(t, http.StatusCreated, response.Code)
	assert.Contains(t, response.Body.String(), `"role":"assistant"`)
	assert.Contains(t, response.Body.String(), "คำตอบจำลองที่ปลอดภัย")
	assert.Equal(t, 1, chatAI.calls)
	assert.Len(t, store.saved, 2)
}

func TestChatRequiresExplicitStorageConsent(t *testing.T) {
	store := &chatStore{consent: product.Consent{ID: "consent", AIChatStorage: false}}
	chatAI := &stubChatAI{}
	router := chatRouter(t, store, chatAI)

	response := httptest.NewRecorder()
	router.ServeHTTP(response, authenticatedChatRequest(t, http.MethodPost, "/v1/conversations", `{"locale":"th"}`))

	assert.Equal(t, http.StatusForbidden, response.Code)
	assert.Contains(t, response.Body.String(), `"code":"AI_CHAT_CONSENT_REQUIRED"`)
	assert.Zero(t, chatAI.calls)
}

func TestChatDoesNotPersistWhenAIIsUnavailable(t *testing.T) {
	store := &chatStore{
		consent:      product.Consent{ID: "consent", AIChatStorage: true},
		conversation: product.Conversation{ID: "864cb7ae-64dd-4db4-8200-12b44e5bcab1", UserID: chatTestUserID, Locale: "th"},
	}
	chatAI := &stubChatAI{err: errors.New("offline")}
	router := chatRouter(t, store, chatAI)

	response := httptest.NewRecorder()
	router.ServeHTTP(response, authenticatedChatRequest(t, http.MethodPost, "/v1/conversations/"+store.conversation.ID+"/messages", `{"content":"ข้อความทดสอบทั่วไป"}`))

	assert.Equal(t, http.StatusServiceUnavailable, response.Code)
	assert.Contains(t, response.Body.String(), `"code":"AI_UNAVAILABLE"`)
	assert.Empty(t, store.saved)
}

func TestDeleteConversationIsScopedToAuthenticatedAccount(t *testing.T) {
	conversationID := "864cb7ae-64dd-4db4-8200-12b44e5bcab1"
	store := &chatStore{conversation: product.Conversation{ID: conversationID, UserID: chatTestUserID}}
	router := chatRouter(t, store, &stubChatAI{})

	notFound := httptest.NewRecorder()
	router.ServeHTTP(notFound, authenticatedChatRequest(t, http.MethodDelete, "/v1/conversations/00000000-0000-0000-0000-000000000000", ""))
	assert.Equal(t, http.StatusNotFound, notFound.Code)
	assert.Equal(t, conversationID, store.conversation.ID)

	deleted := httptest.NewRecorder()
	router.ServeHTTP(deleted, authenticatedChatRequest(t, http.MethodDelete, "/v1/conversations/"+conversationID, ""))
	assert.Equal(t, http.StatusNoContent, deleted.Code)
	assert.Empty(t, store.conversation.ID)
}
