/** Avatar Chat copy: the settings page and the navigation entry that opens it. */
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** Avatar Chat settings page and navigation entry copy. */
        avatarChat: keyof typeof zh;
    }
}
/** Every copy key this namespace owns. */
export type AvatarChatLocaleKey = keyof typeof zh;
/** Chinese copy; the key authority for this namespace. */
export declare const zh: {
    nav: string;
    title: string;
    intro: string;
    'size-label': string;
    'size-value': string;
    'user-title': string;
    'assistant-title': string;
    'side-visible': string;
    'toggle-label': string;
    'url-label-full': string;
    'side-builtin': string;
    'side-custom': string;
    choose: string;
    replace: string;
    reset: string;
    'url-label': string;
    'url-placeholder': string;
    'url-apply': string;
    'failure-type': string;
    'failure-size': string;
    'failure-read': string;
    'failure-unsupported': string;
    'storage-unavailable': string;
    'save-failed': string;
};
/** English copy, keyed by the Chinese dictionary. */
export declare const en: Record<keyof typeof zh, string>;
//# sourceMappingURL=locales.d.ts.map