export function joinContactName(firstName: string, lastName: string | null | undefined): string {
  return [firstName.trim(), (lastName ?? "").trim()].filter(Boolean).join(" ");
}

// Best-effort split for the few flows (kanban card editor, mobile quick-add)
// that still capture a contact's name as a single free-text field: first
// word becomes the first name, the rest becomes the last name.
export function splitContactName(fullName: string): { firstName: string; lastName: string | null } {
  const trimmed = fullName.trim();
  const spaceIndex = trimmed.indexOf(" ");
  if (spaceIndex === -1) return { firstName: trimmed, lastName: null };
  return {
    firstName: trimmed.slice(0, spaceIndex),
    lastName: trimmed.slice(spaceIndex + 1).trim() || null,
  };
}
