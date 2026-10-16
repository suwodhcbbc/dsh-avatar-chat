/**
 * Avatar Chat preferences shared by the settings page and the page-level
 * decoration.
 *
 * One handle owns the whole feature state: the settings component reads it
 * through the store seat and mutates it through these actions, and the plugin
 * body subscribes once to persist the document and repaint the document root.
 * That keeps the write and the repaint out of the render path and in one place.
 */
import { type EngineStoreHandle } from '@deepseek-ai/dsh-client-store';
import type { AvatarChatImageFailure } from './avatar-chat-image.ts';
import { type AvatarChatPreferences, type AvatarChatSide } from './avatar-chat-state.ts';
/** Live state of the Avatar Chat feature. */
export interface AvatarChatStoreState {
    /** The active preferences. */
    preferences: AvatarChatPreferences;
    /** Why the last picked picture was refused, or `null` when none was. */
    imageFailure: AvatarChatImageFailure | null;
    /** Whether the most recent document change reached device storage. */
    saved: boolean;
}
/**
 * The complete write set for {@link AvatarChatStoreState}.
 *
 * A type alias rather than an interface: the store engine constrains this
 * declaration by an index signature, which only type aliases satisfy.
 */
type AvatarChatStoreActions = {
    /** @param draft - live state. @param side - which avatar. @param visible - whether to paint it. */
    setVisible(draft: AvatarChatStoreState, side: AvatarChatSide, visible: boolean): void;
    /** @param draft - live state. @param side - which avatar. @param image - picture reference, or `null` for the built-in art. */
    setImage(draft: AvatarChatStoreState, side: AvatarChatSide, image: string | null): void;
    /** @param draft - live state. @param size - requested edge in CSS pixels; clamped to the accepted range. */
    setSize(draft: AvatarChatStoreState, size: number): void;
    /** @param draft - live state. */
    restoreDefaults(draft: AvatarChatStoreState): void;
    /** @param draft - live state. @param reason - refusal to report, or `null` to clear it. */
    noteImageFailure(draft: AvatarChatStoreState, reason: AvatarChatImageFailure | null): void;
    /** @param draft - live state. @param saved - whether the document reached device storage. */
    noteSaved(draft: AvatarChatStoreState, saved: boolean): void;
};
/**
 * Declare the Avatar Chat store.
 * @returns the handle for the feature's preferences and actions.
 */
export declare function createAvatarChatStore(): EngineStoreHandle<AvatarChatStoreState, AvatarChatStoreActions>;
export {};
//# sourceMappingURL=avatar-chat-store.d.ts.map