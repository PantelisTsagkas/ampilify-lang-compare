import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createNote,
  toggleNote,
  searchNotes,
  sortNotes,
  filterNotesByStatus,
  calculateStats,
  loadNotes,
  saveNotes,
  clearNotes,
  type Note,
} from '../storage';

// Mock localStorage
const localStorageMock = {
  store: new Map<string, string>(),
  getItem: vi.fn().mockImplementation((key: string) => localStorageMock.store.get(key) || null),
  setItem: vi.fn().mockImplementation((key: string, value: string) => {
    localStorageMock.store.set(key, value);
  }),
  removeItem: vi.fn().mockImplementation((key: string) => {
    localStorageMock.store.delete(key);
  }),
  clear: vi.fn().mockImplementation(() => {
    localStorageMock.store.clear();
  }),
};

// Mock crypto.randomUUID
const mockUUID = vi.fn((): string => 'test-uuid-123');
Object.defineProperty(globalThis, 'crypto', {
  value: { randomUUID: mockUUID },
  writable: true,
});

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Sample test data
const sampleNotes: Note[] = [
  {
    id: '1',
    text: 'Buy groceries',
    done: false,
    createdAt: '2023-01-01T10:00:00.000Z',
  },
  {
    id: '2',
    text: 'Walk the dog',
    done: true,
    createdAt: '2023-01-01T11:00:00.000Z',
  },
  {
    id: '3',
    text: 'Finish project',
    done: false,
    createdAt: '2023-01-01T12:00:00.000Z',
  },
];

