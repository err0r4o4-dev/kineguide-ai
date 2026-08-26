package ai

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"
)

const maxResponseBytes = 32 * 1024

type ChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ChatRequest struct {
	Locale         string        `json:"locale"`
	Message        string        `json:"message"`
	RecentMessages []ChatMessage `json:"recent_messages"`
}

type ChatResponse struct {
	Status  string `json:"status"`
	Message string `json:"message"`
}

type Client struct {
	baseURL    *url.URL
	httpClient *http.Client
}

func New(rawBaseURL string, timeout time.Duration) (*Client, error) {
	baseURL, err := url.Parse(rawBaseURL)
	if err != nil || baseURL.Scheme == "" || baseURL.Host == "" {
		return nil, fmt.Errorf("invalid AI service URL")
	}
	return &Client{
		baseURL:    baseURL,
		httpClient: &http.Client{Timeout: timeout},
	}, nil
}

func (c *Client) Ping(ctx context.Context) error {
	endpoint := c.baseURL.ResolveReference(&url.URL{Path: "/health"})
	request, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint.String(), nil)
	if err != nil {
		return err
	}
	response, err := c.httpClient.Do(request)
	if err != nil {
		return err
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		return errors.New("AI service health check failed")
	}
	return nil
}

func (c *Client) Respond(ctx context.Context, input ChatRequest) (ChatResponse, error) {
	payload, err := json.Marshal(input)
	if err != nil {
		return ChatResponse{}, fmt.Errorf("encode AI chat request: %w", err)
	}
	endpoint := c.baseURL.ResolveReference(&url.URL{Path: "/v1/chat/responses"})
	request, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint.String(), bytes.NewReader(payload))
	if err != nil {
		return ChatResponse{}, fmt.Errorf("create AI chat request: %w", err)
	}
	request.Header.Set("Content-Type", "application/json")
	response, err := c.httpClient.Do(request)
	if err != nil {
		return ChatResponse{}, fmt.Errorf("call AI chat service: %w", err)
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		_, _ = io.Copy(io.Discard, io.LimitReader(response.Body, maxResponseBytes))
		return ChatResponse{}, errors.New("AI chat service unavailable")
	}
	var result ChatResponse
	decoder := json.NewDecoder(io.LimitReader(response.Body, maxResponseBytes))
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&result); err != nil {
		return ChatResponse{}, fmt.Errorf("decode AI chat response: %w", err)
	}
	if result.Status != "completed" || result.Message == "" || len([]rune(result.Message)) > 4000 {
		return ChatResponse{}, errors.New("invalid AI chat response")
	}
	return result, nil
}
