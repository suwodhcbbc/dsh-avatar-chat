/** Presence marker on the document root; the injected stylesheet keys off it. */
export const AVATAR_CHAT_ROOT_ATTRIBUTE = 'data-dsh-avatar-chat';
/** Root flag enabling the user side; `on` or `off`. */
export const AVATAR_CHAT_USER_ATTRIBUTE = 'data-dsh-avatar-chat-user';
/** Root flag marking a configured user picture; present or absent. */
export const AVATAR_CHAT_USER_IMAGE_ATTRIBUTE = 'data-dsh-avatar-chat-user-image';
/** Root flag enabling the assistant side; `on` or `off`. */
export const AVATAR_CHAT_ASSISTANT_ATTRIBUTE = 'data-dsh-avatar-chat-assistant';
/** Root flag marking a configured assistant picture; present or absent. */
export const AVATAR_CHAT_ASSISTANT_IMAGE_ATTRIBUTE = 'data-dsh-avatar-chat-assistant-image';
/** Custom property carrying the avatar edge. */
export const AVATAR_CHAT_SIZE_VARIABLE = '--dsh-avatar-chat-size';
/** Custom property carrying the user picture. */
export const AVATAR_CHAT_USER_IMAGE_VARIABLE = '--dsh-avatar-chat-user-image';
/** Custom property carrying the assistant picture. */
export const AVATAR_CHAT_ASSISTANT_IMAGE_VARIABLE = '--dsh-avatar-chat-assistant-image';
/**
 * Apply the preferences to a root element.
 * @param root - the element that carries the decoration, normally `document.documentElement`.
 * @param preferences - the active preferences.
 */
export function applyAvatarChatStyle(root, preferences) {
    setSide(root, AVATAR_CHAT_USER_ATTRIBUTE, AVATAR_CHAT_USER_IMAGE_ATTRIBUTE, AVATAR_CHAT_USER_IMAGE_VARIABLE, preferences.user);
    setSide(root, AVATAR_CHAT_ASSISTANT_ATTRIBUTE, AVATAR_CHAT_ASSISTANT_IMAGE_ATTRIBUTE, AVATAR_CHAT_ASSISTANT_IMAGE_VARIABLE, preferences.assistant);
    root.style.setProperty(AVATAR_CHAT_SIZE_VARIABLE, `${preferences.size}px`);
    root.setAttribute(AVATAR_CHAT_ROOT_ATTRIBUTE, '');
}
/**
 * Remove every trace of the decoration from a root element.
 * @param root - the element that carries the decoration.
 */
export function clearAvatarChatStyle(root) {
    for (const attribute of [
        AVATAR_CHAT_ROOT_ATTRIBUTE,
        AVATAR_CHAT_USER_ATTRIBUTE,
        AVATAR_CHAT_USER_IMAGE_ATTRIBUTE,
        AVATAR_CHAT_ASSISTANT_ATTRIBUTE,
        AVATAR_CHAT_ASSISTANT_IMAGE_ATTRIBUTE,
    ]) {
        root.removeAttribute(attribute);
    }
    for (const variable of [
        AVATAR_CHAT_SIZE_VARIABLE,
        AVATAR_CHAT_USER_IMAGE_VARIABLE,
        AVATAR_CHAT_ASSISTANT_IMAGE_VARIABLE,
    ]) {
        root.style.removeProperty(variable);
    }
}
/** Write one side's flag and picture, removing both when the side has no picture. */
function setSide(root, flag, imageFlag, variable, side) {
    root.setAttribute(flag, side.visible ? 'on' : 'off');
    if (side.image === null) {
        root.removeAttribute(imageFlag);
        root.style.removeProperty(variable);
        return;
    }
    root.setAttribute(imageFlag, 'set');
    root.style.setProperty(variable, `url("${side.image}")`);
}
//# sourceMappingURL=avatar-chat-style.js.map