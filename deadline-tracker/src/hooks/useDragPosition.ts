import { useCallback, useEffect, useRef, useState } from "react";
import type { Point } from "../lib/board";

/** Interactive elements inside a card must not start a drag. */
const NO_DRAG = "button, input, label, select, textarea, a";

/** Movement below this is a click, not a drag, and is not persisted. */
const THRESHOLD_PX = 3;

type Gesture = {
  startX: number;
  startY: number;
  from: Point;
  current: Point;
  moved: boolean;
};

/**
 * Pointer dragging with the position held locally while the gesture is in
 * flight, so the card follows the cursor without a database round trip per
 * frame. The final position is committed once, on release.
 */
export function useDragPosition(
  position: Point,
  onCommit: (point: Point) => void,
) {
  const [local, setLocal] = useState<Point | null>(null);
  const gesture = useRef<Gesture | null>(null);

  // Held in a ref so the window listeners never need re-subscribing when the
  // parent passes a fresh callback on every render.
  const commit = useRef(onCommit);
  commit.current = onCommit;

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      if ((e.target as HTMLElement).closest(NO_DRAG)) return;
      gesture.current = {
        startX: e.clientX,
        startY: e.clientY,
        from: position,
        current: position,
        moved: false,
      };
      setLocal(position);
    },
    [position],
  );

  const dragging = local !== null;

  useEffect(() => {
    if (!dragging) return;

    const move = (e: PointerEvent) => {
      const g = gesture.current;
      if (!g) return;
      const dx = e.clientX - g.startX;
      const dy = e.clientY - g.startY;
      if (Math.abs(dx) > THRESHOLD_PX || Math.abs(dy) > THRESHOLD_PX) {
        g.moved = true;
      }
      // Clamped so a card can never be dragged out of reach above or left.
      g.current = { x: Math.max(0, g.from.x + dx), y: Math.max(0, g.from.y + dy) };
      setLocal(g.current);
    };

    const up = () => {
      const g = gesture.current;
      gesture.current = null;
      setLocal(null);
      // A plain click leaves the card where it was; no write for that.
      if (g?.moved) commit.current(g.current);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [dragging]);

  return { point: local ?? position, dragging, onPointerDown };
}
