import "./ErrorBar.css";

export function ErrorBar({ message }: { message: string }) {
  return (
    <div className="error-bar" role="alert">
      {message}
    </div>
  );
}
