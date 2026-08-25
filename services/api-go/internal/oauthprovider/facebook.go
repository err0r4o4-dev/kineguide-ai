package oauthprovider

import (
	"context"
	"errors"
	"net/http"
	"net/url"
)

const (
	facebookAuthorizationEndpoint = "https://www.facebook.com/dialog/oauth"
	facebookTokenEndpoint         = "https://graph.facebook.com/oauth/access_token"
	facebookProfileEndpoint       = "https://graph.facebook.com/me"
)

type FacebookProvider struct {
	clientID     string
	clientSecret string
	redirectURL  string
	httpClient   *http.Client
}

func NewFacebook(clientID, clientSecret, redirectURL string, client *http.Client) *FacebookProvider {
	return &FacebookProvider{clientID: clientID, clientSecret: clientSecret, redirectURL: redirectURL, httpClient: client}
}

func (p *FacebookProvider) Name() string { return Facebook }

func (p *FacebookProvider) AuthorizationURL(state, _ string, codeChallenge string) string {
	values := url.Values{
		"client_id":             {p.clientID},
		"redirect_uri":          {p.redirectURL},
		"response_type":         {"code"},
		"scope":                 {"public_profile,email"},
		"state":                 {state},
		"code_challenge":        {codeChallenge},
		"code_challenge_method": {"S256"},
	}
	return facebookAuthorizationEndpoint + "?" + values.Encode()
}

func (p *FacebookProvider) Exchange(ctx context.Context, code, verifier, _ string) (Identity, error) {
	var token struct {
		AccessToken string `json:"access_token"`
	}
	err := postForm(ctx, p.httpClient, facebookTokenEndpoint, url.Values{
		"client_id": {p.clientID}, "client_secret": {p.clientSecret}, "code": {code},
		"code_verifier": {verifier}, "redirect_uri": {p.redirectURL},
	}, &token)
	if err != nil || token.AccessToken == "" {
		return Identity{}, errors.New("unable to exchange Facebook authorization code")
	}

	profileURL := facebookProfileEndpoint + "?" + url.Values{"fields": {"id,name,email"}}.Encode()
	var profile struct {
		ID    string `json:"id"`
		Name  string `json:"name"`
		Email string `json:"email"`
	}
	if err := getJSON(ctx, p.httpClient, profileURL, token.AccessToken, &profile); err != nil || profile.ID == "" || profile.Email == "" {
		return Identity{}, errors.New("Facebook did not provide the required account identity")
	}
	return Identity{Provider: Facebook, Subject: profile.ID, Email: profile.Email, DisplayName: profile.Name}, nil
}
