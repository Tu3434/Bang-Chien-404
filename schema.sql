CREATE TABLE IF NOT EXISTS admins (id BIGSERIAL PRIMARY KEY,email TEXT NOT NULL UNIQUE,password_hash TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY,admin_id BIGINT NOT NULL REFERENCES admins(id) ON DELETE CASCADE,expires_at TIMESTAMPTZ NOT NULL);
CREATE TABLE IF NOT EXISTS attendance_rounds (id BIGSERIAL PRIMARY KEY,title TEXT NOT NULL,is_active BOOLEAN NOT NULL DEFAULT TRUE,created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE UNIQUE INDEX IF NOT EXISTS one_active_round ON attendance_rounds(is_active) WHERE is_active;
CREATE TABLE IF NOT EXISTS attendance_entries (id BIGSERIAL PRIMARY KEY,round_id BIGINT NOT NULL REFERENCES attendance_rounds(id) ON DELETE CASCADE,character_name TEXT NOT NULL,class_name TEXT NOT NULL,owner_hash TEXT NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT now(),UNIQUE(round_id,character_name));
CREATE TABLE IF NOT EXISTS formation_cells (cell_key TEXT PRIMARY KEY,value TEXT NOT NULL DEFAULT '',phai TEXT,updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY,value TEXT NOT NULL);
INSERT INTO attendance_rounds(title,is_active) SELECT 'Bang chiến đầu tiên',TRUE WHERE NOT EXISTS (SELECT 1 FROM attendance_rounds WHERE is_active);

-- V30: retain match-specific registration history (including removed entries)
ALTER TABLE attendance_rounds ADD COLUMN IF NOT EXISTS match_date DATE;
CREATE UNIQUE INDEX IF NOT EXISTS attendance_round_match_date ON attendance_rounds(match_date) WHERE match_date IS NOT NULL;
CREATE TABLE IF NOT EXISTS attendance_registration_history (
 id BIGSERIAL PRIMARY KEY, attendance_id BIGINT UNIQUE, round_id BIGINT NOT NULL REFERENCES attendance_rounds(id),
 character_name TEXT NOT NULL, class_name TEXT NOT NULL,
 registered_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ
);
INSERT INTO attendance_registration_history(attendance_id,round_id,character_name,class_name,registered_at)
SELECT e.id,e.round_id,e.character_name,e.class_name,e.created_at FROM attendance_entries e
ON CONFLICT(attendance_id) DO NOTHING;
