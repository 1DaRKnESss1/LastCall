import "./Board.css";
import { useState } from "react";
import type { Subject, Task } from "../../db";
import { boardSize, cardPosition, type Point } from "../../lib/board";
import { SubjectCard } from "../SubjectCard";

type Props = {
  subjects: Subject[];
  tasksBySubject: Map<number, Task[]>;
  onCreateSubject: (name: string) => void;
  onMoveSubject: (id: number, point: Point) => void;
  onLeadChange: (id: number, minutes: number) => void;
  onDeleteSubject: (subject: Subject) => void;
  onCreateTask: (subjectId: number, title: string, deadlineIso: string) => void;
  onToggleTask: (task: Task) => void;
  onDeleteTask: (id: number) => void;
  onOpenSettings: () => void;
};

export function Board({
  subjects,
  tasksBySubject,
  onCreateSubject,
  onMoveSubject,
  onLeadChange,
  onDeleteSubject,
  onCreateTask,
  onToggleTask,
  onDeleteTask,
  onOpenSettings,
}: Props) {
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);

  // The surface grows with the lowest and right-most card so a dragged card
  // never ends up outside the scrollable area.
  const size = boardSize(subjects.map((s, i) => cardPosition(s, i)));

  function submitSubject(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreateSubject(trimmed);
    setName("");
    setAdding(false);
  }

  return (
    <div className="board-scroll">
      <header className="board-bar">
        <h1 className="board-title">LastCall</h1>
        <div className="board-actions">
          {adding ? (
            <form className="subject-add" onSubmit={submitSubject}>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
                placeholder="Назва предмета"
                onKeyDown={(e) => e.key === "Escape" && setAdding(false)}
              />
              <button type="submit" disabled={!name.trim()}>
                Додати
              </button>
            </form>
          ) : (
            <button
              type="button"
              className="board-button"
              onClick={() => setAdding(true)}
            >
              + предмет
            </button>
          )}
          <button
            type="button"
            className="board-button icon"
            aria-label="Налаштування"
            onClick={onOpenSettings}
          >
            ⚙
          </button>
        </div>
      </header>

      <div
        className="board"
        style={{ minWidth: size.width, minHeight: size.height }}
      >
        {subjects.length === 0 && (
          <p className="board-empty">
            Дошка порожня. Додай предмет, щоб почати.
          </p>
        )}

        {subjects.map((subject, index) => (
          <SubjectCard
            key={subject.id}
            subject={subject}
            index={index}
            tasks={tasksBySubject.get(subject.id) ?? []}
            onMove={(point) => onMoveSubject(subject.id, point)}
            onLeadChange={(minutes) => onLeadChange(subject.id, minutes)}
            onDeleteSubject={() => onDeleteSubject(subject)}
            onCreateTask={(title, deadline) =>
              onCreateTask(subject.id, title, deadline)
            }
            onToggleTask={onToggleTask}
            onDeleteTask={onDeleteTask}
          />
        ))}
      </div>
    </div>
  );
}
