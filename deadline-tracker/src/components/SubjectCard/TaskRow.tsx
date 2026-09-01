import { useState } from "react";
import type { Task } from "../../db";
import {
  isOverdue,
  timeLeftLabel,
  toIsoUtc,
  toLocalInput,
} from "../../lib/datetime";

type Props = {
  task: Task;
  onToggle: () => void;
  onSave: (title: string, deadlineIso: string) => void;
  onDelete: () => void;
};

/** Internal to SubjectCard — deliberately not re-exported from index.ts. */
export function TaskRow({ task, onToggle, onSave, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [deadline, setDeadline] = useState(() => toLocalInput(task.deadline));

  function open() {
    // Re-seed from the task: a previous cancel may have left stale text.
    setTitle(task.title);
    setDeadline(toLocalInput(task.deadline));
    setEditing(true);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !deadline) return;
    onSave(title.trim(), toIsoUtc(deadline));
    setEditing(false);
  }

  if (editing) {
    return (
      <li className="task editing">
        <form className="task-edit" onSubmit={submit}>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
            onKeyDown={(e) => e.key === "Escape" && setEditing(false)}
          />
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.currentTarget.value)}
            onKeyDown={(e) => e.key === "Escape" && setEditing(false)}
          />
          <div className="task-edit-actions">
            <button type="submit" disabled={!title.trim() || !deadline}>
              Зберегти
            </button>
            <button type="button" onClick={() => setEditing(false)}>
              Скасувати
            </button>
          </div>
        </form>
      </li>
    );
  }

  const done = task.status === "done";
  // Only a pending task can be late; a finished one is just history.
  const late = !done && isOverdue(task.deadline);

  return (
    <li className={`task${done ? " done" : ""}${late ? " late" : ""}`}>
      <label className="task-check">
        <input type="checkbox" checked={done} onChange={onToggle} />
        <span className="box" />
      </label>

      <div className="task-body">
        <span className="task-title">{task.title}</span>
        <span className="task-when">
          {done ? "здано" : timeLeftLabel(task.deadline)}
        </span>
      </div>

      <button
        type="button"
        className="task-action"
        aria-label={`Змінити задачу ${task.title}`}
        onClick={open}
      >
        ✎
      </button>
      <button
        type="button"
        className="task-action danger"
        aria-label={`Видалити задачу ${task.title}`}
        onClick={onDelete}
      >
        ×
      </button>
    </li>
  );
}
