#!/usr/bin/env bash
# Applies the migrations to a throwaway local PostgreSQL (with a stand-in for
# Supabase Auth) and runs the Row Level Security checks.
# Usage: PGHOST=localhost PGPORT=5432 PGUSER=postgres supabase/tests/run-rls-tests.sh
set -euo pipefail
cd "$(dirname "$0")/../.."
DB="rh_rls_test_$$"
createdb "$DB"
trap 'dropdb "$DB"' EXIT
psql -q -v ON_ERROR_STOP=1 -d "$DB" -f supabase/tests/auth_shim.sql
for f in supabase/migrations/*.sql; do psql -q -v ON_ERROR_STOP=1 -d "$DB" -f "$f"; done
psql -d "$DB" -f supabase/tests/rls_test.sql
