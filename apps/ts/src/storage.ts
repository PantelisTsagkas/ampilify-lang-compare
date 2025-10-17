export type Note = {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
};

const STORAGE_KEY = 'notes.v1';

/**
 * Load notes from localStorage
 * @returns Array of notes, empty array if no notes or parsing fails
 */
export function loadNotes(): Note[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as Note[];
  } catch (error) {
    console.warn('Failed to load notes from localStorage:', error);
    return [];
  }
}

/**
 * Save notes to localStorage
 * @param notes Array of notes to save
 */
export function saveNotes(notes: Note[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error('Failed to save notes to localStorage:', error);
  }
}

/**
 * Clear all notes from localStorage
 */
export function clearNotes(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear notes from localStorage:', error);
  }
}

/**
 * Create a new note with generated ID and current timestamp
 * @param text The note text content
 * @returns New note object
 */
export function createNote(text: string): Note {
  return {
    id: crypto.randomUUID(),
    text: text.trim(),
    done: false,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Toggle the done status of a note
 * @param note The note to toggle
 * @returns New note object with toggled status
 */
export function toggleNote(note: Note): Note {
  return {
    ...note,
    done: !note.done,
  };
}

/**
 * Filter notes based on search query
 * @param notes Array of notes to filter
 * @param query Search query (case-insensitive)
 * @returns Filtered array of notes
 */
export function searchNotes(notes: Note[], query: string): Note[] {
  if (!query.trim()) return notes;
  const searchTerm = query.toLowerCase().trim();
  return notes.filter(note => 
    note.text.toLowerCase().includes(searchTerm)
  );
}

/**
 * Sort notes by different criteria
 * @param notes Array of notes to sort
 * @param sortBy Sort criteria
 * @returns Sorted array of notes
 */
export function sortNotes(notes: Note[], sortBy: 'date' | 'alphabetical' | 'status'): Note[] {
  const sorted = [...notes];
  
  switch (sortBy) {
    case 'alphabetical':
      return sorted.sort((a, b) => a.text.localeCompare(b.text));
    case 'status':
      return sorted.sort((a, b) => {
        if (a.done === b.done) {
          // If same status, sort by date (newest first)
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        // Show pending notes first
        return a.done ? 1 : -1;
      });
    case 'date':
    default:
      return sorted.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }
}

/**
 * Filter notes by completion status
 * @param notes Array of notes to filter
 * @param filter Filter type
 * @returns Filtered array of notes
 */
export function filterNotesByStatus(notes: Note[], filter: 'all' | 'open' | 'done'): Note[] {
  switch (filter) {
    case 'open':
      return notes.filter(note => !note.done);
    case 'done':
      return notes.filter(note => note.done);
    case 'all':
    default:
      return notes;
  }
}

/**
 * Calculate statistics for notes
 * @param notes Array of notes
 * @returns Statistics object
 */
export function calculateStats(notes: Note[]) {
  const total = notes.length;
  const completed = notes.filter(note => note.done).length;
  const pending = total - completed;
  
  return {
    total,
    completed,
    pending,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}