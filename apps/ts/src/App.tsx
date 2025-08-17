import { useEffect, useMemo, useState } from 'react';

type Note = {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
};

const KEY = 'notes.v1';

function loadNotes(): Note[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') as Note[]; } catch { return []; }
}
function saveNotes(notes: Note[]) { localStorage.setItem(KEY, JSON.stringify(notes)); }

export default function App() {
  const [notes, setNotes] = useState<Note[]>(loadNotes());
  const [text, setText] = useState<string>('');
  const [filter, setFilter] = useState<'all'|'open'|'done'>('all');

  useEffect(() => { saveNotes(notes); }, [notes]);

  function add(): void {
    const val = text.trim();
    if (!val) return;
    setNotes([{ id: crypto.randomUUID(), text: val, done: false, createdAt: new Date().toISOString() }, ...notes]);
    setText('');
  }

  function toggle(id: string): void {
    setNotes(notes.map(n => n.id === id ? { ...n, done: !n.done } : n));
  }

  function remove(id: string): void {
    setNotes(notes.filter(n => n.id !== id));
  }

  const filtered = useMemo(() => {
    if (filter === 'open') return notes.filter(n => !n.done);
    if (filter === 'done') return notes.filter(n => n.done);
    return notes;
  }, [notes, filter]);

  return (
    <main style={{ maxWidth: 720, margin: '2rem auto', fontFamily: 'system-ui,sans-serif' }}>
      <h1>Notes App (TypeScript)</h1>

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          placeholder="New note"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          style={{ flex: 1, padding: 8 }}
          aria-label="New note text"
        />
        <button onClick={add}>Add</button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <Filter value="all"  current={filter} set={setFilter} />
        <Filter value="open" current={filter} set={setFilter} />
        <Filter value="done" current={filter} set={setFilter} />
      </div>

      <ul style={{ listStyle: 'none', padding: 0, marginTop: 16 }}>
        {filtered.map(n => (
          <li key={n.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid #eee' }}>
            <span style={{ textDecoration: n.done ? 'line-through' : 'none' }}>{n.text}</span>
            <button onClick={() => toggle(n.id)} aria-label={n.done ? 'Mark as not done' : 'Mark as done'}>{n.done ? 'Undo' : 'Done'}</button>
            <button onClick={() => remove(n.id)} aria-label="Delete">Delete</button>
          </li>
        ))}
        {filtered.length === 0 && <li style={{ color: '#666' }}>No notes to show.</li>}
      </ul>
    </main>
  );
}

type FilterKind = 'all'|'open'|'done';
function Filter({ value, current, set }: { value: FilterKind; current: FilterKind; set: (v: FilterKind) => void }) {
  const active = value === current;
  return (
    <button onClick={() => set(value)} aria-pressed={active} style={{ fontWeight: active ? 700 : 400 }}>
      {value[0].toUpperCase() + value.slice(1)}
    </button>
  );
}
