/**
 * Avatar Chat preference model: the persisted document, its bounds, and the
 * validation applied to every value read back from storage.
 */

/** Which side of the transcript a picture belongs to. */
export type AvatarChatSide = 'user' | 'assistant'

/** Schema version written into every persisted document. */
export const AVATAR_CHAT_SCHEMA_VERSION = 1

/** Smallest accepted avatar edge, in CSS pixels. */
export const AVATAR_CHAT_SIZE_MIN = 20
/** Largest accepted avatar edge, in CSS pixels. */
export const AVATAR_CHAT_SIZE_MAX = 64
/** Edge length used before the user picks one. */
export const AVATAR_CHAT_SIZE_DEFAULT = 28

/** Longest accepted image reference; a 5 MiB PNG encodes to roughly 6.8M characters. */
export const AVATAR_CHAT_IMAGE_MAX_CHARS = 7_000_000

/** One side's configured picture. `image: null` keeps the built-in drawn avatar. */
export interface AvatarChatSidePreferences {
  /** Whether this side's avatar is painted in the transcript. */
  readonly visible: boolean
  /** Data URL or remote URL of the picture, or `null` for the built-in avatar. */
  readonly image: string | null
}

/** The complete persisted preference document. */
export interface AvatarChatPreferences {
  /** Schema version of this document; a foreign value marks it repaired. */
  readonly schemaVersion: typeof AVATAR_CHAT_SCHEMA_VERSION
  /** Avatar edge in CSS pixels, within the accepted range. */
  readonly size: number
  /** Preferences for the user's own messages. */
  readonly user: AvatarChatSidePreferences
  /** Preferences for assistant replies. */
  readonly assistant: AvatarChatSidePreferences
}

/** Preferences used when nothing is stored and by the restore-default action. */
export function defaultAvatarChatPreferences(): AvatarChatPreferences {
  return {
    schemaVersion: AVATAR_CHAT_SCHEMA_VERSION,
    size: AVATAR_CHAT_SIZE_DEFAULT,
    user: { visible: true, image: null },
    assistant: { visible: true, image: null },
  }
}

/** A data URL of an image, or an absolute HTTP(S) URL. */
const IMAGE_SOURCE = /^(?:data:image\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/]+={0,2}|https?:\/\/\S+)$/

/**
 * Accept one stored image reference.
 * @param value - candidate read from storage or produced by the file reader.
 * @returns the reference, or `null` when it is not a supported image source.
 */
export function avatarChatImage(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > AVATAR_CHAT_IMAGE_MAX_CHARS) return null
  return IMAGE_SOURCE.test(value) ? value : null
}

/** A candidate object read from parsed JSON, before any field is trusted. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Clamp a stored edge length, falling back to the default for a non-number. */
function normalizeSize(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return AVATAR_CHAT_SIZE_DEFAULT
  return Math.min(AVATAR_CHAT_SIZE_MAX, Math.max(AVATAR_CHAT_SIZE_MIN, Math.round(value)))
}

/** Validate one side's sub-document. */
function normalizeSide(value: unknown): { readonly side: AvatarChatSidePreferences; readonly repaired: boolean } {
  if (!isRecord(value)) return { side: { visible: true, image: null }, repaired: true }
  const visible = typeof value.visible === 'boolean' ? value.visible : true
  const image = avatarChatImage(value.image)
  return { side: { visible, image }, repaired: value.visible !== visible || value.image !== image }
}

/** Result of validating a candidate preference document. */
export interface AvatarChatNormalization {
  /** The validated document; every field is present and within bounds. */
  readonly preferences: AvatarChatPreferences
  /** Whether any stored field was missing, out of range, or unsupported. */
  readonly repaired: boolean
}

/**
 * Validate a parsed storage document.
 * @param value - the value parsed from storage, or any other candidate.
 * @returns the usable preferences plus whether anything had to be replaced.
 */
export function normalizeAvatarChatPreferences(value: unknown): AvatarChatNormalization {
  if (!isRecord(value)) return { preferences: defaultAvatarChatPreferences(), repaired: true }
  const user = normalizeSide(value.user)
  const assistant = normalizeSide(value.assistant)
  const size = normalizeSize(value.size)
  return {
    preferences: { schemaVersion: AVATAR_CHAT_SCHEMA_VERSION, size, user: user.side, assistant: assistant.side },
    repaired: value.schemaVersion !== AVATAR_CHAT_SCHEMA_VERSION
      || value.size !== size
      || user.repaired
      || assistant.repaired,
  }
}
