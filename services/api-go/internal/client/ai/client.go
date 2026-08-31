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

type TechnicalPoseRequest struct {
	PoseStatus         string    `json:"pose_status"`
	LandmarkVisibility []float64 `json:"landmark_visibility"`
}

type TechnicalPoseResponse struct {
	Status          string   `json:"status"`
	MovementPhase   string   `json:"movement_phase"`
	RepetitionCount *int     `json:"repetition_count"`
	ConfidenceScore *float64 `json:"confidence_score"`
	CameraFeedback  string   `json:"camera_feedback"`
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

func (c *Client) TechnicalPoseFeedback(ctx context.Context, input TechnicalPoseRequest) (TechnicalPoseResponse, error) {
	payload, err := json.Marshal(input)
	if err != nil {
		return TechnicalPoseResponse{}, fmt.Errorf("encode technical pose request: %w", err)
	}
	endpoint := c.baseURL.ResolveReference(&url.URL{Path: "/v1/pose/technical-feedback"})
	request, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint.String(), bytes.NewReader(payload))
	if err != nil {
		return TechnicalPoseResponse{}, fmt.Errorf("create technical pose request: %w", err)
	}
	request.Header.Set("Content-Type", "application/json")
	response, err := c.httpClient.Do(request)
	if err != nil {
		return TechnicalPoseResponse{}, fmt.Errorf("call technical pose service: %w", err)
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		_, _ = io.Copy(io.Discard, io.LimitReader(response.Body, maxResponseBytes))
		return TechnicalPoseResponse{}, errors.New("technical pose service unavailable")
	}
	var result TechnicalPoseResponse
	decoder := json.NewDecoder(io.LimitReader(response.Body, maxResponseBytes))
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&result); err != nil {
		return TechnicalPoseResponse{}, fmt.Errorf("decode technical pose response: %w", err)
	}
	if result.Status != "completed" || result.MovementPhase != "unavailable" || result.RepetitionCount != nil ||
		!oneOfTechnicalFeedback(result.CameraFeedback) ||
		(result.ConfidenceScore != nil && (*result.ConfidenceScore < 0 || *result.ConfidenceScore > 1)) {
		return TechnicalPoseResponse{}, errors.New("invalid technical pose response")
	}
	return result, nil
}

func oneOfTechnicalFeedback(value string) bool {
	for _, option := range []string{
		"waiting_for_camera", "camera_ready", "adjust_camera", "multiple_people_detected",
		"unsupported_exercise", "technical_analysis_unavailable",
	} {
		if value == option {
			return true
		}
	}
	return false
}
