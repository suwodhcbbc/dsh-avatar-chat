/**
 * Avatar Chat — a device-local pair of transcript avatars.
 *
 * The transcript exposes no slot inside a message row and every host class name
 * is a CSS-Modules hash, so this plugin decorates from the outside: a
 * package-owned stylesheet (`avatar-chat.css`, inlined by the client bundler)
 * keyed off the stable `data-chat-flow-kind` attribute each row already emits,
 * driven by flags and picture variables this plugin writes onto the document
 * root. Nothing in the React tree is replaced, wrapped, or re-rendered.
 */
import type { Context } from '@deepseek-ai/cordis';
import './avatar-chat.css';
/**
 * Services this plugin needs before it activates: the dictionary registry and
 * the slot registry. Both are hard dependencies — without them the page would
 * render untranslated copy into a seat that does not exist.
 */
export declare const inject: string[];
/**
 * Install the Avatar Chat settings page and the transcript decoration.
 * @param ctx - the browser-half context this plugin runs on.
 */
export declare function apply(ctx: Context): void;
//# sourceMappingURL=index.d.ts.map