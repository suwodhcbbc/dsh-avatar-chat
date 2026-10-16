/** Largest accepted upload, in bytes. */
export declare const AVATAR_CHAT_FILE_MAX_BYTES: number;
/** Media types the file picker offers and the reader accepts. */
export declare const AVATAR_CHAT_FILE_TYPES: readonly ["image/png", "image/jpeg", "image/webp", "image/gif"];
/** Longest edge kept when an accepted upload is redrawn. */
export declare const AVATAR_CHAT_DOWNSCALE_EDGE = 256;
/** Output media type for redrawn uploads; a lossless source becomes a small WebP. */
export declare const AVATAR_CHAT_DOWNSCALE_TYPE = "image/webp";
/** Why an upload was rejected. */
export type AvatarChatImageFailure = 
/** The media type is outside the accepted list. */
'type'
/** The file is larger than the accepted upload size. */
 | 'size'
/** The browser could not read the file. */
 | 'read'
/** The read produced something that is not a usable image source. */
 | 'unsupported';
/** Outcome of reading one upload. */
export type AvatarChatImageResult = 
/** A storable image reference. */
{
    readonly status: 'ready';
    readonly image: string;
}
/** The upload was rejected for one named reason. */
 | {
    readonly status: 'failed';
    readonly reason: AvatarChatImageFailure;
};
/** Browser facilities the reader needs, injected so tests drive it directly. */
export interface AvatarChatImageEnvironment {
    /** @param file - the picked file. @returns its bytes as a data URL. */
    readonly readAsDataUrl: (file: Blob) => Promise<string>;
    /**
     * Redraw a picked file within the size budget.
     * @param file - the picked file.
     * @returns the smaller data URL, or `null` when the browser cannot redraw.
     */
    readonly shrink: ((file: Blob) => Promise<string | null>) | null;
}
/**
 * Validate and read one picked file.
 * @param file - the file the user chose.
 * @param environment - reader and redrawer supplied by the page.
 * @returns the storable image, or the reason the upload was rejected.
 */
export declare function readAvatarChatImage(file: File, environment: AvatarChatImageEnvironment): Promise<AvatarChatImageResult>;
/**
 * The page's own reader and redrawer.
 * @returns an environment backed by `FileReader` and `OffscreenCanvas`.
 */
export declare function browserAvatarChatImageEnvironment(): AvatarChatImageEnvironment;
//# sourceMappingURL=avatar-chat-image.d.ts.map