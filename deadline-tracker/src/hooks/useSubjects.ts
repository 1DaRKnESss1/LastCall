import { useCallback, useEffect, useState } from "react";
import * as db from "../db";
import type { Subject } from "../db";
import type { Run } from "./useAsyncError";

export type UseSubjects = {
  subjects: Subject[];
  selected: Subject | null;
  selectedId: number | null;
  select: (id: number) => void;
  create: (name: string) => void;
  remove: (subject: Subject) => void;
};

export function useSubjects(run: Run): UseSubjects {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const reload = useCallback(async () => {
    const rows = await db.listSubjects();
    setSubjects(rows);
    // The current selection may have just been deleted; fall back to the
    // first subject so the task panel never points at a missing row.
    setSelectedId((current) =>
      current !== null && rows.some((s) => s.id === current)
        ? current
        : (rows[0]?.id ?? null),
    );
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

  return {
    subjects,
    selected: subjects.find((s) => s.id === selectedId) ?? null,
    selectedId,
    select: setSelectedId,
    create,
    remove,
  };
}
