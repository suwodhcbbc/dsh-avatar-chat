// @vitest-environment jsdom
/**
 * Root decoration: the stylesheet keys off these attributes and custom
 * properties, so applying them twice must leave exactly the same document as
 * applying them once — that idempotence is what stops a repeated activation
 * from stacking a second avatar.
 */
import { describe, expect, it } from 'vitest'
import {
  AVATAR_CHAT_ASSISTANT_ATTRIBUTE,
  AVATAR_CHAT_ASSISTANT_IMAGE_ATTRIBUTE,
  AVATAR_CHAT_ASSISTANT_IMAGE_VARIABLE,
  AVATAR_CHAT_ROOT_ATTRIBUTE,
  AVATAR_CHAT_SIZE_VARIABLE,
  AVATAR_CHAT_USER_ATTRIBUTE,
  AVATAR_CHAT_USER_IMAGE_ATTRIBUTE,
  AVATAR_CHAT_USER_IMAGE_VARIABLE,
  applyAvatarChatStyle,
  clearAvatarChatStyle,
} from '../src/client/avatar-chat-style.ts'
import { defaultAvatarChatPreferences, type AvatarChatPreferences } from '../src/client/avatar-chat-state.ts'

const DATA_URL = 'data:image/png;base64,AAAA'

/** Preferences with the user picture set and the assistant side hidden. */
function preferences(): AvatarChatPreferences {
  return {
    ...defaultAvatarChatPreferences(),
    size: 40,
    user: { visible: true, image: DATA_URL },
    assistant: { visible: false, image: null },
  }
}

describe('applyAvatarChatStyle', () => {
  it('writes both sides, the edge, and the presence marker', () => {
    const root = document.createElement('div')

    applyAvatarChatStyle(root, preferences())

    expect(root.getAttribute(AVATAR_CHAT_ROOT_ATTRIBUTE)).toBe('')
    expect(root.getAttribute(AVATAR_CHAT_USER_ATTRIBUTE)).toBe('on')
    expect(root.getAttribute(AVATAR_CHAT_ASSISTANT_ATTRIBUTE)).toBe('off')
    expect(root.getAttribute(AVATAR_CHAT_USER_IMAGE_ATTRIBUTE)).toBe('set')
    expect(root.getAttribute(AVATAR_CHAT_ASSISTANT_IMAGE_ATTRIBUTE)).toBeNull()
    expect(root.style.getPropertyValue(AVATAR_CHAT_SIZE_VARIABLE)).toBe('40px')
    expect(root.style.getPropertyValue(AVATAR_CHAT_USER_IMAGE_VARIABLE)).toBe(`url("${DATA_URL}")`)
    expect(root.style.getPropertyValue(AVATAR_CHAT_ASSISTANT_IMAGE_VARIABLE)).toBe('')
  })

  it('clears a picture that has just been removed', () => {
    const root = document.createElement('div')
    applyAvatarChatStyle(root, preferences())

    applyAvatarChatStyle(root, defaultAvatarChatPreferences())

    expect(root.getAttribute(AVATAR_CHAT_USER_IMAGE_ATTRIBUTE)).toBeNull()
    expect(root.style.getPropertyValue(AVATAR_CHAT_USER_IMAGE_VARIABLE)).toBe('')
  })

  it('leaves the same document behind when applied twice', () => {
    const once = document.createElement('div')
    const twice = document.createElement('div')

    applyAvatarChatStyle(once, preferences())
    applyAvatarChatStyle(twice, preferences())
    applyAvatarChatStyle(twice, preferences())

    expect(twice.outerHTML).toBe(once.outerHTML)
  })
})

describe('clearAvatarChatStyle', () => {
  it('removes every attribute and variable it wrote', () => {
    const root = document.createElement('div')
    applyAvatarChatStyle(root, preferences())

    clearAvatarChatStyle(root)

    expect(root.attributes).toHaveLength(1)
    expect(root.hasAttribute(AVATAR_CHAT_ROOT_ATTRIBUTE)).toBe(false)
    expect(root.getAttribute('style')).toBe('')
  })

  it('is harmless on a root that was never decorated', () => {
    const root = document.createElement('div')

    expect(() => { clearAvatarChatStyle(root) }).not.toThrow()
    expect(root.outerHTML).toBe('<div></div>')
  })
})
