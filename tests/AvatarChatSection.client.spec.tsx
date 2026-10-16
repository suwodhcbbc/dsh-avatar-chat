// @vitest-environment jsdom
/**
 * The settings page: both sides are configured independently, the shared edge
 * is one control, and every refusal and storage outcome is announced. The page
 * owns no transcript state, so these cases drive it with a snapshot and spies
 * rather than through the slot framework.
 */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { makeTranslate } from '@deepseek-ai/dsh-client-test-runtime'
import { AvatarChatSection } from '../src/client/AvatarChatSection.tsx'
import type { AvatarChatStoreState } from '../src/client/avatar-chat-store.ts'
import { AVATAR_CHAT_SIZE_DEFAULT, AVATAR_CHAT_SIZE_MAX, AVATAR_CHAT_SIZE_MIN } from '../src/client/avatar-chat-state.ts'
import { zh } from '../src/client/locales.ts'

const t = makeTranslate(zh)
const DATA_URL = 'data:image/png;base64,AAAA'

const actions = {
  setVisible: vi.fn(),
  setImage: vi.fn(),
  setSize: vi.fn(),
  restoreDefaults: vi.fn(),
  noteImageFailure: vi.fn(),
  noteSaved: vi.fn(),
}

const chooseImage = vi.fn()
const applyImageUrl = vi.fn()

/** Render the page over a fixed snapshot. */
function renderSection(state: Partial<AvatarChatStoreState> = {}, injected: Partial<{ storageAvailable: boolean }> = {}) {
  const snapshot: AvatarChatStoreState = {
    preferences: {
      schemaVersion: 1,
      size: AVATAR_CHAT_SIZE_DEFAULT,
      user: { visible: true, image: null },
      assistant: { visible: true, image: null },
    },
    imageFailure: null,
    saved: true,
    ...state,
  }
  const props = {
    t,
    close: () => {},
    actions,
    useStore: <S,>(select: (value: AvatarChatStoreState) => S): S => select(snapshot),
    chooseImage,
    applyImageUrl,
    storageAvailable: true,
    ...injected,
  } as Parameters<typeof AvatarChatSection>[0]
  return render(<AvatarChatSection {...props} />)
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('AvatarChatSection', () => {
  it('presents one card per transcript side', () => {
    renderSection()

    expect(screen.getByText('用户头像')).toBeTruthy()
    expect(screen.getByText('助手头像')).toBeTruthy()
    expect(screen.getAllByRole('switch')).toHaveLength(2)
  })

  it('reports which sides carry a custom picture', () => {
    renderSection({
      preferences: {
        schemaVersion: 1,
        size: AVATAR_CHAT_SIZE_DEFAULT,
        user: { visible: true, image: DATA_URL },
        assistant: { visible: true, image: null },
      },
    })

    expect(screen.getByRole('img', { name: '当前使用自定义图片' })).toBeTruthy()
    expect(screen.getByRole('img', { name: '当前使用默认头像' })).toBeTruthy()
    expect(screen.getByText('更换图片')).toBeTruthy()
    expect(screen.getByText('选择图片')).toBeTruthy()
  })

  it('shows and hides a side through the store', () => {
    renderSection()

    fireEvent.click(screen.getAllByRole('switch')[0]!)

    expect(actions.setVisible).toHaveBeenCalledWith('user', false)
  })

  it('asks the plugin body to open the picker', () => {
    renderSection()

    fireEvent.click(screen.getAllByText('选择图片')[0]!)

    expect(chooseImage).toHaveBeenCalledExactlyOnceWith('user')
  })

  it('offers restoration only once a picture is set', () => {
    renderSection({
      preferences: {
        schemaVersion: 1,
        size: AVATAR_CHAT_SIZE_DEFAULT,
        user: { visible: true, image: null },
        assistant: { visible: true, image: DATA_URL },
      },
    })

    const restore = screen.getAllByText('恢复默认')
    expect((restore[0] as HTMLButtonElement).disabled).toBe(true)
    expect((restore[1] as HTMLButtonElement).disabled).toBe(false)

    fireEvent.click(restore[1]!)

    expect(actions.setImage).toHaveBeenCalledExactlyOnceWith('assistant', null)
  })

  it('applies a typed address once it is not blank', () => {
    renderSection()

    const apply = screen.getAllByText('使用该地址')[0] as HTMLButtonElement
    expect(apply.disabled).toBe(true)

    const fields = screen.getAllByRole('textbox')
    fireEvent.change(fields[0]!, { target: { value: '  https://example.com/avatar.png  ' } })
    expect(apply.disabled).toBe(false)

    fireEvent.click(apply)

    expect(applyImageUrl).toHaveBeenCalledExactlyOnceWith('user', 'https://example.com/avatar.png')
    expect((fields[0] as HTMLInputElement).value).toBe('')
  })

  it('changes the shared edge through the store', () => {
    renderSection()

    fireEvent.change(screen.getByRole('slider'), { target: { value: '44' } })

    expect(actions.setSize).toHaveBeenCalledExactlyOnceWith(44)
    expect(screen.getByRole('slider').getAttribute('min')).toBe(`${AVATAR_CHAT_SIZE_MIN}`)
    expect(screen.getByRole('slider').getAttribute('max')).toBe(`${AVATAR_CHAT_SIZE_MAX}`)
  })

  it('shows the current edge', () => {
    renderSection({
      preferences: {
        schemaVersion: 1,
        size: 44,
        user: { visible: true, image: null },
        assistant: { visible: true, image: null },
      },
    })

    expect(screen.getByText('44 像素')).toBeTruthy()
  })

  it.each([
    ['type', '仅支持 PNG、JPEG、WebP 或 GIF 图片。'],
    ['size', '图片过大，请选择 5 MiB 以内的图片。'],
    ['read', '无法读取该图片，请重新选择。'],
    ['unsupported', '该文件不是可用的图片。'],
  ] as const)('explains a %s refusal', (imageFailure, copy) => {
    renderSection({ imageFailure })

    expect(screen.getByRole('alert').textContent).toBe(copy)
  })

  it('stays quiet when nothing was refused', () => {
    renderSection()

    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('says when this browser blocks storage', () => {
    renderSection({}, { storageAvailable: false })

    expect(screen.getByRole('status').textContent).toBe('此浏览器禁止本机存储，头像设置无法保存。')
  })

  it('says when the change could not be saved', () => {
    renderSection({ saved: false })

    expect(screen.getByRole('status').textContent).toBe('头像设置未能保存到本机存储。')
  })

  it('stays quiet while the document is saved', () => {
    renderSection()

    expect(screen.queryByRole('status')).toBeNull()
  })
})
