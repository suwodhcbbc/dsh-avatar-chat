/**
 * localStorage persistence for the Avatar Chat preferences.
 *
 * This browser half has no persistence service, so the page's own
 * `localStorage` is the store, matching the other client features that keep a
 * device-local preference (`ui-sidebar-right`, `ui-conversation`). Every access
 * is guarded: a browser that denies storage or a full quota degrades to
 * in-memory preferences for the life of the page rather than failing the load.
 */
import { defaultAvatarChatPreferences, normalizeAvatarChatPreferences } from "./avatar-chat-state.js";
/** Storage key; the suffix lets a future schema migrate without reading this one. */
export const AVATAR_CHAT_STORAGE_KEY = 'dsh.avatar-chat.v1';
/**
 * Resolve the page's localStorage.
 * @returns the store, or `null` when the browser denies access to it.
 */
export function avatarChatStorage() {
    try {
        return window.localStorage;
    }
    catch {
        // Some browsers throw on the property itself in private or partitioned
        // modes; the feature stays usable with in-memory preferences.
        return null;
    }
}
/**
 * Read and validate the stored preferences.
 * @param storage - the store, or `null` when the browser denied it.
 * @returns the active preferences and how they were obtained.
 */
export function readAvatarChatPreferences(storage) {
    if (storage === null)
        return { status: 'unavailable', preferences: defaultAvatarChatPreferences() };
    let raw;
    try {
        raw = storage.getItem(AVATAR_CHAT_STORAGE_KEY);
    }
    catch {
        // A read can fail independently of the property access (blocked origin,
        // revoked permission); treat it as storage being unavailable.
        return { status: 'unavailable', preferences: defaultAvatarChatPreferences() };
    }
    if (raw === null)
        return { status: 'absent', preferences: defaultAvatarChatPreferences() };
    let parsed;
    try {
        parsed = JSON.parse(raw);
    }
    catch {
        // The entry is not JSON at all; it is as damaged as a document that needs repair.
        return { status: 'damaged', preferences: defaultAvatarChatPreferences() };
    }
    const { preferences, repaired } = normalizeAvatarChatPreferences(parsed);
    return { status: repaired ? 'damaged' : 'stored', preferences };
}
/**
 * Write the preferences, replacing any previous document.
 * @param storage - the store, or `null` when the browser denied it.
 * @param preferences - the document to persist.
 * @returns whether the document reached storage.
 */
export function writeAvatarChatPreferences(storage, preferences) {
    if (storage === null)
        return { status: 'unavailable' };
    try {
        storage.setItem(AVATAR_CHAT_STORAGE_KEY, JSON.stringify(preferences));
        return { status: 'stored' };
    }
    catch {
        // The quota is exhausted or the origin lost write access; the caller keeps
        // the preferences in memory and reports that they were not saved.
        return { status: 'unavailable' };
    }
}
/**
 * Remove the stored document.
 * @param storage - the store, or `null` when the browser denied it.
 */
export function clearAvatarChatPreferences(storage) {
    if (storage === null)
        return;
    try {
        storage.removeItem(AVATAR_CHAT_STORAGE_KEY);
    }
    catch {
        // Nothing to recover from a failed removal: the caller already holds the
        // default document it is about to write.
    }
}
//# sourceMappingURL=avatar-chat-storage.js.map