describe('Storage Functions', () => {
  beforeEach(() => {
    localStorageMock.store.clear();
    vi.clearAllMocks();
  });

  describe('createNote', () => {
    it('should create a note with generated ID and timestamp', () => {
      const text = 'Test note';
      const note = createNote(text);

      expect(note.id).toBe('test-uuid-123');
      expect(note.text).toBe(text);
      expect(note.done).toBe(false);
      expect(note.createdAt).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
    });

    it('should trim whitespace from text', () => {
      const note = createNote('  Test note  ');
      expect(note.text).toBe('Test note');
    });
  });

  describe('toggleNote', () => {
    it('should toggle done status from false to true', () => {
      const note = sampleNotes[0]; // done: false
      const toggled = toggleNote(note);

      expect(toggled.done).toBe(true);
      expect(toggled.id).toBe(note.id);
      expect(toggled.text).toBe(note.text);
    });

    it('should toggle done status from true to false', () => {
      const note = sampleNotes[1]; // done: true
      const toggled = toggleNote(note);

      expect(toggled.done).toBe(false);
      expect(toggled.id).toBe(note.id);
      expect(toggled.text).toBe(note.text);
    });

    it('should not mutate original note', () => {
      const note = sampleNotes[0];
      const originalDone = note.done;
      toggleNote(note);

      expect(note.done).toBe(originalDone);
    });
  });

  describe('searchNotes', () => {
    it('should return all notes when query is empty', () => {
      const result = searchNotes(sampleNotes, '');
      expect(result).toEqual(sampleNotes);
    });

    it('should return all notes when query is whitespace', () => {
      const result = searchNotes(sampleNotes, '   ');
      expect(result).toEqual(sampleNotes);
    });

    it('should filter notes by text content (case-insensitive)', () => {
      const result = searchNotes(sampleNotes, 'buy');
      expect(result).toHaveLength(1);
      expect(result[0].text).toBe('Buy groceries');
    });

    it('should handle uppercase search query', () => {
      const result = searchNotes(sampleNotes, 'BUY');
      expect(result).toHaveLength(1);
      expect(result[0].text).toBe('Buy groceries');
    });

    it('should return empty array when no matches', () => {
      const result = searchNotes(sampleNotes, 'nonexistent');
      expect(result).toHaveLength(0);
    });

    it('should find partial matches', () => {
      const result = searchNotes(sampleNotes, 'project');
      expect(result).toHaveLength(1);
      expect(result[0].text).toBe('Finish project');
    });
  });

  describe('sortNotes', () => {
    it('should sort by date (newest first)', () => {
      const result = sortNotes(sampleNotes, 'date');
      expect(result[0].createdAt).toBe('2023-01-01T12:00:00.000Z');
      expect(result[1].createdAt).toBe('2023-01-01T11:00:00.000Z');
      expect(result[2].createdAt).toBe('2023-01-01T10:00:00.000Z');
    });

    it('should sort alphabetically', () => {
      const result = sortNotes(sampleNotes, 'alphabetical');
      expect(result[0].text).toBe('Buy groceries');
      expect(result[1].text).toBe('Finish project');
      expect(result[2].text).toBe('Walk the dog');
    });

    it('should sort by status (pending first)', () => {
      const result = sortNotes(sampleNotes, 'status');
      // First two should be pending (done: false)
      expect(result[0].done).toBe(false);
      expect(result[1].done).toBe(false);
      // Last should be completed (done: true)
      expect(result[2].done).toBe(true);
    });

    it('should not mutate original array', () => {
      const original = [...sampleNotes];
      sortNotes(sampleNotes, 'alphabetical');
      expect(sampleNotes).toEqual(original);
    });
  });

  describe('filterNotesByStatus', () => {
    it('should return all notes for \"all\" filter', () => {
      const result = filterNotesByStatus(sampleNotes, 'all');
      expect(result).toEqual(sampleNotes);
    });

    it('should return only open notes for \"open\" filter', () => {
      const result = filterNotesByStatus(sampleNotes, 'open');
      expect(result).toHaveLength(2);
      expect(result.every(note => !note.done)).toBe(true);
    });

    it('should return only done notes for \"done\" filter', () => {
      const result = filterNotesByStatus(sampleNotes, 'done');
      expect(result).toHaveLength(1);
      expect(result.every(note => note.done)).toBe(true);
    });

    it('should return empty array when no notes match filter', () => {
      const allDone = sampleNotes.map(note => ({ ...note, done: true }));
      const result = filterNotesByStatus(allDone, 'open');
      expect(result).toHaveLength(0);
    });
  });

  describe('calculateStats', () => {
    it('should calculate correct stats for mixed notes', () => {
      const stats = calculateStats(sampleNotes);
      expect(stats.total).toBe(3);
      expect(stats.completed).toBe(1);
      expect(stats.pending).toBe(2);
      expect(stats.completionRate).toBe(33); // 1/3 * 100 rounded
    });

    it('should handle empty array', () => {
      const stats = calculateStats([]);
      expect(stats.total).toBe(0);
      expect(stats.completed).toBe(0);
      expect(stats.pending).toBe(0);
      expect(stats.completionRate).toBe(0);
    });

    it('should calculate 100% completion rate', () => {
      const allDone = sampleNotes.map(note => ({ ...note, done: true }));
      const stats = calculateStats(allDone);
      expect(stats.completionRate).toBe(100);
    });

    it('should calculate 0% completion rate', () => {
      const allOpen = sampleNotes.map(note => ({ ...note, done: false }));
      const stats = calculateStats(allOpen);
      expect(stats.completionRate).toBe(0);
    });
  });

  describe('localStorage integration', () => {
    describe('saveNotes', () => {
      it('should save notes to localStorage', () => {
        saveNotes(sampleNotes);

        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'notes.v1',
          JSON.stringify(sampleNotes)
        );
      });

      it('should handle localStorage errors gracefully', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        localStorageMock.setItem.mockImplementationOnce(() => {
          throw new Error('Storage full');
        });

        expect(() => saveNotes(sampleNotes)).not.toThrow();
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to save notes to localStorage:',
          expect.any(Error)
        );

        consoleSpy.mockRestore();
      });
    });

    describe('loadNotes', () => {
      it('should load notes from localStorage', () => {
        localStorageMock.setItem('notes.v1', JSON.stringify(sampleNotes));

        const loaded = loadNotes();
        expect(loaded).toEqual(sampleNotes);
      });

      it('should return empty array when no data in localStorage', () => {
        const loaded = loadNotes();
        expect(loaded).toEqual([]);
      });

      it('should handle JSON parsing errors gracefully', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        localStorageMock.setItem('notes.v1', 'invalid json');

        const loaded = loadNotes();
        expect(loaded).toEqual([]);
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to load notes from localStorage:',
          expect.any(Error)
        );

        consoleSpy.mockRestore();
      });

      it('should handle localStorage access errors gracefully', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        localStorageMock.getItem.mockImplementationOnce(() => {
          throw new Error('Access denied');
        });

        const loaded = loadNotes();
        expect(loaded).toEqual([]);
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to load notes from localStorage:',
          expect.any(Error)
        );

        consoleSpy.mockRestore();
      });
    });

    describe('clearNotes', () => {
      it('should clear notes from localStorage', () => {
        clearNotes();
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('notes.v1');
      });

      it('should handle localStorage errors gracefully', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        localStorageMock.removeItem.mockImplementationOnce(() => {
          throw new Error('Access denied');
        });

        expect(() => clearNotes()).not.toThrow();
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to clear notes from localStorage:',
          expect.any(Error)
        );

        consoleSpy.mockRestore();
      });
    });
  });
});