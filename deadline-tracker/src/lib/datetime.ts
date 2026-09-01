// The database stores ISO-8601 UTC with seconds precision, matching the
// strftime format used for created_at in the migration. Keeping deadlines in
// the same shape means plain string comparison sorts them correctly in SQL.

/** Convert a <input type="datetime-local"> value (local time) to stored UTC. */
export function toIsoUtc(localValue: string): string {
  return new Date(localValue).toISOString().replace(/\.\d{3}Z$/, "Z");
}

/** Convert a stored UTC timestamp back into a datetime-local input value. */
export function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

export function formatDeadline(iso: string): string {
  return new Date(iso).toLocaleString("uk-UA", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function isOverdue(iso: string): boolean {
  return new Date(iso).getTime() < Date.now();
}

function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

/** Human-readable distance to a deadline, e.g. "через 3 дні", "2 год тому". */
export function timeLeftLabel(iso: string): string {
  const diffMs = new Date(iso).getTime() - Date.now();
  const past = diffMs < 0;
  const minutes = Math.round(Math.abs(diffMs) / 60_000);

  let value: number;
  let unit: string;
  if (minutes < 60) {
    value = Math.max(minutes, 1);
    unit = "хв";
  } else if (minutes < 60 * 24) {
    value = Math.round(minutes / 60);
    unit = "год";
  } else {
    value = Math.round(minutes / (60 * 24));
    unit = plural(value, "день", "дні", "днів");
  }

  return past ? `${value} ${unit} тому` : `через ${value} ${unit}`;
}
