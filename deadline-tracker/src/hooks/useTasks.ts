import { useCallback, useEffect, useState } from "react";
import * as db from "../db";
import type { Task } from "../db";
import type { Run } from "./useAsyncError";

export type UseTasks = {
  tasks: Task[];
  create: (title: string, deadlineIso: string) => void;
  toggle: (task: Task) => void;
  remove: (id: number) => void;
};

export function useTasks(run: Run, subjectId: number | null): UseTasks {
  const [tasks, setTasks] = useState<Task[]>([]);

  const reload = useCallback(async () => {
    setTasks(subjectId === null ? [] : await db.listTasks(subjectId));
  }, [subjectId]);

  useEffect(() => {
    run(reload);
  }, [run, reload]);

  const create = useCallback(
    (title: string, deadlineIso: string) =>
      run(async () => {
        if (subjectId === null) return;
        await db.createTask(subjectId, title, deadlineIso);
        await reload();
      }),
    [run, reload, subjectId],
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

  return { tasks, create, toggle, remove };
}
