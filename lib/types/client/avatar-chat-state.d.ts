/**
 * Avatar Chat preference model: the persisted document, its bounds, and the
 * validation applied to every value read back from storage.
 */
/** Which side of the transcript a picture belongs to. */
export type AvatarChatSide = 'user' | 'assistant';
/** Schema version written into every persisted document. */
export declare const AVATAR_CHAT_SCHEMA_VERSION = 1;
/** Smallest accepted avatar edge, in CSS pixels. */
export declare const AVATAR_CHAT_SIZE_MIN = 20;
/** Largest accepted avatar edge, in CSS pixels. */
export declare const AVATAR_CHAT_SIZE_MAX = 64;
/** Edge length used before the user picks one. */
export declare const AVATAR_CHAT_SIZE_DEFAULT = 28;
/** Longest accepted image reference; a 5 MiB PNG encodes to roughly 6.8M characters. */
export declare const AVATAR_CHAT_IMAGE_MAX_CHARS = 7000000;
/** One side's configured picture. `image: null` keeps the built-in drawn avatar. */
export interface AvatarChatSidePreferences {
    /** Whether this side's avatar is painted in the transcript. */
    readonly visible: boolean;
    /** Data URL or remote URL of the picture, or `null` for the built-in avatar. */
    readonly image: string | null;
}
/** The complete persisted preference document. */
export interface AvatarChatPreferences {
    /** Schema version of this document; a foreign value marks it repaired. */
    readonly schemaVersion: typeof AVATAR_CHAT_SCHEMA_VERSION;
    /** Avatar edge in CSS pixels, within the accepted range. */
    readonly size: number;
    /** Preferences for the user's own messages. */
    readonly user: AvatarChatSidePreferences;
    /** Preferences for assistant replies. */
    readonly assistant: AvatarChatSidePreferences;
}
/** Preferences used when nothing is stored and by the restore-default action. */
export declare function defaultAvatarChatPreferences(): AvatarChatPreferences;
/**
 * Accept one stored image reference.
 * @param value - candidate read from storage or produced by the file reader.
 * @returns the reference, or `null` when it is not a supported image source.
 */
export declare function avatarChatImage(value: unknown): string | null;
/** Result of validating a candidate preference document. */
export interface AvatarChatNormalization {
    /** The validated document; every field is present and within bounds. */
    readonly preferences: AvatarChatPreferences;
    /** Whether any stored field was missing, out of range, or unsupported. */
    readonly repaired: boolean;
}
/**
 * Validate a parsed storage document.
 * @param value - the value parsed from storage, or any other candidate.
 * @returns the usable preferences plus whether anything had to be replaced.
 */
export declare function normalizeAvatarChatPreferences(value: unknown): AvatarChatNormalization;
//# sourceMappingURL=avatar-chat-state.d.ts.map