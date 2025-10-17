// Simple localStorage-backed repository
const STORAGE_KEY = 'notes.v1';

/**
 * Load notes from localStorage
 * @returns {Array} Array of notes, empty array if no notes or parsing fails
 */
export function loadNotes() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.warn('Failed to load notes from localStorage:', error);
    return [];
  }
}

/**
 * Save notes to localStorage
 * @param {Array} notes Array of notes to save
 */
export function saveNotes(notes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error('Failed to save notes to localStorage:', error);
  }
}

/**
 * Clear all notes from localStorage
 */
export function clearNotes() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear notes from localStorage:', error);
  }
}

/**
 * Create a new note with generated ID and current timestamp
 * @param {string} text The note text content
 * @returns {Object} New note object
 */
export function createNote(text) {
  return {
    id: crypto.randomUUID(),
    text: text.trim(),
    done: false,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Toggle the done status of a note
 * @param {Object} note The note to toggle
 * @returns {Object} New note object with toggled status
 */
export function toggleNote(note) {
  return {
    ...note,
    done: !note.done,
  };
}

/**
 * Filter notes based on search query
 * @param {Array} notes Array of notes to filter
 * @param {string} query Search query (case-insensitive)
 * @returns {Array} Filtered array of notes
 */
export function searchNotes(notes, query) {
  if (!query.trim()) return notes;
  const searchTerm = query.toLowerCase().trim();
  return notes.filter(note => 
    note.text.toLowerCase().includes(searchTerm)
  );
}

/**
 * Sort notes by different criteria
 * @param {Array} notes Array of notes to sort
 * @param {string} sortBy Sort criteria ('date' | 'alphabetical' | 'status')
 * @returns {Array} Sorted array of notes
 */
export function sortNotes(notes, sortBy) {
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
 * @param {Array} notes Array of notes to filter
 * @param {string} filter Filter type ('all' | 'open' | 'done')
 * @returns {Array} Filtered array of notes
 */
export function filterNotesByStatus(notes, filter) {
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
 * @param {Array} notes Array of notes
 * @returns {Object} Statistics object
 */
export function calculateStats(notes) {
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