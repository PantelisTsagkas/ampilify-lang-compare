import { useEffect, useMemo, useState } from 'react';
import { loadNotes, saveNotes } from './storage';

type Note = {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
};

type SortOption = 'date' | 'alphabetical' | 'status';
type FilterKind = 'all' | 'open' | 'done';

const styles = {
  main: {
    maxWidth: 800,
    margin: '2rem auto',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '0 1rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    minHeight: '100vh',
    paddingTop: '2rem',
  },
  container: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '2rem',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  title: {
    textAlign: 'center' as const,
    color: '#2d3748',
    fontSize: '2.5rem',
    fontWeight: 700,
    marginBottom: '2rem',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  controls: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
    marginBottom: '2rem',
  },
  inputRow: {
    display: 'flex',
    gap: '0.75rem',
  },
  input: {
    flex: 1,
    padding: '0.875rem 1rem',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.2s ease',
    background: 'white',
  },
  inputFocus: {
    borderColor: '#667eea',
    boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
    transform: 'translateY(-1px)',
  },
  addButton: {
    padding: '0.875rem 1.5rem',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '1rem',
  },
  addButtonHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
  },
  searchRow: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    padding: '0.75rem 1rem',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'all 0.2s ease',
    background: 'white',
  },
  select: {
    padding: '0.75rem 1rem',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'all 0.2s ease',
    background: 'white',
    cursor: 'pointer',
  },
  filterRow: {
    display: 'flex',
    gap: '0.5rem',
    justifyContent: 'center',
  },
  statsPanel: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
    padding: '1.5rem',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
    borderRadius: '16px',
    border: '1px solid rgba(102, 126, 234, 0.2)',
  },
  statItem: {
    textAlign: 'center' as const,
    padding: '1rem',
    background: 'rgba(255, 255, 255, 0.7)',
    borderRadius: '12px',
    transition: 'all 0.2s ease',
  },
  statNumber: {
    fontSize: '2rem',
    fontWeight: 700,
    color: '#2d3748',
    display: 'block',
  },
  statLabel: {
    fontSize: '0.875rem',
    color: '#718096',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    marginTop: '0.25rem',
  },
  notesList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  noteItem: {
    display: 'grid',
    gridTemplateColumns: '1fr auto auto',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    marginBottom: '0.75rem',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
    transition: 'all 0.3s ease',
    animation: 'slideIn 0.3s ease-out',
  },
  noteItemHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
  },
  noteText: {
    fontSize: '1rem',
    lineHeight: 1.5,
    color: '#2d3748',
    transition: 'all 0.2s ease',
  },
  noteTextDone: {
    textDecoration: 'line-through',
    color: '#a0aec0',
  },
  button: {
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '0.875rem',
  },
  doneButton: {
    background: '#48bb78',
    color: 'white',
  },
  undoButton: {
    background: '#ed8936',
    color: 'white',
  },
  deleteButton: {
    background: '#f56565',
    color: 'white',
  },
  buttonHover: {
    transform: 'translateY(-1px)',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '3rem 1rem',
    color: '#718096',
    fontSize: '1.1rem',
    background: 'rgba(255, 255, 255, 0.5)',
    borderRadius: '12px',
    border: '2px dashed #e2e8f0',
  },
};

