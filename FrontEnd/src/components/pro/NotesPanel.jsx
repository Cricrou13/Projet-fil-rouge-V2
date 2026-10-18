export default function NotesPanel({ notes }) {
  return (
    <div className="notes-panel">
      <h3>Notes</h3>
      <ul>
        {notes.map((note, i) => (
          <li key={i}>{note}</li>
        ))}
      </ul>
    </div>
  );
}