/**
 * Project the Avatar Chat preferences onto the document root.
 *
 * The transcript owns no slot inside a message row, so the decoration is a
 * package-owned stylesheet keyed off these root attributes and custom
 * properties. Applying is idempotent — every field is set or removed outright —
 * which is what keeps a repeated activation from stacking a second decoration.
 */
import type { AvatarChatPreferences } from './avatar-chat-state.ts';
/** Presence marker on the document root; the injected stylesheet keys off it. */
export declare const AVATAR_CHAT_ROOT_ATTRIBUTE = "data-dsh-avatar-chat";
/** Root flag enabling the user side; `on` or `off`. */
export declare const AVATAR_CHAT_USER_ATTRIBUTE = "data-dsh-avatar-chat-user";
/** Root flag marking a configured user picture; present or absent. */
export declare const AVATAR_CHAT_USER_IMAGE_ATTRIBUTE = "data-dsh-avatar-chat-user-image";
/** Root flag enabling the assistant side; `on` or `off`. */
export declare const AVATAR_CHAT_ASSISTANT_ATTRIBUTE = "data-dsh-avatar-chat-assistant";
/** Root flag marking a configured assistant picture; present or absent. */
export declare const AVATAR_CHAT_ASSISTANT_IMAGE_ATTRIBUTE = "data-dsh-avatar-chat-assistant-image";
/** Custom property carrying the avatar edge. */
export declare const AVATAR_CHAT_SIZE_VARIABLE = "--dsh-avatar-chat-size";
/** Custom property carrying the user picture. */
export declare const AVATAR_CHAT_USER_IMAGE_VARIABLE = "--dsh-avatar-chat-user-image";
/** Custom property carrying the assistant picture. */
export declare const AVATAR_CHAT_ASSISTANT_IMAGE_VARIABLE = "--dsh-avatar-chat-assistant-image";
/**
 * Apply the preferences to a root element.
 * @param root - the element that carries the decoration, normally `document.documentElement`.
 * @param preferences - the active preferences.
 */
export declare function applyAvatarChatStyle(root: HTMLElement, preferences: AvatarChatPreferences): void;
/**
 * Remove every trace of the decoration from a root element.
 * @param root - the element that carries the decoration.
 */
export declare function clearAvatarChatStyle(root: HTMLElement): void;
//# sourceMappingURL=avatar-chat-style.d.ts.map