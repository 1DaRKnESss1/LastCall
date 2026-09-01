-- Lead time moves from the single settings row onto each subject, so a course
-- with weekly labs and one with a term paper can warn at different distances.
ALTER TABLE subjects ADD COLUMN reminder_lead_minutes INTEGER NOT NULL DEFAULT 60;

-- No longer read by anything: the scheduler now takes the value per subject.
ALTER TABLE settings DROP COLUMN reminder_lead_minutes;
