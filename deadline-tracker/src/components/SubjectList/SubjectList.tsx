import "./SubjectList.css";
import { useState } from "react";
import type { Subject } from "../../db";

type Props = {
  subjects: Subject[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onCreate: (name: string) => void;
  onDelete: (subject: Subject) => void;
};

export function SubjectList({
  subjects,
  selectedId,
  onSelect,
  onCreate,
  onDelete,
}: Props) {
  const [name, setName] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate(trimmed);
    setName("");
  }

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Предмети</h2>

      {subjects.length === 0 ? (
        <p className="empty">Ще немає жодного предмета</p>
      ) : (
        <ul className="subject-list">
          {subjects.map((subject) => (
            // The select and delete buttons are siblings, never nested — a
            // button inside a button is invalid markup.
            <li
              key={subject.id}
              className={
                subject.id === selectedId ? "subject-row active" : "subject-row"
              }
            >
              <button
                type="button"
                className="subject"
                onClick={() => onSelect(subject.id)}
              >
                {subject.name}
              </button>
              <button
                type="button"
                className="icon-button"
                aria-label={`Видалити предмет ${subject.name}`}
                onClick={() => onDelete(subject)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <form className="add-subject" onSubmit={submit}>
        <input
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Новий предмет"
        />
        <button type="submit" disabled={!name.trim()}>
          Додати
        </button>
      </form>
    </aside>
  );
}
