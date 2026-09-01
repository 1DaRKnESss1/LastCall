import { useState } from "react";
import { useAsyncError } from "./hooks/useAsyncError";
import { useSubjects } from "./hooks/useSubjects";
import { useTasks } from "./hooks/useTasks";
import { useSettings } from "./hooks/useSettings";
import { Board } from "./components/Board";
import { SettingsDialog } from "./components/SettingsDialog";
import { ErrorBar } from "./components/ErrorBar";
import "./App.css";

function App() {
  const { error, run } = useAsyncError();
  const subjects = useSubjects(run);
  const tasks = useTasks(run);
  const settings = useSettings(run);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <main className="app">
      <Board
        subjects={subjects.subjects}
        tasksBySubject={tasks.bySubject}
        onCreateSubject={subjects.create}
        onMoveSubject={(id, point) =>
          subjects.update(id, { pos_x: point.x, pos_y: point.y })
        }
        onLeadChange={(id, minutes) =>
          subjects.update(id, { reminder_lead_minutes: minutes })
        }
        onDeleteSubject={subjects.remove}
        onCreateTask={tasks.create}
        onUpdateTask={tasks.update}
        onToggleTask={tasks.toggle}
        onDeleteTask={tasks.remove}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {settingsOpen && (
        <SettingsDialog {...settings} onClose={() => setSettingsOpen(false)} />
      )}

      {error && <ErrorBar message={error} />}
    </main>
  );
}

export default App;
