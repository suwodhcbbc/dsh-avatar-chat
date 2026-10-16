/**
 * Turn a file the user picked into a storable avatar image.
 *
 * Uploads are validated before they are read, then redrawn within a bounded
 * edge so a photo lands in `localStorage` well inside its quota. Everything the
 * browser provides is injected, so the whole path is exercisable without a DOM
 * and every rejection has a named reason the settings page can localize.
 */
import { avatarChatImage } from './avatar-chat-state.ts'

/** Largest accepted upload, in bytes. */
export const AVATAR_CHAT_FILE_MAX_BYTES = 5 * 1024 * 1024
/** Media types the file picker offers and the reader accepts. */
export const AVATAR_CHAT_FILE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'] as const
/** Longest edge kept when an accepted upload is redrawn. */
export const AVATAR_CHAT_DOWNSCALE_EDGE = 256
/** Output media type for redrawn uploads; a lossless source becomes a small WebP. */
export const AVATAR_CHAT_DOWNSCALE_TYPE = 'image/webp'

/** Why an upload was rejected. */
export type AvatarChatImageFailure =
  /** The media type is outside the accepted list. */
  | 'type'
  /** The file is larger than the accepted upload size. */
  | 'size'
  /** The browser could not read the file. */
  | 'read'
  /** The read produced something that is not a usable image source. */
  | 'unsupported'

/** Outcome of reading one upload. */
export type AvatarChatImageResult =
  /** A storable image reference. */
  | { readonly status: 'ready'; readonly image: string }
  /** The upload was rejected for one named reason. */
  | { readonly status: 'failed'; readonly reason: AvatarChatImageFailure }

/** Browser facilities the reader needs, injected so tests drive it directly. */
export interface AvatarChatImageEnvironment {
  /** @param file - the picked file. @returns its bytes as a data URL. */
  readonly readAsDataUrl: (file: Blob) => Promise<string>
  /**
   * Redraw a picked file within the size budget.
   * @param file - the picked file.
   * @returns the smaller data URL, or `null` when the browser cannot redraw.
   */
  readonly shrink: ((file: Blob) => Promise<string | null>) | null
}

/**
 * Validate and read one picked file.
 * @param file - the file the user chose.
 * @param environment - reader and redrawer supplied by the page.
 * @returns the storable image, or the reason the upload was rejected.
 */
export async function readAvatarChatImage(
  file: File,
  environment: AvatarChatImageEnvironment,
): Promise<AvatarChatImageResult> {
  if (!(AVATAR_CHAT_FILE_TYPES as readonly string[]).includes(file.type)) return { status: 'failed', reason: 'type' }
  if (file.size > AVATAR_CHAT_FILE_MAX_BYTES) return { status: 'failed', reason: 'size' }
  const shrunk = await attemptedShrink(file, environment)
  const image = shrunk ?? await attemptedRead(file, environment)
  if (image === null) return { status: 'failed', reason: 'read' }
  const accepted = avatarChatImage(image)
  if (accepted === null) return { status: 'failed', reason: 'unsupported' }
  return { status: 'ready', image: accepted }
}

/** Redraw the file, falling back to the full-size read on any failure. */
async function attemptedShrink(file: File, environment: AvatarChatImageEnvironment): Promise<string | null> {
  if (environment.shrink === null) return null
  try {
    return await environment.shrink(file)
  } catch {
    // Redrawing needs bitmap and canvas support the browser withheld; the
    // full-size read below is still a valid image.
    return null
  }
}

/** Read the file, reporting a read failure as `null` so the caller names it. */
async function attemptedRead(file: File, environment: AvatarChatImageEnvironment): Promise<string | null> {
  try {
    return await environment.readAsDataUrl(file)
  } catch {
    // The reader rejected the handle: the file was moved, deleted, or the
    // origin lost read access between picking and reading.
    return null
  }
}

/**
 * The page's own reader and redrawer.
 * @returns an environment backed by `FileReader` and `OffscreenCanvas`.
 */
export function browserAvatarChatImageEnvironment(): AvatarChatImageEnvironment {
  return { readAsDataUrl: readBlobAsDataUrl, shrink: shrinkBlobToDataUrl }
}

/**
 * Read a blob as a data URL.
 * @param file - the blob to read.
 * @returns the data URL.
 * @throws When the reader reports an error; `readAvatarChatImage` turns that into `'read'`.
 */
function readBlobAsDataUrl(file: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result !== 'string') { reject(new Error('avatar-chat: the file could not be read')); return }
      resolve(result)
    }
    reader.onerror = () => { reject(reader.error ?? new Error('avatar-chat: the file could not be read')) }
    reader.readAsDataURL(file)
  })
}

/**
 * Redraw a picked file within {@link AVATAR_CHAT_DOWNSCALE_EDGE}.
 * @param file - the picked file.
 * @returns the redrawn data URL, or `null` when the browser lacks bitmaps or canvas.
 */
async function shrinkBlobToDataUrl(file: Blob): Promise<string | null> {
  if (typeof createImageBitmap !== 'function' || typeof OffscreenCanvas !== 'function') return null
  const bitmap = await createImageBitmap(file)
  try {
    const edge = Math.max(bitmap.width, bitmap.height)
    const scale = edge > AVATAR_CHAT_DOWNSCALE_EDGE ? AVATAR_CHAT_DOWNSCALE_EDGE / edge : 1
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))
    const canvas = new OffscreenCanvas(width, height)
    const context = canvas.getContext('2d')
    if (context === null) return null
    context.drawImage(bitmap, 0, 0, width, height)
    const blob = await canvas.convertToBlob({ type: AVATAR_CHAT_DOWNSCALE_TYPE })
    return await readBlobAsDataUrl(blob)
  } finally {
    bitmap.close()
  }
}
