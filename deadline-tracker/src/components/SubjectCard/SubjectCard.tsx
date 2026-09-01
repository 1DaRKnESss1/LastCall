import "./SubjectCard.css";
import { useState } from "react";
import type { Subject, Task } from "../../db";
import { toIsoUtc } from "../../lib/datetime";
import { TaskRow } from "./TaskRow";
import { cardPosition, tapeColor, tilt, type Point } from "../../lib/board";
import { useDragPosition } from "../../hooks/useDragPosition";

type Props = {
  subject: Subject;
  index: number;
  tasks: Task[];
  onMove: (point: Point) => void;
  onLeadChange: (minutes: number) => void;
  onDeleteSubject: () => void;
  onCreateTask: (title: string, deadlineIso: string) => void;
  onUpdateTask: (id: number, title: string, deadlineIso: string) => void;
  onToggleTask: (task: Task) => void;
  onDeleteTask: (id: number) => void;
};

export function SubjectCard({
  subject,
  index,
  tasks,
  onMove,
  onLeadChange,
  onDeleteSubject,
  onCreateTask,
  onUpdateTask,
  onToggleTask,
  onDeleteTask,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");

  const { point, dragging, onPointerDown } = useDragPosition(
    cardPosition(subject, index),
    onMove,
  );

  function submitTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !deadline) return;
    onCreateTask(title.trim(), toIsoUtc(deadline));
    setTitle("");
    setDeadline("");
    setAdding(false);
  }

  return (
    <article
      className={`card${dragging ? " dragging" : ""}`}
      style={{
        left: point.x,
        top: point.y,
        // The tilt is dropped while dragging so the card feels picked up.
        transform: dragging ? "rotate(0deg)" : `rotate(${tilt(subject)}deg)`,
      }}
      onPointerDown={onPointerDown}
    >
      <span className="tape" style={{ background: tapeColor(subject) }} />
      <span className="pin" />

      <header className="card-head">
        <h2 className="card-title">{subject.name}</h2>
        <button
          type="button"
          className="card-menu-button"
          aria-label={`Дії для предмета ${subject.name}`}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          ⋯
        </button>
      </header>

      {menuOpen && (
        <div className="card-menu">
          <label className="card-menu-row">
            Нагадувати за
            <input
              type="number"
              min={1}
              max={10080}
              value={subject.reminder_lead_minutes}
              onChange={(e) => {
                const value = Number(e.currentTarget.value);
                // An empty field would otherwise write NaN into a NOT NULL
                // column and break the scheduler's query.
                if (Number.isFinite(value) && value >= 1) {
                  onLeadChange(Math.round(value));
                }
              }}
            />
            хв
          </label>
          <button
            type="button"
            className="card-menu-danger"
            onClick={() => {
              setMenuOpen(false);
              onDeleteSubject();
            }}
          >
            Зняти з дошки
          </button>
        </div>
      )}

      {tasks.length === 0 && !adding && (
        <p className="card-empty">Ще нічого не пришпилено.</p>
      )}

      <ul className="task-list">
        {tasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            onToggle={() => onToggleTask(task)}
            onSave={(title, deadline) => onUpdateTask(task.id, title, deadline)}
            onDelete={() => onDeleteTask(task.id)}
          />
        ))}
      </ul>

      {adding ? (
        <form className="task-add" onSubmit={submitTask}>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
            placeholder="Що треба зробити"
          />
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.currentTarget.value)}
          />
          <div className="task-add-actions">
            <button type="submit" disabled={!title.trim() || !deadline}>
              Пришпилити
            </button>
            <button type="button" onClick={() => setAdding(false)}>
              Скасувати
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          className="task-add-open"
          onClick={() => setAdding(true)}
        >
          + додати задачу
        </button>
      )}
    </article>
  );
}
