import './avatar-chat.css';
import { AVATAR_CHAT_FILE_TYPES, browserAvatarChatImageEnvironment, readAvatarChatImage, } from "./avatar-chat-image.js";
import { avatarChatImage } from "./avatar-chat-state.js";
import { createAvatarChatStore } from "./avatar-chat-store.js";
import { applyAvatarChatStyle, clearAvatarChatStyle, } from "./avatar-chat-style.js";
import { avatarChatStorage, writeAvatarChatPreferences, } from "./avatar-chat-storage.js";
import { AvatarChatSection } from "./AvatarChatSection.js";
import { en, zh } from "./locales.js";
/** Locale namespace this plugin owns. */
const NAMESPACE = 'avatarChat';
/**
 * Services this plugin needs before it activates: the dictionary registry and
 * the slot registry. Both are hard dependencies — without them the page would
 * render untranslated copy into a seat that does not exist.
 */
export const inject = ['locale', 'slots'];
/**
 * Install the Avatar Chat settings page and the transcript decoration.
 * @param ctx - the browser-half context this plugin runs on.
 */
export function apply(ctx) {
    ctx.effect(() => ctx.locale.register(NAMESPACE, { zh, en }), 'avatar-chat: dictionaries');
    const t = ctx.locale.bind(NAMESPACE);
    // One shared handle: the settings page reads through the store seat and the
    // subscriber below owns every side effect the state implies.
    const handle = createAvatarChatStore();
    const instance = handle.create();
    const store = { ...handle, create: () => instance };
    const storage = avatarChatStorage();
    const storageAvailable = storage !== null;
    ctx.effect(() => {
        const root = document.documentElement;
        return () => { clearAvatarChatStyle(root); };
    }, 'avatar-chat: decoration lifetime');
    ctx.effect(() => {
        const sync = (state) => {
            applyAvatarChatStyle(document.documentElement, state.preferences);
            const written = writeAvatarChatPreferences(storage, state.preferences);
            const saved = written.status === 'stored';
            if (state.saved !== saved)
                instance.actions.noteSaved(saved);
        };
        sync(instance.getSnapshot());
        return instance.subscribe(() => { sync(instance.getSnapshot()); });
    }, 'avatar-chat: persist and repaint');
    /** Report one picked file, keeping the refused reason for the settings page. */
    const acceptPicked = async (side, file) => {
        const result = await readAvatarChatImage(file, browserAvatarChatImageEnvironment());
        if (result.status === 'ready')
            instance.actions.setImage(side, result.image);
        else
            instance.actions.noteImageFailure(result.reason);
    };
    /** Open the browser's picker; a cancelled pick leaves the current avatar alone. */
    const chooseImage = (side) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = AVATAR_CHAT_FILE_TYPES.join(',');
        input.addEventListener('change', () => {
            const file = input.files?.[0];
            if (file !== undefined)
                void acceptPicked(side, file);
        }, { once: true });
        input.click();
    };
    /** Adopt a typed address once the browser confirms it resolves to a picture. */
    const applyImageUrl = (side, url) => {
        const accepted = avatarChatImage(url);
        if (accepted === null) {
            instance.actions.noteImageFailure('unsupported');
            return;
        }
        const probe = new Image();
        probe.onload = () => { instance.actions.setImage(side, accepted); };
        probe.onerror = () => { instance.actions.noteImageFailure('read'); };
        probe.src = accepted;
    };
    const injected = () => ({ chooseImage, applyImageUrl, storageAvailable });
    ctx.slots.inject('settings.section', () => ctx.slots.register({
        name: 'settings.section',
        id: 'avatar-chat',
        order: 16,
        label: () => t('nav'),
        locale: NAMESPACE,
        store,
        inject: injected,
    }, AvatarChatSection));
}
//# sourceMappingURL=index.js.map