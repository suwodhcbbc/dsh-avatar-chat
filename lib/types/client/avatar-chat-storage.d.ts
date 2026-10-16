/**
 * localStorage persistence for the Avatar Chat preferences.
 *
 * This browser half has no persistence service, so the page's own
 * `localStorage` is the store, matching the other client features that keep a
 * device-local preference (`ui-sidebar-right`, `ui-conversation`). Every access
 * is guarded: a browser that denies storage or a full quota degrades to
 * in-memory preferences for the life of the page rather than failing the load.
 */
import { type AvatarChatPreferences } from './avatar-chat-state.ts';
/** Storage key; the suffix lets a future schema migrate without reading this one. */
export declare const AVATAR_CHAT_STORAGE_KEY = "dsh.avatar-chat.v1";
/** How storage answered for the current page. */
export type AvatarChatStorageStatus = 
/** A valid document was read. */
'stored'
/** No document is stored yet; defaults are active. */
 | 'absent'
/** A document exists but needed repair; the repaired value is active. */
 | 'damaged'
/** The browser denied storage; defaults are active and cannot be saved. */
 | 'unavailable';
/** Outcome of reading the stored document. */
export interface AvatarChatReadResult {
    /** How the stored value was found. */
    readonly status: AvatarChatStorageStatus;
    /** The preferences to activate, whether stored, repaired, or defaulted. */
    readonly preferences: AvatarChatPreferences;
}
/** Outcome of writing the document. */
export type AvatarChatWriteResult = 
/** The document reached storage. */
{
    readonly status: 'stored';
}
/** Storage refused the write; the in-memory preferences remain active for this page. */
 | {
    readonly status: 'unavailable';
};
/** The parts of `Storage` this module needs; narrowed so tests supply a plain fake. */
export interface AvatarChatStorage {
    /** @param key - storage key. @returns the stored string, or `null`. */
    getItem(key: string): string | null;
    /** @param key - storage key. @param value - string to store. */
    setItem(key: string, value: string): void;
    /** @param key - storage key. */
    removeItem(key: string): void;
}
/**
 * Resolve the page's localStorage.
 * @returns the store, or `null` when the browser denies access to it.
 */
export declare function avatarChatStorage(): AvatarChatStorage | null;
/**
 * Read and validate the stored preferences.
 * @param storage - the store, or `null` when the browser denied it.
 * @returns the active preferences and how they were obtained.
 */
export declare function readAvatarChatPreferences(storage: AvatarChatStorage | null): AvatarChatReadResult;
/**
 * Write the preferences, replacing any previous document.
 * @param storage - the store, or `null` when the browser denied it.
 * @param preferences - the document to persist.
 * @returns whether the document reached storage.
 */
export declare function writeAvatarChatPreferences(storage: AvatarChatStorage | null, preferences: AvatarChatPreferences): AvatarChatWriteResult;
/**
 * Remove the stored document.
 * @param storage - the store, or `null` when the browser denied it.
 */
export declare function clearAvatarChatPreferences(storage: AvatarChatStorage | null): void;
//# sourceMappingURL=avatar-chat-storage.d.ts.map