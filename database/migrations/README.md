# Migrations

Migrations use sequential paired `.up.sql` and `.down.sql` files and run through golang-migrate. PostgreSQL's `pgcrypto` extension is enabled only to provide `gen_random_uuid()` for the documented UUID primary-key strategy.

Migration `000003` stores only the provider name and provider-scoped subject needed to authenticate an account. Provider access and refresh tokens are never persisted. Its down migration deliberately refuses to run while social-only users exist, avoiding destructive deletion or invented password credentials.
