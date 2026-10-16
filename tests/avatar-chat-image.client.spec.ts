// @vitest-environment jsdom
/**
 * Upload handling: a picked file is validated before it is read, redrawn inside
 * the size budget when the browser can, and reported with a named reason when
 * it cannot be used. The browser facilities are injected, so each rejection is
 * exercised without a real file dialog.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  AVATAR_CHAT_DOWNSCALE_EDGE,
  AVATAR_CHAT_FILE_MAX_BYTES,
  AVATAR_CHAT_FILE_TYPES,
  browserAvatarChatImageEnvironment,
  readAvatarChatImage,
  type AvatarChatImageEnvironment,
} from '../src/client/avatar-chat-image.ts'
import { avatarChatImage } from '../src/client/avatar-chat-state.ts'

const DATA_URL = `data:image/webp;base64,${'A'.repeat(8)}`

/** A picked file of the accepted kind and a size the reader accepts. */
function picked(type = 'image/png', size = 1024): File {
  const file = new File(['x'], 'avatar.png', { type })
  Object.defineProperty(file, 'size', { configurable: true, value: size })
  return file
}

const environment = (overrides: Partial<AvatarChatImageEnvironment> = {}): AvatarChatImageEnvironment => ({
  readAsDataUrl: () => Promise.resolve(DATA_URL),
  shrink: null,
  ...overrides,
})

afterEach(() => { vi.unstubAllGlobals() })

