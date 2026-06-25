// Lightweight shared storage for "quick notes" added on the go from the
// mobile FAB. Each note is keyed per-contact id; the contact detail page
// merges these into its activity timeline on mount.

export type QuickNote = {
  id: string;
  content: string;
  date: string; // ISO
};

export type QuickNotesMap = Record<string, QuickNote[]>;

const KEY = "kstomer.contacts.quicknotes.v1";

export function loadQuickNotes(): QuickNotesMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function getQuickNotesFor(contactId: string): QuickNote[] {
  const all = loadQuickNotes();
  return all[contactId] ?? [];
}

export function addQuickNote(contactId: string, content: string): QuickNote {
  const note: QuickNote = {
    id:
      globalThis.crypto?.randomUUID?.() ??
      `qn-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    content,
    date: new Date().toISOString(),
  };
  const all = loadQuickNotes();
  all[contactId] = [note, ...(all[contactId] ?? [])];
  try {
    window.localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* noop */
  }
  return note;
}
