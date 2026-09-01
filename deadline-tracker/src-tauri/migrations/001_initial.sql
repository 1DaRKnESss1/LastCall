-- subjects: top-level entity, it is not owned by anything else.
CREATE TABLE subjects (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE TABLE tasks (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_id INTEGER NOT NULL,
    title      TEXT NOT NULL,
    deadline   TEXT NOT NULL,
    status     TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'done')),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

CREATE INDEX idx_tasks_subject_id ON tasks(subject_id);
CREATE INDEX idx_tasks_deadline   ON tasks(deadline);

-- Single-row table: the CHECK on id makes a second settings row impossible,
-- so reads can always target id = 1 without worrying about which row is current.
CREATE TABLE settings (
    id                       INTEGER PRIMARY KEY CHECK (id = 1),
    os_notifications_enabled INTEGER NOT NULL DEFAULT 1
                             CHECK (os_notifications_enabled IN (0, 1))
);

INSERT INTO settings (id) VALUES (1);
