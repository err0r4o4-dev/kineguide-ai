package product

import (
	"context"
	"errors"
	"time"
)

var (
	ErrNotFound        = errors.New("not found")
	ErrConflict        = errors.New("conflict")
	ErrLastLoginMethod = errors.New("last login method")
)

type Store interface {
	CreateUser(context.Context, string, string, string) (User, error)
	CreateOAuthUser(context.Context, string, string, string, string) (User, error)
	UserByEmail(context.Context, string) (User, error)
	UserByID(context.Context, string) (User, error)
	UserByAuthIdentity(context.Context, string, string) (User, error)
	LinkAuthIdentity(context.Context, string, string, string) error
	ListAuthIdentities(context.Context, string) ([]AuthIdentity, error)
	DeleteAuthIdentity(context.Context, string, string) error
	DeleteUser(context.Context, string) error
	SaveRefreshToken(context.Context, string, string, time.Time) error
	RefreshToken(context.Context, string) (RefreshToken, error)
	RotateRefreshToken(context.Context, string, string, string, time.Time) error
	RevokeRefreshToken(context.Context, string) error
	SaveConsent(context.Context, Consent) (Consent, error)
	LatestConsent(context.Context, string) (Consent, error)
	RevokeConsent(context.Context, string) error
	SaveAssessment(context.Context, Assessment) (Assessment, error)
	LatestAssessment(context.Context, string) (Assessment, error)
	CreateSession(context.Context, Session) (Session, error)
	UpdateSession(context.Context, Session) (Session, error)
	SessionByID(context.Context, string, string) (Session, error)
	ListSessions(context.Context, string, int) ([]Session, error)
}
