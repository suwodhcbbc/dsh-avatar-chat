/**
 * Avatar Chat preferences shared by the settings page and the page-level
 * decoration.
 *
 * One handle owns the whole feature state: the settings component reads it
 * through the store seat and mutates it through these actions, and the plugin
 * body subscribes once to persist the document and repaint the document root.
 * That keeps the write and the repaint out of the render path and in one place.
 */
import { defineStore } from '@deepseek-ai/dsh-client-store';
import { AVATAR_CHAT_SIZE_MAX, AVATAR_CHAT_SIZE_MIN, defaultAvatarChatPreferences, } from "./avatar-chat-state.js";
import { avatarChatStorage, readAvatarChatPreferences } from "./avatar-chat-storage.js";
/** Read one side's sub-document. */
function sideOf(preferences, side) {
    return side === 'user' ? preferences.user : preferences.assistant;
}
/** Replace one side's sub-document, leaving the other untouched. */
function withSide(preferences, side, next) {
    return side === 'user' ? { ...preferences, user: next } : { ...preferences, assistant: next };
}
/**
 * Declare the Avatar Chat store.
 * @returns the handle for the feature's preferences and actions.
 */
export function createAvatarChatStore() {
    return defineStore({
        init: () => ({
            // The first instance adopts whatever this browser already stored; a
            // damaged document is repaired here and rewritten by the subscriber that
            // the plugin body installs when it activates the feature.
            preferences: readAvatarChatPreferences(avatarChatStorage()).preferences,
            imageFailure: null,
            saved: true,
        }),
        actions: {
            setVisible: (d, side, visible) => {
                d.preferences = withSide(d.preferences, side, { ...sideOf(d.preferences, side), visible });
            },
            setImage: (d, side, image) => {
                d.preferences = withSide(d.preferences, side, { ...sideOf(d.preferences, side), image });
                d.imageFailure = null;
            },
            setSize: (d, size) => {
                const clamped = Math.min(AVATAR_CHAT_SIZE_MAX, Math.max(AVATAR_CHAT_SIZE_MIN, Math.round(size)));
                d.preferences = { ...d.preferences, size: clamped };
            },
            restoreDefaults: (d) => {
                d.preferences = defaultAvatarChatPreferences();
                d.imageFailure = null;
            },
            noteImageFailure: (d, reason) => { d.imageFailure = reason; },
            noteSaved: (d, saved) => { d.saved = saved; },
        },
    });
}
//# sourceMappingURL=avatar-chat-store.js.map