export default function App() {
  const [notes, setNotes] = useState<Note[]>(loadNotes());
  const [text, setText] = useState<string>('');
  const [filter, setFilter] = useState<FilterKind>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [hoveredNote, setHoveredNote] = useState<string | null>(null);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  useEffect(() => { saveNotes(notes); }, [notes]);

  function add(): void {
    const val = text.trim();
    if (!val) return;
    setNotes([{ id: crypto.randomUUID(), text: val, done: false, createdAt: new Date().toISOString() }, ...notes]);
    setText('');
    // Focus back to input after adding
    setTimeout(() => {
      const input = document.querySelector('input[placeholder="New note"]') as HTMLInputElement;
      input?.focus();
    }, 100);
  }

  function toggle(id: string): void {
    setNotes(notes.map(n => n.id === id ? { ...n, done: !n.done } : n));
  }

  function remove(id: string): void {
    setNotes(notes.filter(n => n.id !== id));
  }

  // Enhanced filtering and sorting
  const processedNotes = useMemo(() => {
    let result = [...notes];

    // Apply text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(n => n.text.toLowerCase().includes(query));
    }

    // Apply status filter
    if (filter === 'open') result = result.filter(n => !n.done);
    if (filter === 'done') result = result.filter(n => n.done);

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical':
          return a.text.localeCompare(b.text);
        case 'status':
          if (a.done === b.done) return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          return a.done ? 1 : -1;
        case 'date':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return result;
  }, [notes, filter, searchQuery, sortBy]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = notes.length;
    const completed = notes.filter(n => n.done).length;
    const pending = total - completed;
    return { total, completed, pending };
  }, [notes]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            const searchInput = document.querySelector('input[placeholder="Search notes..."]') as HTMLInputElement;
            searchInput?.focus();
            break;
          case 'n':
            e.preventDefault();
            const addInput = document.querySelector('input[placeholder="New note"]') as HTMLInputElement;
            addInput?.focus();
            break;
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div style={styles.main}>
      <style>
        {`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .note-item:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15) !important;
          }
          
          .button:hover {
            transform: translateY(-1px) !important;
          }
          
          .add-button:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3) !important;
          }
          
          .input-focus {
            border-color: #667eea !important;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
            transform: translateY(-1px) !important;
          }
          
          .stat-item:hover {
            transform: translateY(-2px);
            background: rgba(255, 255, 255, 0.9) !important;
          }
        `}
      </style>
      <div style={styles.container}>
        <h1 style={styles.title}>Notes App (TypeScript)</h1>

        {/* Stats Panel */}
        <div style={styles.statsPanel}>
          <div style={styles.statItem} className="stat-item">
            <span style={styles.statNumber}>{stats.total}</span>
            <div style={styles.statLabel}>Total</div>
          </div>
          <div style={styles.statItem} className="stat-item">
            <span style={styles.statNumber}>{stats.pending}</span>
            <div style={styles.statLabel}>Pending</div>
          </div>
          <div style={styles.statItem} className="stat-item">
            <span style={styles.statNumber}>{stats.completed}</span>
            <div style={styles.statLabel}>Completed</div>
          </div>
        </div>

        <div style={styles.controls}>
          {/* Add Note Row */}
          <div style={styles.inputRow}>
            <input
              placeholder="New note (Ctrl/Cmd+N)"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') add();
                if (e.key === 'Escape') setText('');
              }}
              onFocus={() => setFocusedInput('add')}
              onBlur={() => setFocusedInput(null)}
              style={{
                ...styles.input,
                ...(focusedInput === 'add' ? styles.inputFocus : {}),
              }}
              className={focusedInput === 'add' ? 'input-focus' : ''}
              aria-label="New note text"
              autoComplete="off"
            />
            <button 
              onClick={add}
              style={styles.addButton}
              className="add-button"
              disabled={!text.trim()}
              aria-label="Add new note"
            >
              Add Note
            </button>
          </div>

          {/* Search and Sort Row */}
          <div style={styles.searchRow}>
            <input
              placeholder="Search notes... (Ctrl/Cmd+K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setFocusedInput('search')}
              onBlur={() => setFocusedInput(null)}
              style={{
                ...styles.searchInput,
                ...(focusedInput === 'search' ? styles.inputFocus : {}),
              }}
              className={focusedInput === 'search' ? 'input-focus' : ''}
              aria-label="Search notes"
              autoComplete="off"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              style={styles.select}
              aria-label="Sort notes"
            >
              <option value="date">Sort by Date</option>
              <option value="alphabetical">Sort A-Z</option>
              <option value="status">Sort by Status</option>
            </select>
          </div>

          {/* Filter Row */}
          <div style={styles.filterRow}>
            <Filter value="all" current={filter} set={setFilter} />
            <Filter value="open" current={filter} set={setFilter} />
            <Filter value="done" current={filter} set={setFilter} />
          </div>
        </div>

        <ul style={styles.notesList} role="list" aria-label="Notes list">
          {processedNotes.map(n => (
            <li 
              key={n.id} 
              style={{
                ...styles.noteItem,
                ...(hoveredNote === n.id ? styles.noteItemHover : {}),
              }}
              className="note-item"
              onMouseEnter={() => setHoveredNote(n.id)}
              onMouseLeave={() => setHoveredNote(null)}
              role="listitem"
            >
              <span 
                style={{
                  ...styles.noteText,
                  ...(n.done ? styles.noteTextDone : {}),
                }}
                aria-label={`Note: ${n.text}. ${n.done ? 'Completed' : 'Pending'}`}
              >
                {n.text}
              </span>
              <button 
                onClick={() => toggle(n.id)} 
                style={{
                  ...styles.button,
                  ...(n.done ? styles.undoButton : styles.doneButton),
                }}
                className="button"
                aria-label={n.done ? 'Mark as not done' : 'Mark as done'}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowRight') {
                    const deleteBtn = e.currentTarget.nextElementSibling as HTMLButtonElement;
                    deleteBtn?.focus();
                  }
                }}
              >
                {n.done ? '↶ Undo' : '✓ Done'}
              </button>
              <button 
                onClick={() => remove(n.id)} 
                style={{
                  ...styles.button,
                  ...styles.deleteButton,
                }}
                className="button"
                aria-label="Delete note"
                onKeyDown={(e) => {
                  if (e.key === 'ArrowLeft') {
                    const toggleBtn = e.currentTarget.previousElementSibling as HTMLButtonElement;
                    toggleBtn?.focus();
                  }
                }}
              >
                🗑 Delete
              </button>
            </li>
          ))}
          {processedNotes.length === 0 && (
            <li style={styles.emptyState} role="listitem">
              {searchQuery ? `No notes found for "${searchQuery}"` : 'No notes to show. Add your first note above!'}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

function Filter({ value, current, set }: { value: FilterKind; current: FilterKind; set: (v: FilterKind) => void }) {
  const active = value === current;
  const filterStyles = {
    padding: '0.75rem 1.5rem',
    border: active ? '2px solid #667eea' : '2px solid #e2e8f0',
    borderRadius: '25px',
    background: active ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'white',
    color: active ? 'white' : '#4a5568',
    fontWeight: active ? 600 : 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '0.875rem',
    outline: 'none',
  };
  
  return (
    <button 
      onClick={() => set(value)} 
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft' && value !== 'all') {
          const prevButton = e.currentTarget.previousElementSibling as HTMLButtonElement;
          prevButton?.focus();
        }
        if (e.key === 'ArrowRight' && value !== 'done') {
          const nextButton = e.currentTarget.nextElementSibling as HTMLButtonElement;
          nextButton?.focus();
        }
      }}
      aria-pressed={active}
      style={filterStyles}
      className="button"
      role="tab"
      aria-selected={active}
    >
      {value[0].toUpperCase() + value.slice(1)}
    </button>
  );
}
