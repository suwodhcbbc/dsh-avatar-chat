/**
 * Preference validation: every value read back from storage is untrusted, so
 * the model has to name what it accepted, what it clamped, and what it had to
 * replace, because the settings page reports a repaired document as damaged.
 */
import { describe, expect, it } from 'vitest'
import {
  AVATAR_CHAT_IMAGE_MAX_CHARS,
  AVATAR_CHAT_SCHEMA_VERSION,
  AVATAR_CHAT_SIZE_DEFAULT,
  AVATAR_CHAT_SIZE_MAX,
  AVATAR_CHAT_SIZE_MIN,
  avatarChatImage,
  defaultAvatarChatPreferences,
  normalizeAvatarChatPreferences,
} from '../src/client/avatar-chat-state.ts'

const DATA_URL = `data:image/png;base64,${'A'.repeat(8)}`
const stored = (overrides: Record<string, unknown> = {}): Record<string, unknown> => ({
  schemaVersion: AVATAR_CHAT_SCHEMA_VERSION,
  size: AVATAR_CHAT_SIZE_DEFAULT,
  user: { visible: true, image: null },
  assistant: { visible: false, image: DATA_URL },
  ...overrides,
})

describe('defaultAvatarChatPreferences', () => {
  it('shows both sides at the default edge with the built-in art', () => {
    expect(defaultAvatarChatPreferences()).toEqual({
      schemaVersion: AVATAR_CHAT_SCHEMA_VERSION,
      size: AVATAR_CHAT_SIZE_DEFAULT,
      user: { visible: true, image: null },
      assistant: { visible: true, image: null },
    })
  })
})

describe('avatarChatImage', () => {
  it('accepts data URLs of images and absolute http addresses', () => {
    expect(avatarChatImage(DATA_URL)).toBe(DATA_URL)
    expect(avatarChatImage('https://example.com/avatar.png')).toBe('https://example.com/avatar.png')
    expect(avatarChatImage('http://example.com/avatar.png?v=2')).toBe('http://example.com/avatar.png?v=2')
  })

  it('rejects values that are not strings', () => {
    expect(avatarChatImage(null)).toBeNull()
    expect(avatarChatImage(7)).toBeNull()
    expect(avatarChatImage({ image: DATA_URL })).toBeNull()
  })

  it('rejects a reference longer than the stored budget', () => {
    expect(avatarChatImage(`data:image/png;base64,${'A'.repeat(AVATAR_CHAT_IMAGE_MAX_CHARS)}`)).toBeNull()
  })

  it('rejects strings that are neither a data URL nor an http address', () => {
    expect(avatarChatImage('avatar.png')).toBeNull()
    expect(avatarChatImage('data:text/plain;base64,AAAA')).toBeNull()
    expect(avatarChatImage('ftp://example.com/avatar.png')).toBeNull()
  })
})

describe('normalizeAvatarChatPreferences', () => {
  it('reports a complete document as untouched', () => {
    const { preferences, repaired } = normalizeAvatarChatPreferences(stored())

    expect(repaired).toBe(false)
    expect(preferences.user).toEqual({ visible: true, image: null })
    expect(preferences.assistant).toEqual({ visible: false, image: DATA_URL })
  })

  it('falls back to the defaults for a value that is not a document', () => {
    expect(normalizeAvatarChatPreferences(null)).toEqual({
      preferences: defaultAvatarChatPreferences(),
      repaired: true,
    })
    expect(normalizeAvatarChatPreferences(['stored']).repaired).toBe(true)
  })

  it('marks a foreign schema version as repaired while keeping the fields', () => {
    const { preferences, repaired } = normalizeAvatarChatPreferences(stored({ schemaVersion: 99 }))

    expect(repaired).toBe(true)
    expect(preferences.schemaVersion).toBe(AVATAR_CHAT_SCHEMA_VERSION)
    expect(preferences.assistant.image).toBe(DATA_URL)
  })

  it('clamps an out-of-range edge and repairs a non-number', () => {
    expect(normalizeAvatarChatPreferences(stored({ size: 1000 })).preferences.size).toBe(AVATAR_CHAT_SIZE_MAX)
    expect(normalizeAvatarChatPreferences(stored({ size: 1 })).preferences.size).toBe(AVATAR_CHAT_SIZE_MIN)
    expect(normalizeAvatarChatPreferences(stored({ size: 30.6 })).preferences.size).toBe(31)
    expect(normalizeAvatarChatPreferences(stored({ size: Number.NaN })).preferences.size).toBe(AVATAR_CHAT_SIZE_DEFAULT)
    expect(normalizeAvatarChatPreferences(stored({ size: '28' })).preferences.size).toBe(AVATAR_CHAT_SIZE_DEFAULT)
  })

  it('replaces a side that is not a document', () => {
    const { preferences, repaired } = normalizeAvatarChatPreferences(stored({ user: 'on' }))

    expect(repaired).toBe(true)
    expect(preferences.user).toEqual({ visible: true, image: null })
  })

  it('defaults a non-boolean visibility and drops an unusable picture', () => {
    const { preferences, repaired } = normalizeAvatarChatPreferences(
      stored({ user: { visible: 'yes', image: 'avatar.png' } }),
    )

    expect(repaired).toBe(true)
    expect(preferences.user).toEqual({ visible: true, image: null })
  })
})
