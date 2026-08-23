package security

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	TokenType string `json:"token_type"`
	jwt.RegisteredClaims
}

type TokenSigner struct {
	secret []byte
	issuer string
}

func NewTokenSigner(secret, issuer string) (*TokenSigner, error) {
	if len(secret) < 32 {
		return nil, errors.New("JWT secret must contain at least 32 characters")
	}
	if issuer == "" {
		return nil, errors.New("JWT issuer is required")
	}
	return &TokenSigner{secret: []byte(secret), issuer: issuer}, nil
}

func (s *TokenSigner) Sign(subject, tokenType string, ttl time.Duration) (string, error) {
	if subject == "" || tokenType == "" || ttl <= 0 {
		return "", errors.New("subject, token type, and positive TTL are required")
	}
	now := time.Now().UTC()
	claims := Claims{
		TokenType: tokenType,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer: s.issuer, Subject: subject,
			IssuedAt: jwt.NewNumericDate(now), ExpiresAt: jwt.NewNumericDate(now.Add(ttl)),
		},
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(s.secret)
}

func (s *TokenSigner) Parse(encoded string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(encoded, &Claims{}, func(token *jwt.Token) (any, error) {
		if token.Method != jwt.SigningMethodHS256 {
			return nil, errors.New("unexpected signing method")
		}
		return s.secret, nil
	}, jwt.WithIssuer(s.issuer), jwt.WithExpirationRequired())
	if err != nil {
		return nil, err
	}
	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token")
	}
	return claims, nil
}
