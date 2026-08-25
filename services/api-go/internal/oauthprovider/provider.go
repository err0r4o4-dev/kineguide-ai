package oauthprovider

import "context"

const (
	Google   = "google"
	Facebook = "facebook"
)

type Identity struct {
	Provider    string
	Subject     string
	Email       string
	DisplayName string
}

type Provider interface {
	Name() string
	AuthorizationURL(state, nonce, codeChallenge string) string
	Exchange(context.Context, string, string, string) (Identity, error)
}
