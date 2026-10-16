// @vitest-environment jsdom
/**
 * The store is the single writer for the feature: the settings page mutates it
 * through these actions and the plugin body reacts to the resulting snapshots.
 * These cases pin the clamping, the reset, and the failure bookkeeping the
 * settings page renders from.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createAvatarChatStore } from '../src/client/avatar-chat-store.ts'
import { AVATAR_CHAT_STORAGE_KEY } from '../src/client/avatar-chat-storage.ts'
import {
  AVATAR_CHAT_SCHEMA_VERSION,
  AVATAR_CHAT_SIZE_DEFAULT,
  AVATAR_CHAT_SIZE_MAX,
  AVATAR_CHAT_SIZE_MIN,
} from '../src/client/avatar-chat-state.ts'

const DATA_URL = 'data:image/png;base64,AAAA'

/** A fresh instance over whatever this browser currently stores. */
function instance(): ReturnType<ReturnType<typeof createAvatarChatStore>['create']> {
  return createAvatarChatStore().create()
}

beforeEach(() => { window.localStorage.clear() })
afterEach(() => { window.localStorage.clear() })

describe('createAvatarChatStore', () => {
  it('starts from the defaults in an empty browser', () => {
    expect(instance().getSnapshot()).toEqual({
      preferences: {
        schemaVersion: AVATAR_CHAT_SCHEMA_VERSION,
        size: AVATAR_CHAT_SIZE_DEFAULT,
        user: { visible: true, image: null },
        assistant: { visible: true, image: null },
      },
      imageFailure: null,
      saved: true,
    })
  })

  it('adopts a document this browser already stored', () => {
    window.localStorage.setItem(AVATAR_CHAT_STORAGE_KEY, JSON.stringify({
      schemaVersion: AVATAR_CHAT_SCHEMA_VERSION,
      size: 44,
      user: { visible: false, image: DATA_URL },
      assistant: { visible: true, image: null },
    }))

    const state = instance().getSnapshot()

    expect(state.preferences.size).toBe(44)
    expect(state.preferences.user).toEqual({ visible: false, image: DATA_URL })
  })

  it('shows and hides one side without touching the other', () => {
    const store = instance()

    store.actions.setVisible('user', false)
    expect(store.getSnapshot().preferences.user.visible).toBe(false)
    expect(store.getSnapshot().preferences.assistant.visible).toBe(true)

    store.actions.setVisible('assistant', false)
    expect(store.getSnapshot().preferences.assistant.visible).toBe(false)
  })

  it('sets a picture per side and clears the previous failure', () => {
    const store = instance()
    store.actions.noteImageFailure('size')

    store.actions.setImage('assistant', DATA_URL)

    expect(store.getSnapshot().preferences.assistant.image).toBe(DATA_URL)
    expect(store.getSnapshot().preferences.user.image).toBeNull()
    expect(store.getSnapshot().imageFailure).toBeNull()

    store.actions.setImage('user', DATA_URL)
    expect(store.getSnapshot().preferences.user.image).toBe(DATA_URL)
  })

  it('clamps the requested edge into the accepted range', () => {
    const store = instance()

    store.actions.setSize(1000)
    expect(store.getSnapshot().preferences.size).toBe(AVATAR_CHAT_SIZE_MAX)

    store.actions.setSize(1)
    expect(store.getSnapshot().preferences.size).toBe(AVATAR_CHAT_SIZE_MIN)

    store.actions.setSize(30.6)
    expect(store.getSnapshot().preferences.size).toBe(31)
  })

  it('restores every default and clears the failure', () => {
    const store = instance()
    store.actions.setSize(AVATAR_CHAT_SIZE_MAX)
    store.actions.setVisible('user', false)
    store.actions.setImage('assistant', DATA_URL)
    store.actions.noteImageFailure('read')

    store.actions.restoreDefaults()

    expect(store.getSnapshot()).toEqual({
      preferences: {
        schemaVersion: AVATAR_CHAT_SCHEMA_VERSION,
        size: AVATAR_CHAT_SIZE_DEFAULT,
        user: { visible: true, image: null },
        assistant: { visible: true, image: null },
      },
      imageFailure: null,
      saved: true,
    })
  })

  it('records and clears the reason a picture was refused', () => {
    const store = instance()

    store.actions.noteImageFailure('type')
    expect(store.getSnapshot().imageFailure).toBe('type')

    store.actions.noteImageFailure(null)
    expect(store.getSnapshot().imageFailure).toBeNull()
  })

  it('records whether the document reached storage', () => {
    const store = instance()

    store.actions.noteSaved(false)
    expect(store.getSnapshot().saved).toBe(false)

    store.actions.noteSaved(true)
    expect(store.getSnapshot().saved).toBe(true)
  })

  it('notifies subscribers once per change', () => {
    const store = instance()
    const listener = vi.fn()
    const unsubscribe = store.subscribe(listener)

    store.actions.setSize(40)
    expect(listener).toHaveBeenCalledTimes(1)

    unsubscribe()
    store.actions.setSize(42)
    expect(listener).toHaveBeenCalledTimes(1)
  })
})
