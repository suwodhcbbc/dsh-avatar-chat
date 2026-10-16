// @vitest-environment jsdom
/**
 * Browser-half wiring: the dictionaries reach the locale service, the settings
 * page reaches its seat, the document root carries the decoration, and the
 * store subscriber is the only writer to storage and the only painter. These
 * cases run the real activation, including the rejection paths the settings
 * page renders its notices from.
 */
import { Context } from '@deepseek-ai/cordis'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SlotRegistry } from '@deepseek-ai/dsh-client-ui-renderer/client'
import { resolveSlotLabel } from '@deepseek-ai/dsh-client-ui-slots'
import { LocaleRuntime } from '@deepseek-ai/dsh-client-locale/client'
import { apply as applyPlugin, inject as pluginInject } from '../src/client/index.ts'
import { AvatarChatSection, type AvatarChatSectionInjected } from '../src/client/AvatarChatSection.tsx'
import type { createAvatarChatStore } from '../src/client/avatar-chat-store.ts'
import {
  AVATAR_CHAT_ROOT_ATTRIBUTE,
  AVATAR_CHAT_SIZE_VARIABLE,
  AVATAR_CHAT_USER_IMAGE_VARIABLE,
} from '../src/client/avatar-chat-style.ts'
import { AVATAR_CHAT_STORAGE_KEY } from '../src/client/avatar-chat-storage.ts'
import { AVATAR_CHAT_SCHEMA_VERSION, AVATAR_CHAT_SIZE_DEFAULT } from '../src/client/avatar-chat-state.ts'

const SLOT = 'settings.section'

type Store = ReturnType<typeof createAvatarChatStore>

/**
 * Activate the feature the way the loader does: the slot registry declares the
 * seat from root, then the plugin claims its page and decorates the document.
 */
async function bench() {
  const ctx = new Context()
  await ctx.plugin(SlotRegistry).await()
  const locale = new LocaleRuntime(ctx)
  locale.setLocale('zh')
  ctx.provide('locale', locale)
  const slots = ctx.get('slots') as SlotRegistry
  slots.register(
    { name: 'root', children: { [SLOT]: { kind: 'list', scope: 'root' } } } as never,
    () => null,
  )
  await ctx.plugin({ inject: [...pluginInject], apply: applyPlugin }).await()
  const entry = slots.entries(SLOT).find(candidate => candidate.component === AvatarChatSection)!
  // The registered handle hands out the one instance the plugin body subscribed
  // to, so driving it here is exactly what the settings page does.
  const instance = (entry.store as Store).create()
  const face = (entry.inject as NonNullable<typeof entry.inject> & (() => AvatarChatSectionInjected))()
  return { ctx, slots, locale, instance, face, entry }
}

/** Capture the picker the plugin body creates, since it is never attached. */
function spyOnPicker(): HTMLInputElement[] {
  const created: HTMLInputElement[] = []
  vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(function (this: HTMLInputElement) {
    created.push(this)
  })
  return created
}

/** A picture the browser confirms after the address is typed. */
function stubImage(kind: 'load' | 'error'): void {
  class ProbedImage {
    onload: (() => void) | null = null
    onerror: (() => void) | null = null
    set src(_value: string) {
      queueMicrotask(() => { if (kind === 'load') this.onload?.(); else this.onerror?.() })
    }
  }
  vi.stubGlobal('Image', ProbedImage)
}

