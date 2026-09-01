import Database from "@tauri-apps/plugin-sql";

/** Must match DB_URL in src-tauri/src/lib.rs. */
const DB_URL = "sqlite:lastcall.db";

export type TaskStatus = "pending" | "done";

export type Subject = {
  id: number;
  name: string;
  /** ISO-8601 UTC, e.g. "2026-09-01T13:50:00Z". */
  created_at: string;
  /** How long before a deadline this subject's tasks warn. */
  reminder_lead_minutes: number;
  /** Board coordinates; null until the card has been dragged. */
  pos_x: number | null;
  pos_y: number | null;
};

export type Task = {
  id: number;
  subject_id: number;
  title: string;
  /** ISO-8601 UTC. Every task has one — the schema requires it. */
  deadline: string;
  status: TaskStatus;
  created_at: string;
};

export type Settings = {
  id: number;
  /** SQLite has no boolean: 0 or 1. */
  os_notifications_enabled: number;
};

let dbPromise: Promise<Database> | null = null;

// The connection is opened once and reused; Database.load runs the migrations
// registered on the Rust side the first time it is called.
function getDb(): Promise<Database> {
  if (!dbPromise) {
    dbPromise = Database.load(DB_URL);
  }
  return dbPromise;
}

export async function listSubjects(): Promise<Subject[]> {
  const db = await getDb();
  return db.select<Subject[]>("SELECT * FROM subjects ORDER BY name");
}

export async function createSubject(name: string): Promise<void> {
  const db = await getDb();
  await db.execute("INSERT INTO subjects (name) VALUES ($1)", [name]);
}

export async function updateSubject(
  id: number,
  patch: Omit<Partial<Subject>, "id" | "created_at">,
): Promise<void> {
  const db = await getDb();
  const entries = Object.entries(patch);
  if (entries.length === 0) return;

  // Column names come from the Subject type, never from user input; only the
  // values are parameterised.
  const assignments = entries
    .map(([column], i) => `${column} = $${i + 1}`)
    .join(", ");
  await db.execute(
    `UPDATE subjects SET ${assignments} WHERE id = $${entries.length + 1}`,
    [...entries.map(([, value]) => value), id],
  );
}

/** Cascades: the subject's tasks are deleted with it. */
export async function deleteSubject(id: number): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM subjects WHERE id = $1", [id]);
}

// Pending tasks first, then by deadline — the soonest deadline is what the
// user needs to see at the top of a card.
const TASK_ORDER = "ORDER BY subject_id, status, deadline";

/** Every task on the board; the UI groups them by subject itself. */
export async function listTasks(): Promise<Task[]> {
  const db = await getDb();
  return db.select<Task[]>(`SELECT * FROM tasks ${TASK_ORDER}`);
}

export async function createTask(
  subjectId: number,
  title: string,
  deadline: string,
): Promise<void> {
  const db = await getDb();
  await db.execute(
    "INSERT INTO tasks (subject_id, title, deadline) VALUES ($1, $2, $3)",
    [subjectId, title, deadline],
  );
}

export async function setTaskStatus(
  id: number,
  status: TaskStatus,
): Promise<void> {
  const db = await getDb();
  await db.execute("UPDATE tasks SET status = $1 WHERE id = $2", [status, id]);
}

export async function deleteTask(id: number): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM tasks WHERE id = $1", [id]);
}

export async function getSettings(): Promise<Settings> {
  const db = await getDb();
  const rows = await db.select<Settings[]>(
    "SELECT * FROM settings WHERE id = 1",
  );
  return rows[0];
}

export async function updateSettings(
  patch: Omit<Partial<Settings>, "id">,
): Promise<void> {
  const db = await getDb();
  const entries = Object.entries(patch);
  if (entries.length === 0) return;

  // Column names come from the Settings type, never from user input; only the
  // values are parameterised.
  const assignments = entries
    .map(([column], i) => `${column} = $${i + 1}`)
    .join(", ");
  const values = entries.map(([, value]) => value);
  await db.execute(`UPDATE settings SET ${assignments} WHERE id = 1`, values);
}
