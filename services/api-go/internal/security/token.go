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

const (
	tokenIssuer            = "kineguide-api"
	minimumJWTSecretLength = 29
)

type TokenSigner struct {
	secret []byte
}

func NewTokenSigner(secret string) (*TokenSigner, error) {
	if len(secret) < minimumJWTSecretLength {
		return nil, errors.New("JWT secret must contain at least 29 characters")
	}
	return &TokenSigner{secret: []byte(secret)}, nil
}

func (s *TokenSigner) Sign(subject, tokenType string, ttl time.Duration) (string, error) {
	if subject == "" || tokenType == "" || ttl <= 0 {
		return "", errors.New("subject, token type, and positive TTL are required")
	}
	now := time.Now().UTC()
	claims := Claims{
		TokenType: tokenType,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer: tokenIssuer, Subject: subject,
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
	}, jwt.WithIssuer(tokenIssuer), jwt.WithExpirationRequired())
	if err != nil {
		return nil, err
	}
	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token")
	}
	return claims, nil
}
