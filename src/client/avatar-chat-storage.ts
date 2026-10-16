/**
 * localStorage persistence for the Avatar Chat preferences.
 *
 * This browser half has no persistence service, so the page's own
 * `localStorage` is the store, matching the other client features that keep a
 * device-local preference (`ui-sidebar-right`, `ui-conversation`). Every access
 * is guarded: a browser that denies storage or a full quota degrades to
 * in-memory preferences for the life of the page rather than failing the load.
 */
import { defaultAvatarChatPreferences, normalizeAvatarChatPreferences, type AvatarChatPreferences } from './avatar-chat-state.ts'

/** Storage key; the suffix lets a future schema migrate without reading this one. */
export const AVATAR_CHAT_STORAGE_KEY = 'dsh.avatar-chat.v1'

/** How storage answered for the current page. */
export type AvatarChatStorageStatus =
  /** A valid document was read. */
  | 'stored'
  /** No document is stored yet; defaults are active. */
  | 'absent'
  /** A document exists but needed repair; the repaired value is active. */
  | 'damaged'
  /** The browser denied storage; defaults are active and cannot be saved. */
  | 'unavailable'

/** Outcome of reading the stored document. */
export interface AvatarChatReadResult {
  /** How the stored value was found. */
  readonly status: AvatarChatStorageStatus
  /** The preferences to activate, whether stored, repaired, or defaulted. */
  readonly preferences: AvatarChatPreferences
}

/** Outcome of writing the document. */
export type AvatarChatWriteResult =
  /** The document reached storage. */
  | { readonly status: 'stored' }
  /** Storage refused the write; the in-memory preferences remain active for this page. */
  | { readonly status: 'unavailable' }

/** The parts of `Storage` this module needs; narrowed so tests supply a plain fake. */
export interface AvatarChatStorage {
  /** @param key - storage key. @returns the stored string, or `null`. */
  getItem(key: string): string | null
  /** @param key - storage key. @param value - string to store. */
  setItem(key: string, value: string): void
  /** @param key - storage key. */
  removeItem(key: string): void
}

/**
 * Resolve the page's localStorage.
 * @returns the store, or `null` when the browser denies access to it.
 */
export function avatarChatStorage(): AvatarChatStorage | null {
  try {
    return window.localStorage
  } catch {
    // Some browsers throw on the property itself in private or partitioned
    // modes; the feature stays usable with in-memory preferences.
    return null
  }
}

/**
 * Read and validate the stored preferences.
 * @param storage - the store, or `null` when the browser denied it.
 * @returns the active preferences and how they were obtained.
 */
export function readAvatarChatPreferences(storage: AvatarChatStorage | null): AvatarChatReadResult {
  if (storage === null) return { status: 'unavailable', preferences: defaultAvatarChatPreferences() }
  let raw: string | null
  try {
    raw = storage.getItem(AVATAR_CHAT_STORAGE_KEY)
  } catch {
    // A read can fail independently of the property access (blocked origin,
    // revoked permission); treat it as storage being unavailable.
    return { status: 'unavailable', preferences: defaultAvatarChatPreferences() }
  }
  if (raw === null) return { status: 'absent', preferences: defaultAvatarChatPreferences() }
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    // The entry is not JSON at all; it is as damaged as a document that needs repair.
    return { status: 'damaged', preferences: defaultAvatarChatPreferences() }
  }
  const { preferences, repaired } = normalizeAvatarChatPreferences(parsed)
  return { status: repaired ? 'damaged' : 'stored', preferences }
}

/**
 * Write the preferences, replacing any previous document.
 * @param storage - the store, or `null` when the browser denied it.
 * @param preferences - the document to persist.
 * @returns whether the document reached storage.
 */
export function writeAvatarChatPreferences(
  storage: AvatarChatStorage | null,
  preferences: AvatarChatPreferences,
): AvatarChatWriteResult {
  if (storage === null) return { status: 'unavailable' }
  try {
    storage.setItem(AVATAR_CHAT_STORAGE_KEY, JSON.stringify(preferences))
    return { status: 'stored' }
  } catch {
    // The quota is exhausted or the origin lost write access; the caller keeps
    // the preferences in memory and reports that they were not saved.
    return { status: 'unavailable' }
  }
}

/**
 * Remove the stored document.
 * @param storage - the store, or `null` when the browser denied it.
 */
export function clearAvatarChatPreferences(storage: AvatarChatStorage | null): void {
  if (storage === null) return
  try {
    storage.removeItem(AVATAR_CHAT_STORAGE_KEY)
  } catch {
    // Nothing to recover from a failed removal: the caller already holds the
    // default document it is about to write.
  }
}
