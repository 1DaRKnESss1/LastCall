-- Set once a reminder has been shown, so the scheduler never fires twice for
-- the same task. NULL means "not reminded yet".
ALTER TABLE tasks ADD COLUMN notified_at TEXT;

-- How long before the deadline the reminder fires.
ALTER TABLE settings ADD COLUMN reminder_lead_minutes INTEGER NOT NULL DEFAULT 60;
