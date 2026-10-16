/**
 * Avatar Chat settings page: one card per transcript side plus the shared size.
 *
 * The page owns no transcript state of its own. It reads the store seat, calls
 * the declared actions for every change, and asks the injected face only for the
 * two gestures the component cannot perform itself (opening a file picker and
 * reading a picture back). The preview disc reads the same root variables the
 * page-level sheet paints from, so what shows here is what the transcript shows.
 */
import { useId, useState, type ReactNode } from 'react'
import { Button, Switch } from '@deepseek-ai/dsh-client-ui-primitives'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { PropsStore } from '@deepseek-ai/dsh-client-store'
import type { AvatarChatImageFailure } from './avatar-chat-image.ts'
import {
  AVATAR_CHAT_SIZE_MAX,
  AVATAR_CHAT_SIZE_MIN,
  type AvatarChatSide,
} from './avatar-chat-state.ts'
import type { createAvatarChatStore } from './avatar-chat-store.ts'
import type { AvatarChatLocaleKey } from './locales.ts'
import css from './AvatarChatSection.module.css'

/** Both transcript sides, in the order the page presents them. */
const SIDES: readonly AvatarChatSide[] = ['user', 'assistant']

/** Localized explanation for each way a picked picture can be refused. */
const FAILURE_COPY: Record<AvatarChatImageFailure, AvatarChatLocaleKey> = {
  type: 'failure-type',
  size: 'failure-size',
  read: 'failure-read',
  unsupported: 'failure-unsupported',
}

/** Gestures the settings page hands to the plugin body. */
export interface AvatarChatSectionInjected {
  /** @param side - which avatar the picked file replaces. */
  readonly chooseImage: (side: AvatarChatSide) => void
  /** @param side - which avatar to change. @param url - the address the user typed. */
  readonly applyImageUrl: (side: AvatarChatSide, url: string) => void
  /** Whether this browser allowed the preferences to be stored. */
  readonly storageAvailable: boolean
}

/** Props of the Avatar Chat settings page. */
export type AvatarChatSectionProps = PropsRuntime<'settings.section'>
  & PropsLocale<'avatarChat'>
  & PropsStore<ReturnType<typeof createAvatarChatStore>>
  & InjectFace<AvatarChatSectionInjected>

/**
 * Render the Avatar Chat settings page.
 * @param props - derived runtime, locale, store, and injected shares.
 * @returns the settings page for this feature.
 */
export function AvatarChatSection({
  t,
  actions,
  useStore,
  chooseImage,
  applyImageUrl,
  storageAvailable,
}: AvatarChatSectionProps): ReactNode {
  const preferences = useStore(state => state.preferences)
  const imageFailure = useStore(state => state.imageFailure)
  const saved = useStore(state => state.saved)
  const [address, setAddress] = useState<Record<AvatarChatSide, string>>({ user: '', assistant: '' })
  const sizeId = useId()

  const renderSide = (side: AvatarChatSide): ReactNode => {
    const current = side === 'user' ? preferences.user : preferences.assistant
    const title = side === 'user' ? t('user-title') : t('assistant-title')
    const addressId = `${sizeId}-${side}-address`
    return (
      <section key={side} className={css.card}>
        <header className={css.cardHead}>
          <span
            className={css.preview}
            data-side={side}
            role="img"
            aria-label={current.image === null ? t('side-builtin') : t('side-custom')}
          />
          <span className={css.cardTitle}>{title}</span>
          <Switch
            checked={current.visible}
            onChange={(next) => { actions.setVisible(side, next) }}
            label={t('toggle-label', { side: title })}
          />
        </header>
        <div className={css.actions}>
          <Button variant="outline" size="sm" onClick={() => { chooseImage(side) }}>
            {current.image === null ? t('choose') : t('replace')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={current.image === null}
            onClick={() => { actions.setImage(side, null) }}
          >
            {t('reset')}
          </Button>
        </div>
        <div className={css.urlRow}>
          <span className={css.urlLabel} id={addressId}>{t('url-label-full', { side: title })}</span>
          <input
            className={css.urlInput}
            type="url"
            inputMode="url"
            aria-labelledby={addressId}
            placeholder={t('url-placeholder')}
            value={address[side]}
            onChange={(event) => {
              const next = event.currentTarget.value
              setAddress(previous => ({ ...previous, [side]: next }))
            }}
          />
          <Button
            variant="outline"
            size="sm"
            disabled={address[side].trim() === ''}
            onClick={() => {
              applyImageUrl(side, address[side].trim())
              setAddress(previous => ({ ...previous, [side]: '' }))
            }}
          >
            {t('url-apply')}
          </Button>
        </div>
      </section>
    )
  }

  return (
    <div className={css.section}>
      <div>
        <h2 className={css.heading}>{t('title')}</h2>
        <p className={css.intro}>{t('intro')}</p>
      </div>
      {!storageAvailable && <p className={css.notice} role="status">{t('storage-unavailable')}</p>}
      {storageAvailable && !saved && <p className={css.notice} role="status">{t('save-failed')}</p>}
      {imageFailure !== null && <p className={css.warning} role="alert">{t(FAILURE_COPY[imageFailure])}</p>}
      <div className={css.sides}>{SIDES.map(renderSide)}</div>
      <div className={css.sizeRow}>
        <label className={css.sizeLabel} htmlFor={sizeId}>{t('size-label')}</label>
        <input
          id={sizeId}
          className={css.range}
          type="range"
          min={AVATAR_CHAT_SIZE_MIN}
          max={AVATAR_CHAT_SIZE_MAX}
          step={2}
          value={preferences.size}
          onChange={(event) => { actions.setSize(Number(event.currentTarget.value)) }}
        />
        <span className={css.sizeValue}>{t('size-value', { size: preferences.size })}</span>
      </div>
    </div>
  )
}
