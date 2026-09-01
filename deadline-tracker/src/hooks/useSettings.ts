import { useCallback, useEffect, useState } from "react";
import { disable, enable, isEnabled } from "@tauri-apps/plugin-autostart";
import * as db from "../db";
import type { Settings } from "../db";
import type { Run } from "./useAsyncError";

export type UseSettings = {
  settings: Settings | null;
  autostart: boolean;
  update: (patch: Omit<Partial<Settings>, "id">) => void;
  setAutostart: (next: boolean) => void;
};

export function useSettings(run: Run): UseSettings {
  const [settings, setSettings] = useState<Settings | null>(null);
  // Autostart lives in the OS, not in the database, so it is read back from
  // the plugin rather than from the settings row.
  const [autostart, setAutostartState] = useState(false);

  const reload = useCallback(async () => {
    setSettings(await db.getSettings());
    setAutostartState(await isEnabled());
  }, []);

  useEffect(() => {
    run(reload);
  }, [run, reload]);

  const update = useCallback(
    (patch: Omit<Partial<Settings>, "id">) =>
      run(async () => {
        await db.updateSettings(patch);
        await reload();
      }),
    [run, reload],
  );

  const setAutostart = useCallback(
    (next: boolean) =>
      run(async () => {
        if (next) {
          await enable();
        } else {
          await disable();
        }
        // Read it back instead of trusting the request: the OS is the source
        // of truth and the call can silently do nothing.
        setAutostartState(await isEnabled());
      }),
    [run],
  );

  return { settings, autostart, update, setAutostart };
}
