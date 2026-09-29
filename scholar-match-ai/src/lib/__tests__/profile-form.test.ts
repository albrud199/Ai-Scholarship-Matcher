import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  EMPTY_PROFILE_FORM,
  clearDraft,
  loadDraft,
  mergeForms,
  saveDraft,
  type ProfileFormState,
} from '@/lib/profile-form';

const filled: ProfileFormState = {
  ...EMPTY_PROFILE_FORM,
  fullName: 'Alex Johnson',
  nationality: 'Vietnam',
  gpa: '3.60',
  goals: 'I want to study renewable energy systems and bring that expertise home.',
  preferredCountries: ['Germany', 'Canada'],
};

// jsdom ships a `window.localStorage` stub without the Storage methods, so install
// a working one: these tests are about what gets written and read back.
function installLocalStorage(): Storage {
  let store: Record<string, string> = {};
  const storage: Storage = {
    get length() {
      return Object.keys(store).length;
    },
    clear: () => {
      store = {};
    },
    getItem: (key) => (key in store ? store[key] : null),
    key: (index) => Object.keys(store)[index] ?? null,
    removeItem: (key) => {
      delete store[key];
    },
    setItem: (key, value) => {
      store[key] = String(value);
    },
  };
  Object.defineProperty(window, 'localStorage', { value: storage, configurable: true, writable: true });
  return storage;
}

beforeEach(() => {
  installLocalStorage();
  clearDraft();
  clearDraft('user-a');
  clearDraft('user-b');
});

describe('profile draft storage', () => {
  it('returns a draft that was saved earlier', () => {
    saveDraft(filled);
    expect(loadDraft()?.fullName).toBe('Alex Johnson');
    expect(loadDraft()?.preferredCountries).toEqual(['Germany', 'Canada']);
  });

  it('falls back to the blank starter profile when nothing new is declared', () => {
    // `studentProfile` is deliberately blank; `seedProfile` carries the demo data.
    expect(EMPTY_PROFILE_FORM.fullName).toBe('');
    expect(EMPTY_PROFILE_FORM.targetDegreeLevel).toBe('master');
    expect(EMPTY_PROFILE_FORM.preferredCountries).toEqual([]);
    expect(EMPTY_PROFILE_FORM.research).toEqual([]);
  });

  it('keeps a draft per account so a shared computer never leaks answers', () => {
    saveDraft({ ...filled, fullName: 'Student A' }, 'user-a');
    saveDraft({ ...filled, fullName: 'Student B' }, 'user-b');

    expect(loadDraft('user-a')?.fullName).toBe('Student A');
    expect(loadDraft('user-b')?.fullName).toBe('Student B');
  });

  it('still restores the form when the browser refuses to write storage', () => {
    const setItem = vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    saveDraft(filled);
    setItem.mockRestore();

    // loadDraft falls back to the in-memory mirror, which is what survives a
    // client-side trip to another page when storage is unavailable.
    expect(window.localStorage.getItem('scholarmatch:profile-draft')).toBeNull();
    expect(loadDraft()?.fullName).toBe('Alex Johnson');
  });

  it('merges an older draft shape over the blank form instead of losing fields', () => {
    window.localStorage.setItem('scholarmatch:profile-draft', JSON.stringify({ fullName: 'Legacy Student' }));
    const draft = loadDraft();
    expect(draft?.fullName).toBe('Legacy Student');
    // A field the older draft never wrote stays at its blank default.
    expect(draft?.goals).toBe('');
    expect(draft?.research).toEqual([]);
  });

  it('clears the draft once it is safely stored on the server', () => {
    saveDraft(filled, 'user-a');
    clearDraft('user-a');
    expect(loadDraft('user-a')).toBeNull();
  });
});

describe('mergeForms', () => {
  it('prefers the local draft when the student has started typing', () => {
    expect(mergeForms(EMPTY_PROFILE_FORM, filled)).toBe(filled);
  });

  it('prefers the saved row when there is no draft at all', () => {
    expect(mergeForms(filled, null)).toBe(filled);
  });

  it('prefers the saved row when the draft holds nothing', () => {
    expect(mergeForms(filled, EMPTY_PROFILE_FORM)).toBe(filled);
  });
});