describe('readAvatarChatImage', () => {
  it('refuses a media type the picker does not offer', async () => {
    expect(await readAvatarChatImage(picked('image/svg+xml'), environment()))
      .toEqual({ status: 'failed', reason: 'type' })
  })

  it('refuses a file over the upload budget', async () => {
    expect(await readAvatarChatImage(picked('image/png', AVATAR_CHAT_FILE_MAX_BYTES + 1), environment()))
      .toEqual({ status: 'failed', reason: 'size' })
  })

  it('accepts every offered media type', () => {
    expect(AVATAR_CHAT_FILE_TYPES).toEqual(['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
  })

  it('prefers the redrawn picture over the full-size read', async () => {
    const readAsDataUrl = vi.fn(() => Promise.resolve('data:image/png;base64,BBBB'))
    const result = await readAvatarChatImage(picked(), environment({ readAsDataUrl, shrink: () => Promise.resolve(DATA_URL) }))

    expect(result).toEqual({ status: 'ready', image: DATA_URL })
    expect(readAsDataUrl).not.toHaveBeenCalled()
  })

  it('falls back to the full-size read when the browser cannot redraw', async () => {
    const readAsDataUrl = () => Promise.resolve('data:image/png;base64,BBBB')

    expect(await readAvatarChatImage(picked(), environment({ readAsDataUrl, shrink: () => Promise.resolve(null) })))
      .toEqual({ status: 'ready', image: 'data:image/png;base64,BBBB' })
  })

  it('falls back to the full-size read when redrawing throws', async () => {
    const readAsDataUrl = () => Promise.resolve('data:image/png;base64,BBBB')

    expect(await readAvatarChatImage(picked(), environment({ readAsDataUrl, shrink: () => Promise.reject(new Error('no canvas')) })))
      .toEqual({ status: 'ready', image: 'data:image/png;base64,BBBB' })
  })

  it('names a read failure', async () => {
    expect(await readAvatarChatImage(picked(), environment({ readAsDataUrl: () => Promise.reject(new Error('gone')) })))
      .toEqual({ status: 'failed', reason: 'read' })
  })

  it('names a read that produced no usable picture', async () => {
    expect(await readAvatarChatImage(picked(), environment({ readAsDataUrl: () => Promise.resolve('not-an-image') })))
      .toEqual({ status: 'failed', reason: 'unsupported' })
  })
})

describe('browserAvatarChatImageEnvironment', () => {
  it('reads a blob with the page FileReader', async () => {
    const blob = new Blob(['x'], { type: 'image/png' })
    const result = await browserAvatarChatImageEnvironment().readAsDataUrl(blob)

    expect(avatarChatImage(result)).toBe(result)
  })

  it('does not redraw when the browser has no bitmaps or canvas', async () => {
    const shrink = browserAvatarChatImageEnvironment().shrink

    expect(shrink).not.toBeNull()
    expect(await shrink?.(new Blob(['x']))).toBeNull()
  })

  it('redraws a large picture inside the bounded edge', async () => {
    const drawImage = vi.fn()
    const close = vi.fn()
    const canvas = vi.fn()
    class FakeCanvas {
      constructor(readonly width: number, readonly height: number) { canvas(width, height) }
      getContext(): unknown { return { drawImage } }
      convertToBlob(): Promise<Blob> { return Promise.resolve(new Blob(['webp'], { type: 'image/webp' })) }
    }
    vi.stubGlobal('createImageBitmap', () => Promise.resolve({ width: 1024, height: 512, close }))
    vi.stubGlobal('OffscreenCanvas', FakeCanvas)

    const result = await browserAvatarChatImageEnvironment().shrink?.(new Blob(['x']))

    expect(canvas).toHaveBeenCalledWith(AVATAR_CHAT_DOWNSCALE_EDGE, AVATAR_CHAT_DOWNSCALE_EDGE / 2)
    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, AVATAR_CHAT_DOWNSCALE_EDGE, AVATAR_CHAT_DOWNSCALE_EDGE / 2)
    expect(close).toHaveBeenCalled()
    expect(avatarChatImage(result ?? '')).toBe(result)
  })

  it('keeps a small picture at its own size', async () => {
    const canvas = vi.fn()
    class FakeCanvas {
      constructor(readonly width: number, readonly height: number) { canvas(width, height) }
      getContext(): unknown { return { drawImage: vi.fn() } }
      convertToBlob(): Promise<Blob> { return Promise.resolve(new Blob(['webp'], { type: 'image/webp' })) }
    }
    vi.stubGlobal('createImageBitmap', () => Promise.resolve({ width: 64, height: 64, close: vi.fn() }))
    vi.stubGlobal('OffscreenCanvas', FakeCanvas)

    await browserAvatarChatImageEnvironment().shrink?.(new Blob(['x']))

    expect(canvas).toHaveBeenCalledWith(64, 64)
  })

  it('reports a reader error that carries its own cause', async () => {
    const denied = new Error('denied')
    class FailingReader {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      error: Error | null = denied
      readAsDataURL(): void { queueMicrotask(() => { this.onerror?.() }) }
    }
    vi.stubGlobal('FileReader', FailingReader)

    await expect(browserAvatarChatImageEnvironment().readAsDataUrl(new Blob(['x']))).rejects.toThrow('denied')
  })

  it('names a reader error that carries no cause', async () => {
    class FailingReader {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      error: Error | null = null
      readAsDataURL(): void { queueMicrotask(() => { this.onerror?.() }) }
    }
    vi.stubGlobal('FileReader', FailingReader)

    await expect(browserAvatarChatImageEnvironment().readAsDataUrl(new Blob(['x'])))
      .rejects.toThrow('avatar-chat: the file could not be read')
  })

  it('names a read that produced something other than a data URL', async () => {
    class OddReader {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      result: ArrayBuffer | null = new ArrayBuffer(0)
      readAsDataURL(): void { queueMicrotask(() => { this.onload?.() }) }
    }
    vi.stubGlobal('FileReader', OddReader)

    await expect(browserAvatarChatImageEnvironment().readAsDataUrl(new Blob(['x'])))
      .rejects.toThrow('avatar-chat: the file could not be read')
  })

  it('gives up when the canvas has no drawing context', async () => {
    class FakeCanvas {
      constructor(readonly width: number, readonly height: number) {}
      getContext(): null { return null }
    }
    const close = vi.fn()
    vi.stubGlobal('createImageBitmap', () => Promise.resolve({ width: 512, height: 512, close }))
    vi.stubGlobal('OffscreenCanvas', FakeCanvas)

    expect(await browserAvatarChatImageEnvironment().shrink?.(new Blob(['x']))).toBeNull()
    expect(close).toHaveBeenCalled()
  })
})