afterEach(() => {
  window.localStorage.clear()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('ui-avatar-chat apply', () => {
  it('claims its settings page and registers both dictionaries', async () => {
    const { ctx, locale, entry } = await bench()

    expect(entry.component).toBe(AvatarChatSection)
    expect(locale.bind('avatarChat')('title')).toBe('头像对话')
    expect(resolveSlotLabel(entry.options.label)).toBe('头像对话')

    await ctx.fiber.dispose()
  })

  it('decorates the document root as soon as it activates', async () => {
    const { ctx } = await bench()

    expect(document.documentElement.getAttribute(AVATAR_CHAT_ROOT_ATTRIBUTE)).toBe('')
    expect(document.documentElement.style.getPropertyValue(AVATAR_CHAT_SIZE_VARIABLE))
      .toBe(`${AVATAR_CHAT_SIZE_DEFAULT}px`)

    await ctx.fiber.dispose()
  })

  it('persists a change and repaints the root from the same snapshot', async () => {
    const { ctx, instance } = await bench()

    instance.actions.setSize(40)

    expect(document.documentElement.style.getPropertyValue(AVATAR_CHAT_SIZE_VARIABLE)).toBe('40px')
    expect(JSON.parse(window.localStorage.getItem(AVATAR_CHAT_STORAGE_KEY) ?? '{}'))
      .toMatchObject({ schemaVersion: AVATAR_CHAT_SCHEMA_VERSION, size: 40 })

    await ctx.fiber.dispose()
  })

  it('reports a refused write without dropping the change', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota') })
    const { ctx, instance } = await bench()

    expect(instance.getSnapshot().saved).toBe(false)
    expect(instance.getSnapshot().preferences.size).toBe(AVATAR_CHAT_SIZE_DEFAULT)

    await ctx.fiber.dispose()
  })

  it('removes the whole decoration when the plugin is disposed', async () => {
    const { ctx } = await bench()

    await ctx.fiber.dispose()

    expect(document.documentElement.hasAttribute(AVATAR_CHAT_ROOT_ATTRIBUTE)).toBe(false)
    expect(document.documentElement.style.getPropertyValue(AVATAR_CHAT_SIZE_VARIABLE)).toBe('')
  })

  it('adopts a picture the user picked', async () => {
    const created = spyOnPicker()
    const { ctx, instance, face } = await bench()

    face.chooseImage('user')
    const input = created.at(-1)!
    Object.defineProperty(input, 'files', {
      configurable: true,
      value: [new File(['x'], 'avatar.png', { type: 'image/png' })],
    })
    input.dispatchEvent(new Event('change'))

    await vi.waitFor(() => { expect(instance.getSnapshot().preferences.user.image).not.toBeNull() })
    expect(document.documentElement.style.getPropertyValue(AVATAR_CHAT_USER_IMAGE_VARIABLE))
      .toContain('data:image/png;base64,')

    await ctx.fiber.dispose()
  })

  it('leaves the avatar alone when the picker is cancelled', async () => {
    const created = spyOnPicker()
    const { ctx, instance, face } = await bench()

    face.chooseImage('assistant')
    created.at(-1)!.dispatchEvent(new Event('change'))

    expect(instance.getSnapshot().preferences.assistant.image).toBeNull()
    expect(instance.getSnapshot().imageFailure).toBeNull()

    await ctx.fiber.dispose()
  })

  it('names the reason a picked file was refused', async () => {
    const created = spyOnPicker()
    const { ctx, instance, face } = await bench()

    face.chooseImage('user')
    const input = created.at(-1)!
    Object.defineProperty(input, 'files', {
      configurable: true,
      value: [new File(['x'], 'notes.txt', { type: 'text/plain' })],
    })
    input.dispatchEvent(new Event('change'))

    await vi.waitFor(() => { expect(instance.getSnapshot().imageFailure).toBe('type') })

    await ctx.fiber.dispose()
  })

  it('adopts an address the browser confirms', async () => {
    stubImage('load')
    const { ctx, instance, face } = await bench()

    face.applyImageUrl('assistant', 'https://example.com/avatar.png')

    await vi.waitFor(() => {
      expect(instance.getSnapshot().preferences.assistant.image).toBe('https://example.com/avatar.png')
    })

    await ctx.fiber.dispose()
  })

  it('refuses an address that is not a picture source', async () => {
    const { ctx, instance, face } = await bench()

    face.applyImageUrl('assistant', 'avatar.png')

    expect(instance.getSnapshot().imageFailure).toBe('unsupported')

    await ctx.fiber.dispose()
  })

  it('names an address the browser cannot load', async () => {
    stubImage('error')
    const { ctx, instance, face } = await bench()

    face.applyImageUrl('user', 'https://example.com/missing.png')

    await vi.waitFor(() => { expect(instance.getSnapshot().imageFailure).toBe('read') })

    await ctx.fiber.dispose()
  })

  it('tells the settings page whether this browser can store the preferences', async () => {
    const { ctx, face } = await bench()

    expect(face.storageAvailable).toBe(true)

    await ctx.fiber.dispose()
  })
})
