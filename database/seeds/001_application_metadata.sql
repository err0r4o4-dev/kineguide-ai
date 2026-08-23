INSERT INTO application_metadata (key, value)
VALUES ('seed_version', '0.1.0')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
