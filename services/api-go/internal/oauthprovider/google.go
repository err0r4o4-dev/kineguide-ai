package oauthprovider

import (
	"context"
	"crypto/rsa"
	"crypto/subtle"
	"encoding/base64"
	"errors"
	"math/big"
	"net/http"
	"net/url"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

const (
	googleAuthorizationEndpoint = "https://accounts.google.com/o/oauth2/v2/auth"
	googleTokenEndpoint         = "https://oauth2.googleapis.com/token"
	googleJWKSURL               = "https://www.googleapis.com/oauth2/v3/certs"
)

type GoogleProvider struct {
	clientID     string
	clientSecret string
	redirectURL  string
	httpClient   *http.Client
	mu           sync.Mutex
	keys         map[string]*rsa.PublicKey
	keysExpireAt time.Time
}

type googleClaims struct {
	Email         string `json:"email"`
	EmailVerified bool   `json:"email_verified"`
	Name          string `json:"name"`
	Nonce         string `json:"nonce"`
	jwt.RegisteredClaims
}

func NewGoogle(clientID, clientSecret, redirectURL string, client *http.Client) *GoogleProvider {
	return &GoogleProvider{clientID: clientID, clientSecret: clientSecret, redirectURL: redirectURL, httpClient: client}
}

func (p *GoogleProvider) Name() string { return Google }

func (p *GoogleProvider) AuthorizationURL(state, nonce, codeChallenge string) string {
	values := url.Values{
		"client_id":             {p.clientID},
		"redirect_uri":          {p.redirectURL},
		"response_type":         {"code"},
		"scope":                 {"openid email profile"},
		"state":                 {state},
		"nonce":                 {nonce},
		"code_challenge":        {codeChallenge},
		"code_challenge_method": {"S256"},
		"prompt":                {"select_account"},
	}
	return googleAuthorizationEndpoint + "?" + values.Encode()
}

func (p *GoogleProvider) Exchange(ctx context.Context, code, verifier, expectedNonce string) (Identity, error) {
	var token struct {
		IDToken string `json:"id_token"`
	}
	err := postForm(ctx, p.httpClient, googleTokenEndpoint, url.Values{
		"client_id": {p.clientID}, "client_secret": {p.clientSecret}, "code": {code},
		"code_verifier": {verifier}, "grant_type": {"authorization_code"}, "redirect_uri": {p.redirectURL},
	}, &token)
	if err != nil || token.IDToken == "" {
		return Identity{}, errors.New("unable to exchange Google authorization code")
	}

	claims := &googleClaims{}
	parsed, err := jwt.ParseWithClaims(token.IDToken, claims, func(token *jwt.Token) (any, error) {
		kid, _ := token.Header["kid"].(string)
		if kid == "" {
			return nil, errors.New("Google token key ID is missing")
		}
		return p.signingKey(ctx, kid)
	}, jwt.WithAudience(p.clientID), jwt.WithExpirationRequired(), jwt.WithValidMethods([]string{"RS256"}))
	if err != nil || !parsed.Valid || claims.Subject == "" || claims.Email == "" || !claims.EmailVerified {
		return Identity{}, errors.New("Google identity token is invalid")
	}
	if claims.Issuer != "https://accounts.google.com" && claims.Issuer != "accounts.google.com" {
		return Identity{}, errors.New("Google identity token issuer is invalid")
	}
	if subtle.ConstantTimeCompare([]byte(claims.Nonce), []byte(expectedNonce)) != 1 {
		return Identity{}, errors.New("Google identity token nonce is invalid")
	}
	return Identity{Provider: Google, Subject: claims.Subject, Email: claims.Email, DisplayName: claims.Name}, nil
}

func (p *GoogleProvider) signingKey(ctx context.Context, kid string) (*rsa.PublicKey, error) {
	p.mu.Lock()
	defer p.mu.Unlock()
	if time.Now().Before(p.keysExpireAt) {
		if key := p.keys[kid]; key != nil {
			return key, nil
		}
	}
	var document struct {
		Keys []struct {
			KID string `json:"kid"`
			KTY string `json:"kty"`
			N   string `json:"n"`
			E   string `json:"e"`
		} `json:"keys"`
	}
	if err := getJSON(ctx, p.httpClient, googleJWKSURL, "", &document); err != nil {
		return nil, err
	}
	keys := make(map[string]*rsa.PublicKey, len(document.Keys))
	for _, item := range document.Keys {
		if item.KTY != "RSA" {
			continue
		}
		modulus, err := base64.RawURLEncoding.DecodeString(item.N)
		if err != nil {
			continue
		}
		exponent, err := base64.RawURLEncoding.DecodeString(item.E)
		if err != nil || len(exponent) == 0 || len(exponent) > 4 {
			continue
		}
		e := 0
		for _, value := range exponent {
			e = e<<8 + int(value)
		}
		keys[item.KID] = &rsa.PublicKey{N: new(big.Int).SetBytes(modulus), E: e}
	}
	p.keys = keys
	p.keysExpireAt = time.Now().Add(time.Hour)
	key := keys[kid]
	if key == nil {
		return nil, errors.New("Google signing key was not found")
	}
	return key, nil
}
