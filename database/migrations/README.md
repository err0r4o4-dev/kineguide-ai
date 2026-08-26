# Migrations

Migrations use sequential paired `.up.sql` and `.down.sql` files and run through golang-migrate. PostgreSQL's `pgcrypto` extension is enabled only to provide `gen_random_uuid()` for the documented UUID primary-key strategy.

Migration `000003` stores only the provider name and provider-scoped subject needed to authenticate an account. Provider access and refresh tokens are never persisted. Its down migration deliberately refuses to run while social-only users exist, avoiding destructive deletion or invented password credentials.

Migration `000004` adds explicit AI-chat storage consent plus account-owned conversations and messages. Conversation rows cascade from account deletion, expire after 30 days, and are removed by the Go API retention worker. Python and the browser never receive database access.

Migration `000005` changes AI-chat retention to `until_deleted`, removes automatic chat expiry fields, and keeps physical deletion through the existing account and conversation cascades. Its down migration restores a 30-day deadline without deleting rows during rollback. Python and the browser still never receive database access.
