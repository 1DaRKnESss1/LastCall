/**
 * Lead times are stored as plain minutes, which is what the scheduler needs,
 * but nobody thinks in "10080 minutes". These helpers translate between the
 * stored number and a value-plus-unit pair for the UI.
 */

export type UnitKey = "minutes" | "hours" | "days" | "weeks";

type Unit = {
  key: UnitKey;
  label: string;
  minutes: number;
  /** Upper bound for the number field, so a typo cannot mean half a year. */
  max: number;
};

export const UNITS: Unit[] = [
  { key: "minutes", label: "хв", minutes: 1, max: 240 },
  { key: "hours", label: "год", minutes: 60, max: 48 },
  { key: "days", label: "дні", minutes: 60 * 24, max: 60 },
  { key: "weeks", label: "тижні", minutes: 60 * 24 * 7, max: 8 },
];

export function unit(key: UnitKey): Unit {
  return UNITS.find((u) => u.key === key) ?? UNITS[0];
}

/**
 * Show a stored value in the largest unit it divides into evenly, so 10080
 * reads as "1 тиждень" rather than "7 днів" or "168 год".
 */
export function splitLead(totalMinutes: number): {
  value: number;
  unit: UnitKey;
} {
  for (const u of [...UNITS].reverse()) {
    if (totalMinutes >= u.minutes && totalMinutes % u.minutes === 0) {
      return { value: totalMinutes / u.minutes, unit: u.key };
    }
  }
  return { value: Math.max(1, totalMinutes), unit: "minutes" };
}

export function toMinutes(value: number, key: UnitKey): number {
  return Math.round(value) * unit(key).minutes;
}
