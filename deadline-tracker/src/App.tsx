import { useAsyncError } from "./hooks/useAsyncError";
import { useSubjects } from "./hooks/useSubjects";
import { useTasks } from "./hooks/useTasks";
import { SubjectList } from "./components/SubjectList";
import { TaskList } from "./components/TaskList";
import { ErrorBar } from "./components/ErrorBar";
import "./App.css";

function App() {
  const { error, run } = useAsyncError();
  const subjects = useSubjects(run);
  const tasks = useTasks(run, subjects.selectedId);

  return (
    <main className="app">
      <SubjectList
        subjects={subjects.subjects}
        selectedId={subjects.selectedId}
        onSelect={subjects.select}
        onCreate={subjects.create}
        onDelete={subjects.remove}
      />

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
