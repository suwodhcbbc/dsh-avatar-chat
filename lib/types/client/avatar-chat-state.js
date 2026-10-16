/**
 * Avatar Chat preference model: the persisted document, its bounds, and the
 * validation applied to every value read back from storage.
 */
/** Schema version written into every persisted document. */
export const AVATAR_CHAT_SCHEMA_VERSION = 1;
/** Smallest accepted avatar edge, in CSS pixels. */
export const AVATAR_CHAT_SIZE_MIN = 20;
/** Largest accepted avatar edge, in CSS pixels. */
export const AVATAR_CHAT_SIZE_MAX = 64;
/** Edge length used before the user picks one. */
export const AVATAR_CHAT_SIZE_DEFAULT = 28;
/** Longest accepted image reference; a 5 MiB PNG encodes to roughly 6.8M characters. */
export const AVATAR_CHAT_IMAGE_MAX_CHARS = 7_000_000;
/** Preferences used when nothing is stored and by the restore-default action. */
export function defaultAvatarChatPreferences() {
    return {
        schemaVersion: AVATAR_CHAT_SCHEMA_VERSION,
        size: AVATAR_CHAT_SIZE_DEFAULT,
        user: { visible: true, image: null },
        assistant: { visible: true, image: null },
    };
}
/** A data URL of an image, or an absolute HTTP(S) URL. */
const IMAGE_SOURCE = /^(?:data:image\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/]+={0,2}|https?:\/\/\S+)$/;
/**
 * Accept one stored image reference.
 * @param value - candidate read from storage or produced by the file reader.
 * @returns the reference, or `null` when it is not a supported image source.
 */
export function avatarChatImage(value) {
    if (typeof value !== 'string' || value.length > AVATAR_CHAT_IMAGE_MAX_CHARS)
        return null;
    return IMAGE_SOURCE.test(value) ? value : null;
}
/** A candidate object read from parsed JSON, before any field is trusted. */
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
/** Clamp a stored edge length, falling back to the default for a non-number. */
function normalizeSize(value) {
    if (typeof value !== 'number' || !Number.isFinite(value))
        return AVATAR_CHAT_SIZE_DEFAULT;
    return Math.min(AVATAR_CHAT_SIZE_MAX, Math.max(AVATAR_CHAT_SIZE_MIN, Math.round(value)));
}
/** Validate one side's sub-document. */
function normalizeSide(value) {
    if (!isRecord(value))
        return { side: { visible: true, image: null }, repaired: true };
    const visible = typeof value.visible === 'boolean' ? value.visible : true;
    const image = avatarChatImage(value.image);
    return { side: { visible, image }, repaired: value.visible !== visible || value.image !== image };
}
/**
 * Validate a parsed storage document.
 * @param value - the value parsed from storage, or any other candidate.
 * @returns the usable preferences plus whether anything had to be replaced.
 */
export function normalizeAvatarChatPreferences(value) {
    if (!isRecord(value))
        return { preferences: defaultAvatarChatPreferences(), repaired: true };
    const user = normalizeSide(value.user);
    const assistant = normalizeSide(value.assistant);
    const size = normalizeSize(value.size);
    return {
        preferences: { schemaVersion: AVATAR_CHAT_SCHEMA_VERSION, size, user: user.side, assistant: assistant.side },
        repaired: value.schemaVersion !== AVATAR_CHAT_SCHEMA_VERSION
            || value.size !== size
            || user.repaired
            || assistant.repaired,
    };
}
//# sourceMappingURL=avatar-chat-state.js.map