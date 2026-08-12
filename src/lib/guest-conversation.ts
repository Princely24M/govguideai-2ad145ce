export type GuestMessage = { role: "user" | "assistant"; content: string };

const PENDING_KEY = "govguide.pendingImport.v1";

export function stashGuestConversation(messages: GuestMessage[]) {
  try {
    window.localStorage.setItem(PENDING_KEY, JSON.stringify(messages.slice(-60)));
  } catch {
    /* storage unavailable */
  }
}

export function readGuestConversation(): GuestMessage[] {
  try {
    const raw = window.localStorage.getItem(PENDING_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GuestMessage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function clearGuestConversation() {
  try {
    window.localStorage.removeItem(PENDING_KEY);
  } catch {
    /* storage unavailable */
  }
}