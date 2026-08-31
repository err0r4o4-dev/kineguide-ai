package ai

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestRespondUsesBoundedInternalChatContract(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, request *http.Request) {
		assert.Equal(t, http.MethodPost, request.Method)
		assert.Equal(t, "/v1/chat/responses", request.URL.Path)
		assert.Equal(t, "application/json", request.Header.Get("Content-Type"))
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"status":"completed","message":"bounded fixture response","tool_request":"list_pending_evidence"}`))
	}))
	defer server.Close()

	client, err := New(server.URL, time.Second)
	require.NoError(t, err)
	response, err := client.Respond(context.Background(), ChatRequest{
		Locale: "en", Message: "synthetic test message", RecentMessages: []ChatMessage{},
	})

	require.NoError(t, err)
	assert.Equal(t, "bounded fixture response", response.Message)
	require.NotNil(t, response.ToolRequest)
	assert.Equal(t, "list_pending_evidence", *response.ToolRequest)
}

func TestRespondMapsProviderFailureWithoutReturningProviderBody(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusServiceUnavailable)
		_, _ = w.Write([]byte(`{"private":"provider detail"}`))
	}))
	defer server.Close()

	client, err := New(server.URL, time.Second)
	require.NoError(t, err)
	_, err = client.Respond(context.Background(), ChatRequest{Locale: "th", Message: "test"})

	require.Error(t, err)
	assert.NotContains(t, err.Error(), "provider detail")
}
