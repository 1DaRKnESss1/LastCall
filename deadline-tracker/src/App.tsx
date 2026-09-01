import { useAsyncError } from "./hooks/useAsyncError";
import { useSubjects } from "./hooks/useSubjects";
import { useTasks } from "./hooks/useTasks";
import { useSettings } from "./hooks/useSettings";
import { SubjectList } from "./components/SubjectList";
import { TaskList } from "./components/TaskList";
import { Settings } from "./components/Settings";
import { ErrorBar } from "./components/ErrorBar";
import "./App.css";

function App() {
  const { error, run } = useAsyncError();
  const subjects = useSubjects(run);
  const tasks = useTasks(run, subjects.selectedId);
  const settings = useSettings(run);

  return (
    <main className="app">
      <aside className="sidebar">
        <SubjectList
          subjects={subjects.subjects}
          selectedId={subjects.selectedId}
          onSelect={subjects.select}
          onCreate={subjects.create}
          onDelete={subjects.remove}
        />
        <Settings {...settings} />
      </aside>

      <TaskList
        subject={subjects.selected}
        tasks={tasks.tasks}
        onCreate={tasks.create}
        onToggle={tasks.toggle}
        onDelete={tasks.remove}
      />

      {error && <ErrorBar message={error} />}
    </main>
  );
}

export default App;
