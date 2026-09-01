import type { Subject } from "../db";

export const CARD_WIDTH = 264;

/** Layout used until a card has been dragged somewhere of its own. */
const AUTO_COLUMNS = 3;
const AUTO_PITCH_X = 300;
const AUTO_PITCH_Y = 250;
const AUTO_ORIGIN_X = 48;
const AUTO_ORIGIN_Y = 24;

/** Washi tape colours, picked per subject so a board looks varied. */
const TAPE_COLORS = [
  "#d98c8c",
  "#8fae86",
  "#8aa2c4",
  "#d9b877",
  "#b393b8",
  "#7fb3ac",
];

/**
 * Small deterministic hash. The tilt and tape colour must look random but stay
 * the same across renders and restarts, so they are derived from the id rather
 * than drawn from Math.random().
 */
function hash(id: number): number {
  let h = (id * 2654435761) % 4294967296;
  h ^= h >>> 13;
  return Math.abs(h);
}

export function tapeColor(subject: Subject): string {
  return TAPE_COLORS[hash(subject.id) % TAPE_COLORS.length];
}

/** Degrees of tilt, in the range -3..3. */
export function tilt(subject: Subject): number {
  return (hash(subject.id) % 7) - 3;
}

export type Point = { x: number; y: number };

export function cardPosition(subject: Subject, index: number): Point {
  if (subject.pos_x !== null && subject.pos_y !== null) {
    return { x: subject.pos_x, y: subject.pos_y };
  }
  return {
    x: AUTO_ORIGIN_X + (index % AUTO_COLUMNS) * AUTO_PITCH_X,
    y: AUTO_ORIGIN_Y + Math.floor(index / AUTO_COLUMNS) * AUTO_PITCH_Y,
  };
}

/** Board extent, so dragging a card downwards grows the scrollable area. */
export function boardSize(points: Point[]): { width: number; height: number } {
  const maxX = points.reduce((m, p) => Math.max(m, p.x), 0);
  const maxY = points.reduce((m, p) => Math.max(m, p.y), 0);
  return { width: maxX + CARD_WIDTH + 200, height: maxY + 320 };
}
