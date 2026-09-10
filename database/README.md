# BatchTrack Supabase database

BatchTrack uses Supabase as its shared database. The adapter in `local-db.js` preserves the existing asynchronous API while mapping each record to a table's JSONB `record` column. The migration is in `../supabase/migrations/`.

The tables are:

- `retailers`
- `consumers`
- `machines`
- `inventory`
- `transactions`
- `documents`
- `credit_notes`
- `support_tickets`
- `sessions`
- `survey_responses`

The browser client uses the Supabase URL and public anon key. Never place a service-role key in the HTML or `.env` used by the browser.

`local-db.js` exposes table-level `read`, `put`, `remove`, and `find` methods. The current migration has prototype-wide anonymous policies so the existing local sign-in flow can continue working. Replace them with `auth.uid()` and retailer/consumer ownership policies before production deployment.

## Important deployment rule

Keep serving the app from an HTTP origin during local development. This is required for external scripts and camera access, but changing the origin no longer creates a separate database.

The GitHub Actions workflow applies migrations on pushes to `main` when `SUPABASE_ACCESS_TOKEN` and `SUPABASE_PROJECT_REF` repository secrets are configured.
