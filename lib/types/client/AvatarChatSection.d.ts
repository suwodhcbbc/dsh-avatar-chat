/**
 * Avatar Chat settings page: one card per transcript side plus the shared size.
 *
 * The page owns no transcript state of its own. It reads the store seat, calls
 * the declared actions for every change, and asks the injected face only for the
 * two gestures the component cannot perform itself (opening a file picker and
 * reading a picture back). The preview disc reads the same root variables the
 * page-level sheet paints from, so what shows here is what the transcript shows.
 */
import { type ReactNode } from 'react';
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { PropsStore } from '@deepseek-ai/dsh-client-store';
import { type AvatarChatSide } from './avatar-chat-state.ts';
import type { createAvatarChatStore } from './avatar-chat-store.ts';
/** Gestures the settings page hands to the plugin body. */
export interface AvatarChatSectionInjected {
    /** @param side - which avatar the picked file replaces. */
    readonly chooseImage: (side: AvatarChatSide) => void;
    /** @param side - which avatar to change. @param url - the address the user typed. */
    readonly applyImageUrl: (side: AvatarChatSide, url: string) => void;
    /** Whether this browser allowed the preferences to be stored. */
    readonly storageAvailable: boolean;
}
/** Props of the Avatar Chat settings page. */
export type AvatarChatSectionProps = PropsRuntime<'settings.section'> & PropsLocale<'avatarChat'> & PropsStore<ReturnType<typeof createAvatarChatStore>> & InjectFace<AvatarChatSectionInjected>;
/**
 * Render the Avatar Chat settings page.
 * @param props - derived runtime, locale, store, and injected shares.
 * @returns the settings page for this feature.
 */
export declare function AvatarChatSection({ t, actions, useStore, chooseImage, applyImageUrl, storageAvailable, }: AvatarChatSectionProps): ReactNode;
//# sourceMappingURL=AvatarChatSection.d.ts.map