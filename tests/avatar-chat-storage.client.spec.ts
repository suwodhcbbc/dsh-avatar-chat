// @vitest-environment jsdom
/**
 * Storage behaviour: the preferences are device-local, so every path has to
 * survive a browser that denies storage, an entry that is not JSON, and a
 * document that needed repair — each of which the settings page reports
 * differently.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  AVATAR_CHAT_STORAGE_KEY,
  avatarChatStorage,
  clearAvatarChatPreferences,
  readAvatarChatPreferences,
  writeAvatarChatPreferences,
  type AvatarChatStorage,
} from '../src/client/avatar-chat-storage.ts'
import { AVATAR_CHAT_SCHEMA_VERSION, AVATAR_CHAT_SIZE_DEFAULT, defaultAvatarChatPreferences } from '../src/client/avatar-chat-state.ts'

const DATA_URL = 'data:image/png;base64,AAAA'
const storedDocument = JSON.stringify({
  schemaVersion: AVATAR_CHAT_SCHEMA_VERSION,
  size: 40,
  user: { visible: false, image: DATA_URL },
  assistant: { visible: true, image: null },
})

/** A store that answers with a fixed value, or refuses like a blocked origin. */
function fakeStorage(value: string | null, fail: 'get' | 'set' | 'remove' | null = null): AvatarChatStorage {
  return {
    getItem: () => { if (fail === 'get') throw new Error('denied'); return value },
    setItem: () => { if (fail === 'set') throw new Error('full') },
    removeItem: () => { if (fail === 'remove') throw new Error('denied') },
  }
}

afterEach(() => { vi.restoreAllMocks() })

describe('avatarChatStorage', () => {
  it('resolves the page store', () => {
    expect(avatarChatStorage()).toBe(window.localStorage)
  })

  it('answers null when the browser denies the property itself', () => {
    const original = Object.getOwnPropertyDescriptor(window, 'localStorage')
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() { throw new Error('denied in this browsing mode') },
    })
    try {
      expect(avatarChatStorage()).toBeNull()
    } finally {
      if (original !== undefined) Object.defineProperty(window, 'localStorage', original)
    }
  })
})

describe('readAvatarChatPreferences', () => {
  it('reports storage as unavailable when the browser denied it', () => {
    expect(readAvatarChatPreferences(null)).toEqual({
      status: 'unavailable',
      preferences: defaultAvatarChatPreferences(),
    })
  })

  it('reports a failing read as unavailable', () => {
    expect(readAvatarChatPreferences(fakeStorage(null, 'get')).status).toBe('unavailable')
  })

  it('reports an empty store as absent', () => {
    expect(readAvatarChatPreferences(fakeStorage(null))).toEqual({
      status: 'absent',
      preferences: defaultAvatarChatPreferences(),
    })
  })

  it('reports an entry that is not JSON as damaged', () => {
    expect(readAvatarChatPreferences(fakeStorage('{not json')).status).toBe('damaged')
  })

  it('reports a foreign schema as damaged but keeps the readable fields', () => {
    const result = readAvatarChatPreferences(fakeStorage(JSON.stringify({ schemaVersion: 99, size: 40 })))

    expect(result.status).toBe('damaged')
    expect(result.preferences.size).toBe(40)
  })

  it('returns a stored document unchanged', () => {
    const result = readAvatarChatPreferences(fakeStorage(storedDocument))

    expect(result.status).toBe('stored')
    expect(result.preferences).toEqual({
      schemaVersion: AVATAR_CHAT_SCHEMA_VERSION,
      size: 40,
      user: { visible: false, image: DATA_URL },
      assistant: { visible: true, image: null },
    })
  })

  it('reads the key this feature owns', () => {
    const getItem = vi.fn(() => null)

    readAvatarChatPreferences({ getItem, setItem: vi.fn(), removeItem: vi.fn() })

    expect(getItem).toHaveBeenCalledWith(AVATAR_CHAT_STORAGE_KEY)
  })
})

describe('writeAvatarChatPreferences', () => {
  it('reports storage as unavailable when the browser denied it', () => {
    expect(writeAvatarChatPreferences(null, defaultAvatarChatPreferences())).toEqual({ status: 'unavailable' })
  })

  it('reports a refused write as unavailable', () => {
    expect(writeAvatarChatPreferences(fakeStorage(null, 'set'), defaultAvatarChatPreferences()))
      .toEqual({ status: 'unavailable' })
  })

  it('writes the document under the feature key', () => {
    const setItem = vi.fn()
    const preferences = { ...defaultAvatarChatPreferences(), size: AVATAR_CHAT_SIZE_DEFAULT + 2 }

    expect(writeAvatarChatPreferences({ getItem: vi.fn(() => null), setItem, removeItem: vi.fn() }, preferences))
      .toEqual({ status: 'stored' })
    expect(setItem).toHaveBeenCalledWith(AVATAR_CHAT_STORAGE_KEY, JSON.stringify(preferences))
  })
})

describe('clearAvatarChatPreferences', () => {
  it('does nothing without a store', () => {
    expect(() => { clearAvatarChatPreferences(null) }).not.toThrow()
  })

  it('removes the feature key', () => {
    const removeItem = vi.fn()

    clearAvatarChatPreferences({ getItem: vi.fn(() => null), setItem: vi.fn(), removeItem })

    expect(removeItem).toHaveBeenCalledWith(AVATAR_CHAT_STORAGE_KEY)
  })

  it('survives a refused removal', () => {
    expect(() => { clearAvatarChatPreferences(fakeStorage(null, 'remove')) }).not.toThrow()
  })
})
