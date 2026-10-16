/**
 * Avatar Chat preferences shared by the settings page and the page-level
 * decoration.
 *
 * One handle owns the whole feature state: the settings component reads it
 * through the store seat and mutates it through these actions, and the plugin
 * body subscribes once to persist the document and repaint the document root.
 * That keeps the write and the repaint out of the render path and in one place.
 */
import { defineStore, type EngineStoreHandle } from '@deepseek-ai/dsh-client-store'
import type { AvatarChatImageFailure } from './avatar-chat-image.ts'
import {
  AVATAR_CHAT_SIZE_MAX,
  AVATAR_CHAT_SIZE_MIN,
  defaultAvatarChatPreferences,
  type AvatarChatPreferences,
  type AvatarChatSide,
  type AvatarChatSidePreferences,
} from './avatar-chat-state.ts'
import { avatarChatStorage, readAvatarChatPreferences } from './avatar-chat-storage.ts'

/** Live state of the Avatar Chat feature. */
export interface AvatarChatStoreState {
  /** The active preferences. */
  preferences: AvatarChatPreferences
  /** Why the last picked picture was refused, or `null` when none was. */
  imageFailure: AvatarChatImageFailure | null
  /** Whether the most recent document change reached device storage. */
  saved: boolean
}

/**
 * The complete write set for {@link AvatarChatStoreState}.
 *
 * A type alias rather than an interface: the store engine constrains this
 * declaration by an index signature, which only type aliases satisfy.
 */
type AvatarChatStoreActions = {
  /** @param draft - live state. @param side - which avatar. @param visible - whether to paint it. */
  setVisible(draft: AvatarChatStoreState, side: AvatarChatSide, visible: boolean): void
  /** @param draft - live state. @param side - which avatar. @param image - picture reference, or `null` for the built-in art. */
  setImage(draft: AvatarChatStoreState, side: AvatarChatSide, image: string | null): void
  /** @param draft - live state. @param size - requested edge in CSS pixels; clamped to the accepted range. */
  setSize(draft: AvatarChatStoreState, size: number): void
  /** @param draft - live state. */
  restoreDefaults(draft: AvatarChatStoreState): void
  /** @param draft - live state. @param reason - refusal to report, or `null` to clear it. */
  noteImageFailure(draft: AvatarChatStoreState, reason: AvatarChatImageFailure | null): void
  /** @param draft - live state. @param saved - whether the document reached device storage. */
  noteSaved(draft: AvatarChatStoreState, saved: boolean): void
}

/** Read one side's sub-document. */
function sideOf(preferences: AvatarChatPreferences, side: AvatarChatSide): AvatarChatSidePreferences {
  return side === 'user' ? preferences.user : preferences.assistant
}

/** Replace one side's sub-document, leaving the other untouched. */
function withSide(
  preferences: AvatarChatPreferences,
  side: AvatarChatSide,
  next: AvatarChatSidePreferences,
): AvatarChatPreferences {
  return side === 'user' ? { ...preferences, user: next } : { ...preferences, assistant: next }
}

/**
 * Declare the Avatar Chat store.
 * @returns the handle for the feature's preferences and actions.
 */
export function createAvatarChatStore(): EngineStoreHandle<AvatarChatStoreState, AvatarChatStoreActions> {
  return defineStore({
    init: (): AvatarChatStoreState => ({
      // The first instance adopts whatever this browser already stored; a
      // damaged document is repaired here and rewritten by the subscriber that
      // the plugin body installs when it activates the feature.
      preferences: readAvatarChatPreferences(avatarChatStorage()).preferences,
      imageFailure: null,
      saved: true,
    }),
    actions: {
      setVisible: (d, side, visible) => {
        d.preferences = withSide(d.preferences, side, { ...sideOf(d.preferences, side), visible })
      },
      setImage: (d, side, image) => {
        d.preferences = withSide(d.preferences, side, { ...sideOf(d.preferences, side), image })
        d.imageFailure = null
      },
      setSize: (d, size) => {
        const clamped = Math.min(AVATAR_CHAT_SIZE_MAX, Math.max(AVATAR_CHAT_SIZE_MIN, Math.round(size)))
        d.preferences = { ...d.preferences, size: clamped }
      },
      restoreDefaults: (d) => {
        d.preferences = defaultAvatarChatPreferences()
        d.imageFailure = null
      },
      noteImageFailure: (d, reason) => { d.imageFailure = reason },
      noteSaved: (d, saved) => { d.saved = saved },
    },
  })
}
