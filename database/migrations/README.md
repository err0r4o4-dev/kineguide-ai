# Migrations

Migrations use sequential paired `.up.sql` and `.down.sql` files and run through golang-migrate. PostgreSQL's `pgcrypto` extension is enabled only to provide `gen_random_uuid()` for the documented UUID primary-key strategy.
