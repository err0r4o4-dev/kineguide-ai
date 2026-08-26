package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/kineguide-ai/kineguide-ai/services/api-go/internal/client/ai"
	"github.com/kineguide-ai/kineguide-ai/services/api-go/internal/config"
	"github.com/kineguide-ai/kineguide-ai/services/api-go/internal/database"
	"github.com/kineguide-ai/kineguide-ai/services/api-go/internal/handler"
	"github.com/kineguide-ai/kineguide-ai/services/api-go/internal/oauthprovider"
	"github.com/kineguide-ai/kineguide-ai/services/api-go/internal/repository"
	"github.com/kineguide-ai/kineguide-ai/services/api-go/internal/security"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	cfg, err := config.Load()
	if err != nil {
		logger.Error("invalid configuration", "error", err)
		os.Exit(1)
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	pool, err := database.Connect(ctx, cfg.DatabaseURL)
	if err != nil {
		logger.Error("configure database pool", "error", err)
		os.Exit(1)
	}
	defer pool.Close()

	aiClient, err := ai.New(cfg.AIServiceURL, cfg.RequestTimeout)
	if err != nil {
		logger.Error("configure AI client", "error", err)
		os.Exit(1)
	}
	tokenSigner, err := security.NewTokenSigner(cfg.JWTSecret)
	if err != nil {
		logger.Error("configure token signer", "error", err)
		os.Exit(1)
	}
	store := repository.NewPostgres(pool)
	providerHTTPClient := &http.Client{Timeout: cfg.RequestTimeout}
	oauthProviders := make(map[string]oauthprovider.Provider)
	if cfg.GoogleOAuth.Enabled() {
		oauthProviders[oauthprovider.Google] = oauthprovider.NewGoogle(
			cfg.GoogleOAuth.ClientID, cfg.GoogleOAuth.ClientSecret, cfg.GoogleOAuth.RedirectURL, providerHTTPClient,
		)
	}
	if cfg.FacebookOAuth.Enabled() {
		oauthProviders[oauthprovider.Facebook] = oauthprovider.NewFacebook(
			cfg.FacebookOAuth.ClientID, cfg.FacebookOAuth.ClientSecret, cfg.FacebookOAuth.RedirectURL, providerHTTPClient,
		)
	}

	server := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           handler.NewRouter(cfg, handler.Dependencies{Database: pool, AI: aiClient, ChatAI: aiClient, Store: store, Signer: tokenSigner, OAuthProviders: oauthProviders}, logger),
		ReadHeaderTimeout: cfg.RequestTimeout,
		ReadTimeout:       cfg.RequestTimeout,
		WriteTimeout:      cfg.RequestTimeout,
		IdleTimeout:       cfg.RequestTimeout * 6,
	}

	go func() {
		logger.Info("api server starting", "port", cfg.Port, "version", cfg.Version)
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			logger.Error("api server failed", "error", err)
			stop()
		}
	}()

	<-ctx.Done()
	shutdownContext, cancel := context.WithTimeout(context.Background(), cfg.ShutdownTimeout)
	defer cancel()
	if err := server.Shutdown(shutdownContext); err != nil {
		logger.Error("graceful shutdown failed", "error", err)
	}
	logger.Info("api server stopped")
}
