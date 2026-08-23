/**
 * Session reset — the user-facing escape hatch from a corrupted session.
 *
 * Wipes the persisted conversation, PRD and stage progress, then reloads so
 * every store starts from its initial state. Deliberately clears localStorage
 * directly rather than calling store actions: if persisted data is malformed
 * enough to break rendering, the stores may never have hydrated properly.
 *
 * `productforge-config` is intentionally preserved so the user does not lose
 * their API key and model settings.
 */
const RESETTABLE_KEYS = [
  'productforge-chat',
  'productforge-prd',
  'productforge-stages',
] as const;

export function resetSession(): void {
  for (const key of RESETTABLE_KEYS) {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      // Private-browsing modes can throw on storage access; a failed removal
      // must not stop us from clearing the remaining keys and reloading.
      console.error(`[resetSession] Failed to remove ${key}:`, err);
    }
  }
  window.location.reload();
}
