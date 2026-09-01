import { useCallback, useEffect, useMemo, useState } from "react";
import * as db from "../db";
import type { Task } from "../db";
import type { Run } from "./useAsyncError";

export type UseTasks = {
  /** Tasks keyed by subject id, already ordered for display. */
  bySubject: Map<number, Task[]>;
  create: (subjectId: number, title: string, deadlineIso: string) => void;
  update: (id: number, title: string, deadlineIso: string) => void;
  toggle: (task: Task) => void;
  remove: (id: number) => void;
};

export function useTasks(run: Run): UseTasks {
  const [tasks, setTasks] = useState<Task[]>([]);

  const reload = useCallback(async () => {
    setTasks(await db.listTasks());
  }, []);

  useEffect(() => {
    run(reload);
  }, [run, reload]);

  // Every card reads from one query instead of firing its own.
  const bySubject = useMemo(() => {
    const grouped = new Map<number, Task[]>();
    for (const task of tasks) {
      const list = grouped.get(task.subject_id);
      if (list) {
        list.push(task);
      } else {
        grouped.set(task.subject_id, [task]);
      }
    }
    return grouped;
  }, [tasks]);

  const create = useCallback(
    (subjectId: number, title: string, deadlineIso: string) =>
      run(async () => {
        await db.createTask(subjectId, title, deadlineIso);
        await reload();
      }),
    [run, reload],
  );

  const update = useCallback(
    (id: number, title: string, deadlineIso: string) =>
      run(async () => {
        await db.updateTask(id, title, deadlineIso);
        await reload();
      }),
    [run, reload],
  );

  const toggle = useCallback(
    (task: Task) =>
      run(async () => {
        await db.setTaskStatus(
          task.id,
          task.status === "done" ? "pending" : "done",
        );
        await reload();
      }),
    [run, reload],
  );

  const remove = useCallback(
    (id: number) =>
      run(async () => {
        await db.deleteTask(id);
        await reload();
      }),
    [run, reload],
  );

  return { bySubject, create, update, toggle, remove };
}
