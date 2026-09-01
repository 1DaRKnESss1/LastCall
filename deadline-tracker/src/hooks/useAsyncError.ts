import { useCallback, useState } from "react";

export type Run = (action: () => Promise<void>) => void;

/**
 * Wraps every database call so a failed query surfaces in the UI instead of
 * vanishing into an unhandled promise rejection.
 */
export function useAsyncError(): { error: string | null; run: Run } {
  const [error, setError] = useState<string | null>(null);

  const run = useCallback<Run>((action) => {
    void (async () => {
      try {
        await action();
        setError(null);
      } catch (e) {
        setError(String(e));
      }
    })();
  }, []);

  return { error, run };
}
