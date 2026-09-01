import "./TaskList.css";
import { useState } from "react";
import type { Subject, Task } from "../../db";
import {
  formatDeadline,
  isOverdue,
  timeLeftLabel,
  toIsoUtc,
} from "../../lib/datetime";

type Props = {
  subject: Subject | null;
  tasks: Task[];
  onCreate: (title: string, deadlineIso: string) => void;
  onToggle: (task: Task) => void;
  onDelete: (id: number) => void;
};

export function TaskList({
  subject,
  tasks,
  onCreate,
  onToggle,
  onDelete,
}: Props) {
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");

  if (!subject) {
    return (
      <section className="tasks">
        <p className="empty">Оберіть предмет зліва або створіть новий</p>
      </section>
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !deadline) return;
    onCreate(title.trim(), toIsoUtc(deadline));
    setTitle("");
    setDeadline("");
  }

  return (
    <section className="tasks">
      <h2 className="tasks-title">{subject.name}</h2>

      <form className="add-task" onSubmit={submit}>
        <input
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          placeholder="Що треба зробити"
        />
        <input
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.currentTarget.value)}
        />
        <button type="submit" disabled={!title.trim() || !deadline}>
          Додати задачу
        </button>
      </form>

      {tasks.length === 0 ? (
        <p className="empty">Задач поки немає</p>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => {
            const done = task.status === "done";
            // Only a pending task can be late; a finished one is just history.
            const late = !done && isOverdue(task.deadline);
            return (
              <li
                key={task.id}
                className={`task${done ? " done" : ""}${late ? " late" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={done}
                  onChange={() => onToggle(task)}
                  aria-label={`Позначити «${task.title}» виконаною`}
                />
                <div className="task-body">
                  <span className="task-title">{task.title}</span>
                  <span className="task-deadline">
                    {formatDeadline(task.deadline)}
                    {!done && ` · ${timeLeftLabel(task.deadline)}`}
                  </span>
                </div>
                <button
                  type="button"
                  className="icon-button"
                  aria-label={`Видалити задачу ${task.title}`}
                  onClick={() => onDelete(task.id)}
                >
                  ×
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
