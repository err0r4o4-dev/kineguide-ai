.DEFAULT_GOAL := help

.PHONY: help setup dev up down build test lint fmt typecheck migrate-up migrate-down seed clean

help: ## Show available commands
	@awk 'BEGIN {FS = ":.*## "; printf "KineGuide AI commands:\n"} /^[a-zA-Z_-]+:.*?## / {printf "  %-16s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

setup: ## Install JavaScript and Python dependencies and download Go modules
	corepack pnpm install
	cd services/api-go && go mod download
	cd services/ai-python && python -m pip install -e ".[dev]"

dev: ## Start the full development stack
	docker compose up --build

up: ## Start containers in the background
	docker compose up --build -d

down: ## Stop and remove project containers
	docker compose down

build: ## Build all applications
	corepack pnpm build
	cd services/api-go && go build ./cmd/server
	cd services/ai-python && python -m compileall app

test: ## Run all unit tests
	corepack pnpm test
	cd services/api-go && go test ./...
	cd services/ai-python && python -m pytest

lint: ## Run linters
	corepack pnpm lint
	cd services/api-go && go vet ./...
	cd services/ai-python && python -m ruff check .

fmt: ## Format source files
	corepack pnpm format
	cd services/api-go && go fmt ./...
	cd services/ai-python && python -m ruff format .

typecheck: ## Run static type checks
	corepack pnpm typecheck
	cd services/ai-python && python -m mypy app

migrate-up: ## Apply all database migrations
	docker compose run --rm --entrypoint /bin/sh migrate -c 'migrate -path=/migrations -database="$$DATABASE_URL" up'

migrate-down: ## Roll back one database migration
	docker compose run --rm --entrypoint /bin/sh migrate -c 'migrate -path=/migrations -database="$$DATABASE_URL" down 1'

seed: ## Run safe development seeds
	docker compose exec -T postgres sh -c 'psql -U "$$POSTGRES_USER" -d "$$POSTGRES_DB" -f /seeds/001_application_metadata.sql'

clean: ## Remove only known generated project artifacts
	corepack pnpm --filter @kineguide/web clean
	cd services/api-go && go clean
	cd services/ai-python && python scripts/clean.py
