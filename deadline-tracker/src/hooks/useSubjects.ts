import { useCallback, useEffect, useState } from "react";
import * as db from "../db";
import type { Subject } from "../db";
import type { Run } from "./useAsyncError";

export type UseSubjects = {
  subjects: Subject[];
  create: (name: string) => void;
  update: (id: number, patch: Omit<Partial<Subject>, "id" | "created_at">) => void;
  remove: (subject: Subject) => void;
};

export function useSubjects(run: Run): UseSubjects {
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const reload = useCallback(async () => {
    setSubjects(await db.listSubjects());
  }, []);

  useEffect(() => {
    run(reload);
  }, [run, reload]);

  const create = useCallback(
    (name: string) =>
      run(async () => {
        await db.createSubject(name);
        await reload();
      }),
    [run, reload],
  );

  const update = useCallback(
    (id: number, patch: Omit<Partial<Subject>, "id" | "created_at">) =>
      run(async () => {
        await db.updateSubject(id, patch);
        await reload();
      }),
    [run, reload],
  );

  const remove = useCallback(
    (subject: Subject) =>
      run(async () => {
        // Deleting a subject cascades to its tasks, so it is worth a prompt.
        const confirmed = window.confirm(
          `Видалити «${subject.name}» разом з усіма його задачами?`,
        );
        if (!confirmed) return;
        await db.deleteSubject(subject.id);
        await reload();
      }),
    [run, reload],
  );

  return { subjects, create, update, remove };
}
