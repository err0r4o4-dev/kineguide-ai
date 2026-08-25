package security

import (
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/require"
)

const testJWTSecret = "test-secret-with-at-least-thirty-two-characters"

func TestTokenSignerUsesFixedIssuer(t *testing.T) {
	signer, err := NewTokenSigner(testJWTSecret)
	require.NoError(t, err)

	encoded, err := signer.Sign("user-id", "access", time.Minute)
	require.NoError(t, err)

	claims, err := signer.Parse(encoded)
	require.NoError(t, err)
	require.Equal(t, tokenIssuer, claims.Issuer)
}

func TestTokenSignerRejectsDifferentIssuer(t *testing.T) {
	signer, err := NewTokenSigner(testJWTSecret)
	require.NoError(t, err)

	encoded, err := jwt.NewWithClaims(jwt.SigningMethodHS256, Claims{
		TokenType: "access",
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    "different-service",
			Subject:   "user-id",
			ExpiresAt: jwt.NewNumericDate(time.Now().UTC().Add(time.Minute)),
		},
	}).SignedString([]byte(testJWTSecret))
	require.NoError(t, err)

	_, err = signer.Parse(encoded)
	require.Error(t, err)
}
