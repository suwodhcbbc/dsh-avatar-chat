import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Avatar Chat settings page: one card per transcript side plus the shared size.
 *
 * The page owns no transcript state of its own. It reads the store seat, calls
 * the declared actions for every change, and asks the injected face only for the
 * two gestures the component cannot perform itself (opening a file picker and
 * reading a picture back). The preview disc reads the same root variables the
 * page-level sheet paints from, so what shows here is what the transcript shows.
 */
import { useId, useState } from 'react';
import { Button, Switch } from '@deepseek-ai/dsh-client-ui-primitives';
import { AVATAR_CHAT_SIZE_MAX, AVATAR_CHAT_SIZE_MIN, } from "./avatar-chat-state.js";
import css from './AvatarChatSection.module.css';
/** Both transcript sides, in the order the page presents them. */
const SIDES = ['user', 'assistant'];
/** Localized explanation for each way a picked picture can be refused. */
const FAILURE_COPY = {
    type: 'failure-type',
    size: 'failure-size',
    read: 'failure-read',
    unsupported: 'failure-unsupported',
};
/**
 * Render the Avatar Chat settings page.
 * @param props - derived runtime, locale, store, and injected shares.
 * @returns the settings page for this feature.
 */
export function AvatarChatSection({ t, actions, useStore, chooseImage, applyImageUrl, storageAvailable, }) {
    const preferences = useStore(state => state.preferences);
    const imageFailure = useStore(state => state.imageFailure);
    const saved = useStore(state => state.saved);
    const [address, setAddress] = useState({ user: '', assistant: '' });
    const sizeId = useId();
    const renderSide = (side) => {
        const current = side === 'user' ? preferences.user : preferences.assistant;
        const title = side === 'user' ? t('user-title') : t('assistant-title');
        const addressId = `${sizeId}-${side}-address`;
        return (_jsxs("section", { className: css.card, children: [_jsxs("header", { className: css.cardHead, children: [_jsx("span", { className: css.preview, "data-side": side, role: "img", "aria-label": current.image === null ? t('side-builtin') : t('side-custom') }), _jsx("span", { className: css.cardTitle, children: title }), _jsx(Switch, { checked: current.visible, onChange: (next) => { actions.setVisible(side, next); }, label: t('toggle-label', { side: title }) })] }), _jsxs("div", { className: css.actions, children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => { chooseImage(side); }, children: current.image === null ? t('choose') : t('replace') }), _jsx(Button, { variant: "ghost", size: "sm", disabled: current.image === null, onClick: () => { actions.setImage(side, null); }, children: t('reset') })] }), _jsxs("div", { className: css.urlRow, children: [_jsx("span", { className: css.urlLabel, id: addressId, children: t('url-label-full', { side: title }) }), _jsx("input", { className: css.urlInput, type: "url", inputMode: "url", "aria-labelledby": addressId, placeholder: t('url-placeholder'), value: address[side], onChange: (event) => {
                                const next = event.currentTarget.value;
                                setAddress(previous => ({ ...previous, [side]: next }));
                            } }), _jsx(Button, { variant: "outline", size: "sm", disabled: address[side].trim() === '', onClick: () => {
                                applyImageUrl(side, address[side].trim());
                                setAddress(previous => ({ ...previous, [side]: '' }));
                            }, children: t('url-apply') })] })] }, side));
    };
    return (_jsxs("div", { className: css.section, children: [_jsxs("div", { children: [_jsx("h2", { className: css.heading, children: t('title') }), _jsx("p", { className: css.intro, children: t('intro') })] }), !storageAvailable && _jsx("p", { className: css.notice, role: "status", children: t('storage-unavailable') }), storageAvailable && !saved && _jsx("p", { className: css.notice, role: "status", children: t('save-failed') }), imageFailure !== null && _jsx("p", { className: css.warning, role: "alert", children: t(FAILURE_COPY[imageFailure]) }), _jsx("div", { className: css.sides, children: SIDES.map(renderSide) }), _jsxs("div", { className: css.sizeRow, children: [_jsx("label", { className: css.sizeLabel, htmlFor: sizeId, children: t('size-label') }), _jsx("input", { id: sizeId, className: css.range, type: "range", min: AVATAR_CHAT_SIZE_MIN, max: AVATAR_CHAT_SIZE_MAX, step: 2, value: preferences.size, onChange: (event) => { actions.setSize(Number(event.currentTarget.value)); } }), _jsx("span", { className: css.sizeValue, children: t('size-value', { size: preferences.size }) })] })] }));
}
//# sourceMappingURL=AvatarChatSection.js.map