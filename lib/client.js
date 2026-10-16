window.__ModuleLoader__.load({
	id: "dsh-avatar-chat",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let _deepseek_ai_dsh_client_store = require("@deepseek-ai/dsh-client-store");
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region \0dsh-global-css:src/client/avatar-chat.css.mjs
		const css$1 = "html[data-dsh-avatar-chat] body{--dsh-avatar-chat-gap:10px;--dsh-avatar-chat-line-offset:2px;--dsh-avatar-chat-user-default:radial-gradient(circle at 50% 36%, var(--dsw-alias-label-secondary) 0 21%, transparent 22%), radial-gradient(ellipse 34% 26% at 50% 86%, var(--dsw-alias-label-secondary) 0 99%, transparent 100%), linear-gradient(var(--dsw-alias-bg-layer-2), var(--dsw-alias-bg-layer-2));--dsh-avatar-chat-assistant-default:radial-gradient(circle at 50% 50%, var(--dsw-alias-brand-primary) 0 16%, transparent 17%), radial-gradient(circle at 50% 50%, transparent 0 33%, var(--dsw-alias-brand-primary) 34% 46%, transparent 47%), linear-gradient(var(--dsw-alias-bg-layer-1), var(--dsw-alias-bg-layer-1));--dsh-avatar-chat-user-art:var(--dsh-avatar-chat-user-default);--dsh-avatar-chat-assistant-art:var(--dsh-avatar-chat-assistant-default)}html[data-dsh-avatar-chat][data-dsh-avatar-chat-user-image] body{--dsh-avatar-chat-user-art:var(--dsh-avatar-chat-user-image)}html[data-dsh-avatar-chat][data-dsh-avatar-chat-assistant-image] body{--dsh-avatar-chat-assistant-art:var(--dsh-avatar-chat-assistant-image)}html[data-dsh-avatar-chat-user=on] [data-chat-flow-kind=user]:not(:has(>[data-slot=\"conversation.chat.node\"]:empty)),html[data-dsh-avatar-chat-user=on] [data-chat-flow-kind=steering]:not(:has(>[data-slot=\"conversation.chat.node\"]:empty)){padding-right:calc(var(--dsh-avatar-chat-size,28px) + var(--dsh-avatar-chat-gap));position:relative}html[data-dsh-avatar-chat-assistant=on] [data-chat-flow-kind=assistant-step]:not([data-chat-group-part=reasoning]):not(:has(>[data-slot=\"conversation.chat.node\"]:empty)){padding-left:calc(var(--dsh-avatar-chat-size,28px) + var(--dsh-avatar-chat-gap));position:relative}html[data-dsh-avatar-chat][data-dsh-avatar-chat-user=on] [data-chat-flow-kind=user]:before,html[data-dsh-avatar-chat][data-dsh-avatar-chat-user=on] [data-chat-flow-kind=steering]:before,html[data-dsh-avatar-chat][data-dsh-avatar-chat-assistant=on] [data-chat-flow-kind=assistant-step]:not([data-chat-group-part=reasoning]):before{content:\"\";top:var(--dsh-avatar-chat-line-offset);width:var(--dsh-avatar-chat-size,28px);height:var(--dsh-avatar-chat-size,28px);corner-shape:round;box-shadow:inset 0 0 0 .5px var(--dsw-alias-border-l1);background-position:50%;background-repeat:no-repeat;background-size:cover;border-radius:50%;position:absolute}html[data-dsh-avatar-chat][data-dsh-avatar-chat-user=on] [data-chat-flow-kind=user]:before,html[data-dsh-avatar-chat][data-dsh-avatar-chat-user=on] [data-chat-flow-kind=steering]:before{background-image:var(--dsh-avatar-chat-user-art);right:0}html[data-dsh-avatar-chat][data-dsh-avatar-chat-assistant=on] [data-chat-flow-kind=assistant-step]:not([data-chat-group-part=reasoning]):before{background-image:var(--dsh-avatar-chat-assistant-art);left:0}";
		const tagId$1 = "dsh-avatar-chat/avatar-chat.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-avatar-chat";
			tag.dataset.pluginCss = tagId$1;
			tag.textContent = css$1;
			document.head.appendChild(tag);
		}
		/** Preferences used when nothing is stored and by the restore-default action. */
		function defaultAvatarChatPreferences() {
			return {
				schemaVersion: 1,
				size: 28,
				user: {
					visible: true,
					image: null
				},
				assistant: {
					visible: true,
					image: null
				}
			};
		}
		/** A data URL of an image, or an absolute HTTP(S) URL. */
		const IMAGE_SOURCE = /^(?:data:image\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/]+={0,2}|https?:\/\/\S+)$/;
		/**
		* Accept one stored image reference.
		* @param value - candidate read from storage or produced by the file reader.
		* @returns the reference, or `null` when it is not a supported image source.
		*/
		function avatarChatImage(value) {
			if (typeof value !== "string" || value.length > 7e6) return null;
			return IMAGE_SOURCE.test(value) ? value : null;
		}
		/** A candidate object read from parsed JSON, before any field is trusted. */
		function isRecord(value) {
			return typeof value === "object" && value !== null && !Array.isArray(value);
		}
		/** Clamp a stored edge length, falling back to the default for a non-number. */
		function normalizeSize(value) {
			if (typeof value !== "number" || !Number.isFinite(value)) return 28;
			return Math.min(64, Math.max(20, Math.round(value)));
		}
		/** Validate one side's sub-document. */
		function normalizeSide(value) {
			if (!isRecord(value)) return {
				side: {
					visible: true,
					image: null
				},
				repaired: true
			};
			const visible = typeof value.visible === "boolean" ? value.visible : true;
			const image = avatarChatImage(value.image);
			return {
				side: {
					visible,
					image
				},
				repaired: value.visible !== visible || value.image !== image
			};
		}
		/**
		* Validate a parsed storage document.
		* @param value - the value parsed from storage, or any other candidate.
		* @returns the usable preferences plus whether anything had to be replaced.
		*/
		function normalizeAvatarChatPreferences(value) {
			if (!isRecord(value)) return {
				preferences: defaultAvatarChatPreferences(),
				repaired: true
			};
			const user = normalizeSide(value.user);
			const assistant = normalizeSide(value.assistant);
			const size = normalizeSize(value.size);
			return {
				preferences: {
					schemaVersion: 1,
					size,
					user: user.side,
					assistant: assistant.side
				},
				repaired: value.schemaVersion !== 1 || value.size !== size || user.repaired || assistant.repaired
			};
		}
		/** Media types the file picker offers and the reader accepts. */
		const AVATAR_CHAT_FILE_TYPES = [
			"image/png",
			"image/jpeg",
			"image/webp",
			"image/gif"
		];
		/** Output media type for redrawn uploads; a lossless source becomes a small WebP. */
		const AVATAR_CHAT_DOWNSCALE_TYPE = "image/webp";
		/**
		* Validate and read one picked file.
		* @param file - the file the user chose.
		* @param environment - reader and redrawer supplied by the page.
		* @returns the storable image, or the reason the upload was rejected.
		*/
		async function readAvatarChatImage(file, environment) {
			if (!AVATAR_CHAT_FILE_TYPES.includes(file.type)) return {
				status: "failed",
				reason: "type"
			};
			if (file.size > 5242880) return {
				status: "failed",
				reason: "size"
			};
			const image = await attemptedShrink(file, environment) ?? await attemptedRead(file, environment);
			if (image === null) return {
				status: "failed",
				reason: "read"
			};
			const accepted = avatarChatImage(image);
			if (accepted === null) return {
				status: "failed",
				reason: "unsupported"
			};
			return {
				status: "ready",
				image: accepted
			};
		}
		/** Redraw the file, falling back to the full-size read on any failure. */
		async function attemptedShrink(file, environment) {
			if (environment.shrink === null) return null;
			try {
				return await environment.shrink(file);
			} catch {
				return null;
			}
		}
		/** Read the file, reporting a read failure as `null` so the caller names it. */
		async function attemptedRead(file, environment) {
			try {
				return await environment.readAsDataUrl(file);
			} catch {
				return null;
			}
		}
		/**
		* The page's own reader and redrawer.
		* @returns an environment backed by `FileReader` and `OffscreenCanvas`.
		*/
		function browserAvatarChatImageEnvironment() {
			return {
				readAsDataUrl: readBlobAsDataUrl,
				shrink: shrinkBlobToDataUrl
			};
		}
		/**
		* Read a blob as a data URL.
		* @param file - the blob to read.
		* @returns the data URL.
		* @throws When the reader reports an error; `readAvatarChatImage` turns that into `'read'`.
		*/
		function readBlobAsDataUrl(file) {
			return new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = () => {
					const result = reader.result;
					if (typeof result !== "string") {
						reject(/* @__PURE__ */ new Error("avatar-chat: the file could not be read"));
						return;
					}
					resolve(result);
				};
				reader.onerror = () => {
					reject(reader.error ?? /* @__PURE__ */ new Error("avatar-chat: the file could not be read"));
				};
				reader.readAsDataURL(file);
			});
		}
		/**
		* Redraw a picked file within {@link AVATAR_CHAT_DOWNSCALE_EDGE}.
		* @param file - the picked file.
		* @returns the redrawn data URL, or `null` when the browser lacks bitmaps or canvas.
		*/
		async function shrinkBlobToDataUrl(file) {
			if (typeof createImageBitmap !== "function" || typeof OffscreenCanvas !== "function") return null;
			const bitmap = await createImageBitmap(file);
			try {
				const edge = Math.max(bitmap.width, bitmap.height);
				const scale = edge > 256 ? 256 / edge : 1;
				const width = Math.max(1, Math.round(bitmap.width * scale));
				const height = Math.max(1, Math.round(bitmap.height * scale));
				const canvas = new OffscreenCanvas(width, height);
				const context = canvas.getContext("2d");
				if (context === null) return null;
				context.drawImage(bitmap, 0, 0, width, height);
				return await readBlobAsDataUrl(await canvas.convertToBlob({ type: AVATAR_CHAT_DOWNSCALE_TYPE }));
			} finally {
				bitmap.close();
			}
		}
		//#endregion
		//#region src/client/avatar-chat-storage.ts
		/**
		* localStorage persistence for the Avatar Chat preferences.
		*
		* This browser half has no persistence service, so the page's own
		* `localStorage` is the store, matching the other client features that keep a
		* device-local preference (`ui-sidebar-right`, `ui-conversation`). Every access
		* is guarded: a browser that denies storage or a full quota degrades to
		* in-memory preferences for the life of the page rather than failing the load.
		*/
		/** Storage key; the suffix lets a future schema migrate without reading this one. */
		const AVATAR_CHAT_STORAGE_KEY = "dsh.avatar-chat.v1";
		/**
		* Resolve the page's localStorage.
		* @returns the store, or `null` when the browser denies access to it.
		*/
		function avatarChatStorage() {
			try {
				return window.localStorage;
			} catch {
				return null;
			}
		}
		/**
		* Read and validate the stored preferences.
		* @param storage - the store, or `null` when the browser denied it.
		* @returns the active preferences and how they were obtained.
		*/
		function readAvatarChatPreferences(storage) {
			if (storage === null) return {
				status: "unavailable",
				preferences: defaultAvatarChatPreferences()
			};
			let raw;
			try {
				raw = storage.getItem(AVATAR_CHAT_STORAGE_KEY);
			} catch {
				return {
					status: "unavailable",
					preferences: defaultAvatarChatPreferences()
				};
			}
			if (raw === null) return {
				status: "absent",
				preferences: defaultAvatarChatPreferences()
			};
			let parsed;
			try {
				parsed = JSON.parse(raw);
			} catch {
				return {
					status: "damaged",
					preferences: defaultAvatarChatPreferences()
				};
			}
			const { preferences, repaired } = normalizeAvatarChatPreferences(parsed);
			return {
				status: repaired ? "damaged" : "stored",
				preferences
			};
		}
		/**
		* Write the preferences, replacing any previous document.
		* @param storage - the store, or `null` when the browser denied it.
		* @param preferences - the document to persist.
		* @returns whether the document reached storage.
		*/
		function writeAvatarChatPreferences(storage, preferences) {
			if (storage === null) return { status: "unavailable" };
			try {
				storage.setItem(AVATAR_CHAT_STORAGE_KEY, JSON.stringify(preferences));
				return { status: "stored" };
			} catch {
				return { status: "unavailable" };
			}
		}
		//#endregion
		//#region src/client/avatar-chat-store.ts
		/**
		* Avatar Chat preferences shared by the settings page and the page-level
		* decoration.
		*
		* One handle owns the whole feature state: the settings component reads it
		* through the store seat and mutates it through these actions, and the plugin
		* body subscribes once to persist the document and repaint the document root.
		* That keeps the write and the repaint out of the render path and in one place.
		*/
		/** Read one side's sub-document. */
		function sideOf(preferences, side) {
			return side === "user" ? preferences.user : preferences.assistant;
		}
		/** Replace one side's sub-document, leaving the other untouched. */
		function withSide(preferences, side, next) {
			return side === "user" ? {
				...preferences,
				user: next
			} : {
				...preferences,
				assistant: next
			};
		}
		/**
		* Declare the Avatar Chat store.
		* @returns the handle for the feature's preferences and actions.
		*/
		function createAvatarChatStore() {
			return (0, _deepseek_ai_dsh_client_store.defineStore)({
				init: () => ({
					preferences: readAvatarChatPreferences(avatarChatStorage()).preferences,
					imageFailure: null,
					saved: true
				}),
				actions: {
					setVisible: (d, side, visible) => {
						d.preferences = withSide(d.preferences, side, {
							...sideOf(d.preferences, side),
							visible
						});
					},
					setImage: (d, side, image) => {
						d.preferences = withSide(d.preferences, side, {
							...sideOf(d.preferences, side),
							image
						});
						d.imageFailure = null;
					},
					setSize: (d, size) => {
						const clamped = Math.min(64, Math.max(20, Math.round(size)));
						d.preferences = {
							...d.preferences,
							size: clamped
						};
					},
					restoreDefaults: (d) => {
						d.preferences = defaultAvatarChatPreferences();
						d.imageFailure = null;
					},
					noteImageFailure: (d, reason) => {
						d.imageFailure = reason;
					},
					noteSaved: (d, saved) => {
						d.saved = saved;
					}
				}
			});
		}
		//#endregion
		//#region src/client/avatar-chat-style.ts
		/** Presence marker on the document root; the injected stylesheet keys off it. */
		const AVATAR_CHAT_ROOT_ATTRIBUTE = "data-dsh-avatar-chat";
		/** Root flag enabling the user side; `on` or `off`. */
		const AVATAR_CHAT_USER_ATTRIBUTE = "data-dsh-avatar-chat-user";
		/** Root flag marking a configured user picture; present or absent. */
		const AVATAR_CHAT_USER_IMAGE_ATTRIBUTE = "data-dsh-avatar-chat-user-image";
		/** Root flag enabling the assistant side; `on` or `off`. */
		const AVATAR_CHAT_ASSISTANT_ATTRIBUTE = "data-dsh-avatar-chat-assistant";
		/** Root flag marking a configured assistant picture; present or absent. */
		const AVATAR_CHAT_ASSISTANT_IMAGE_ATTRIBUTE = "data-dsh-avatar-chat-assistant-image";
		/** Custom property carrying the avatar edge. */
		const AVATAR_CHAT_SIZE_VARIABLE = "--dsh-avatar-chat-size";
		/** Custom property carrying the user picture. */
		const AVATAR_CHAT_USER_IMAGE_VARIABLE = "--dsh-avatar-chat-user-image";
		/** Custom property carrying the assistant picture. */
		const AVATAR_CHAT_ASSISTANT_IMAGE_VARIABLE = "--dsh-avatar-chat-assistant-image";
		/**
		* Apply the preferences to a root element.
		* @param root - the element that carries the decoration, normally `document.documentElement`.
		* @param preferences - the active preferences.
		*/
		function applyAvatarChatStyle(root, preferences) {
			setSide(root, AVATAR_CHAT_USER_ATTRIBUTE, AVATAR_CHAT_USER_IMAGE_ATTRIBUTE, AVATAR_CHAT_USER_IMAGE_VARIABLE, preferences.user);
			setSide(root, AVATAR_CHAT_ASSISTANT_ATTRIBUTE, AVATAR_CHAT_ASSISTANT_IMAGE_ATTRIBUTE, AVATAR_CHAT_ASSISTANT_IMAGE_VARIABLE, preferences.assistant);
			root.style.setProperty(AVATAR_CHAT_SIZE_VARIABLE, `${preferences.size}px`);
			root.setAttribute(AVATAR_CHAT_ROOT_ATTRIBUTE, "");
		}
		/**
		* Remove every trace of the decoration from a root element.
		* @param root - the element that carries the decoration.
		*/
		function clearAvatarChatStyle(root) {
			for (const attribute of [
				AVATAR_CHAT_ROOT_ATTRIBUTE,
				AVATAR_CHAT_USER_ATTRIBUTE,
				AVATAR_CHAT_USER_IMAGE_ATTRIBUTE,
				AVATAR_CHAT_ASSISTANT_ATTRIBUTE,
				AVATAR_CHAT_ASSISTANT_IMAGE_ATTRIBUTE
			]) root.removeAttribute(attribute);
			for (const variable of [
				AVATAR_CHAT_SIZE_VARIABLE,
				AVATAR_CHAT_USER_IMAGE_VARIABLE,
				AVATAR_CHAT_ASSISTANT_IMAGE_VARIABLE
			]) root.style.removeProperty(variable);
		}
		/** Write one side's flag and picture, removing both when the side has no picture. */
		function setSide(root, flag, imageFlag, variable, side) {
			root.setAttribute(flag, side.visible ? "on" : "off");
			if (side.image === null) {
				root.removeAttribute(imageFlag);
				root.style.removeProperty(variable);
				return;
			}
			root.setAttribute(imageFlag, "set");
			root.style.setProperty(variable, `url("${side.image}")`);
		}
		//#endregion
		//#region \0dsh-css:src/client/AvatarChatSection.module.css.mjs
		const css = ".PUSsTW_section{flex-direction:column;gap:16px;display:flex}.PUSsTW_heading{color:var(--dsw-alias-label-primary);margin:0 0 4px;font-size:15px;font-weight:600}.PUSsTW_intro{color:var(--dsw-alias-label-secondary);margin:0;font-size:13px;line-height:1.6}.PUSsTW_notice{border-radius:var(--dsw-radius-sm);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);margin:0;padding:8px 12px;font-size:13px}.PUSsTW_warning{border-radius:var(--dsw-radius-sm);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-state-warn-primary);margin:0;padding:8px 12px;font-size:13px}.PUSsTW_sides{flex-direction:column;gap:12px;display:flex}.PUSsTW_card{border:.5px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-1);flex-direction:column;gap:12px;padding:12px;display:flex}.PUSsTW_cardHead{align-items:center;gap:10px;display:flex}.PUSsTW_preview{corner-shape:round;background-color:var(--dsw-alias-bg-layer-2);width:36px;height:36px;box-shadow:inset 0 0 0 .5px var(--dsw-alias-border-l1);background-position:50%;background-repeat:no-repeat;background-size:cover;border-radius:50%;flex:none}.PUSsTW_preview[data-side=user]{background-image:var(--dsh-avatar-chat-user-art,none)}.PUSsTW_preview[data-side=assistant]{background-image:var(--dsh-avatar-chat-assistant-art,none)}.PUSsTW_cardTitle{min-width:0;color:var(--dsw-alias-label-primary);flex:auto;font-size:13px;font-weight:600}.PUSsTW_actions{flex-wrap:wrap;gap:8px;display:flex}.PUSsTW_urlRow{align-items:center;gap:8px;display:flex}.PUSsTW_urlLabel{color:var(--dsw-alias-label-secondary);flex:none;font-size:13px}.PUSsTW_urlInput{border:.5px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-sm);background:var(--dsw-alias-bg-base);min-width:0;height:28px;color:var(--dsw-alias-label-primary);flex:auto;padding:0 10px;font-size:13px}.PUSsTW_urlInput::placeholder{color:var(--dsw-alias-label-caption)}.PUSsTW_urlInput:focus-visible{border-color:var(--dsw-alias-brand-primary)}.PUSsTW_sizeRow{align-items:center;gap:12px;display:flex}.PUSsTW_sizeLabel{color:var(--dsw-alias-label-primary);flex:none;font-size:13px}.PUSsTW_range{min-width:0;accent-color:var(--dsw-alias-brand-primary);flex:auto}.PUSsTW_sizeValue{text-align:right;min-width:64px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;flex:none;font-size:13px}";
		const tagId = "dsh-avatar-chat/AvatarChatSection.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-avatar-chat";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var AvatarChatSection_module_css_default = {
			"actions": "PUSsTW_actions",
			"card": "PUSsTW_card",
			"cardHead": "PUSsTW_cardHead",
			"cardTitle": "PUSsTW_cardTitle",
			"heading": "PUSsTW_heading",
			"intro": "PUSsTW_intro",
			"notice": "PUSsTW_notice",
			"preview": "PUSsTW_preview",
			"range": "PUSsTW_range",
			"section": "PUSsTW_section",
			"sides": "PUSsTW_sides",
			"sizeLabel": "PUSsTW_sizeLabel",
			"sizeRow": "PUSsTW_sizeRow",
			"sizeValue": "PUSsTW_sizeValue",
			"urlInput": "PUSsTW_urlInput",
			"urlLabel": "PUSsTW_urlLabel",
			"urlRow": "PUSsTW_urlRow",
			"warning": "PUSsTW_warning"
		};
		//#endregion
		//#region src/client/AvatarChatSection.tsx
		/**
		* Avatar Chat settings page: one card per transcript side plus the shared size.
		*
		* The page owns no transcript state of its own. It reads the store seat, calls
		* the declared actions for every change, and asks the injected face only for the
		* two gestures the component cannot perform itself (opening a file picker and
		* reading a picture back). The preview disc reads the same root variables the
		* page-level sheet paints from, so what shows here is what the transcript shows.
		*/
		/** Both transcript sides, in the order the page presents them. */
		const SIDES = ["user", "assistant"];
		/** Localized explanation for each way a picked picture can be refused. */
		const FAILURE_COPY = {
			type: "failure-type",
			size: "failure-size",
			read: "failure-read",
			unsupported: "failure-unsupported"
		};
		/**
		* Render the Avatar Chat settings page.
		* @param props - derived runtime, locale, store, and injected shares.
		* @returns the settings page for this feature.
		*/
		function AvatarChatSection({ t, actions, useStore, chooseImage, applyImageUrl, storageAvailable }) {
			const preferences = useStore((state) => state.preferences);
			const imageFailure = useStore((state) => state.imageFailure);
			const saved = useStore((state) => state.saved);
			const [address, setAddress] = (0, react.useState)({
				user: "",
				assistant: ""
			});
			const sizeId = (0, react.useId)();
			const renderSide = (side) => {
				const current = side === "user" ? preferences.user : preferences.assistant;
				const title = side === "user" ? t("user-title") : t("assistant-title");
				const addressId = `${sizeId}-${side}-address`;
				return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
					className: AvatarChatSection_module_css_default.card,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
							className: AvatarChatSection_module_css_default.cardHead,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: AvatarChatSection_module_css_default.preview,
									"data-side": side,
									role: "img",
									"aria-label": current.image === null ? t("side-builtin") : t("side-custom")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: AvatarChatSection_module_css_default.cardTitle,
									children: title
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Switch, {
									checked: current.visible,
									onChange: (next) => {
										actions.setVisible(side, next);
									},
									label: t("toggle-label", { side: title })
								})
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: AvatarChatSection_module_css_default.actions,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "outline",
								size: "sm",
								onClick: () => {
									chooseImage(side);
								},
								children: current.image === null ? t("choose") : t("replace")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "ghost",
								size: "sm",
								disabled: current.image === null,
								onClick: () => {
									actions.setImage(side, null);
								},
								children: t("reset")
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: AvatarChatSection_module_css_default.urlRow,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: AvatarChatSection_module_css_default.urlLabel,
									id: addressId,
									children: t("url-label-full", { side: title })
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									className: AvatarChatSection_module_css_default.urlInput,
									type: "url",
									inputMode: "url",
									"aria-labelledby": addressId,
									placeholder: t("url-placeholder"),
									value: address[side],
									onChange: (event) => {
										const next = event.currentTarget.value;
										setAddress((previous) => ({
											...previous,
											[side]: next
										}));
									}
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "outline",
									size: "sm",
									disabled: address[side].trim() === "",
									onClick: () => {
										applyImageUrl(side, address[side].trim());
										setAddress((previous) => ({
											...previous,
											[side]: ""
										}));
									},
									children: t("url-apply")
								})
							]
						})
					]
				}, side);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: AvatarChatSection_module_css_default.section,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
						className: AvatarChatSection_module_css_default.heading,
						children: t("title")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: AvatarChatSection_module_css_default.intro,
						children: t("intro")
					})] }),
					!storageAvailable && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: AvatarChatSection_module_css_default.notice,
						role: "status",
						children: t("storage-unavailable")
					}),
					storageAvailable && !saved && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: AvatarChatSection_module_css_default.notice,
						role: "status",
						children: t("save-failed")
					}),
					imageFailure !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: AvatarChatSection_module_css_default.warning,
						role: "alert",
						children: t(FAILURE_COPY[imageFailure])
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: AvatarChatSection_module_css_default.sides,
						children: SIDES.map(renderSide)
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: AvatarChatSection_module_css_default.sizeRow,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
								className: AvatarChatSection_module_css_default.sizeLabel,
								htmlFor: sizeId,
								children: t("size-label")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								id: sizeId,
								className: AvatarChatSection_module_css_default.range,
								type: "range",
								min: 20,
								max: 64,
								step: 2,
								value: preferences.size,
								onChange: (event) => {
									actions.setSize(Number(event.currentTarget.value));
								}
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: AvatarChatSection_module_css_default.sizeValue,
								children: t("size-value", { size: preferences.size })
							})
						]
					})
				]
			});
		}
		//#endregion
		//#region src/client/locales.ts
		/** Chinese copy; the key authority for this namespace. */
		const zh = {
			nav: "头像对话",
			title: "头像对话",
			intro: "在对话气泡旁显示用户与助手头像。头像与尺寸只保存在本机浏览器中，不会写入会话记录。",
			"size-label": "头像尺寸",
			"size-value": "{size} 像素",
			"user-title": "用户头像",
			"assistant-title": "助手头像",
			"side-visible": "在对话中显示",
			"toggle-label": "{side}：在对话中显示",
			"url-label-full": "{side}：图片地址",
			"side-builtin": "当前使用默认头像",
			"side-custom": "当前使用自定义图片",
			choose: "选择图片",
			replace: "更换图片",
			reset: "恢复默认",
			"url-label": "图片地址",
			"url-placeholder": "https://example.com/avatar.png",
			"url-apply": "使用该地址",
			"failure-type": "仅支持 PNG、JPEG、WebP 或 GIF 图片。",
			"failure-size": "图片过大，请选择 5 MiB 以内的图片。",
			"failure-read": "无法读取该图片，请重新选择。",
			"failure-unsupported": "该文件不是可用的图片。",
			"storage-unavailable": "此浏览器禁止本机存储，头像设置无法保存。",
			"save-failed": "头像设置未能保存到本机存储。"
		};
		/** English copy, keyed by the Chinese dictionary. */
		const en = {
			nav: "Avatars",
			title: "Avatars",
			intro: "Show a user and an assistant avatar beside chat bubbles. Both the pictures and the size stay in this browser and are never written to the session.",
			"size-label": "Avatar size",
			"size-value": "{size} px",
			"user-title": "Your avatar",
			"assistant-title": "Assistant avatar",
			"side-visible": "Show in the transcript",
			"toggle-label": "{side}: show in transcript",
			"url-label-full": "{side}: picture address",
			"side-builtin": "Using the built-in avatar",
			"side-custom": "Using a custom picture",
			choose: "Choose a picture",
			replace: "Replace picture",
			reset: "Restore default",
			"url-label": "Picture address",
			"url-placeholder": "https://example.com/avatar.png",
			"url-apply": "Use this address",
			"failure-type": "Only PNG, JPEG, WebP, and GIF pictures are accepted.",
			"failure-size": "That picture is too large. Choose one under 5 MiB.",
			"failure-read": "That picture could not be read. Try choosing it again.",
			"failure-unsupported": "That file is not a usable picture.",
			"storage-unavailable": "This browser blocks local storage, so avatar settings cannot be saved.",
			"save-failed": "Avatar settings could not be saved to local storage."
		};
		//#endregion
		//#region src/client/index.ts
		/** Locale namespace this plugin owns. */
		const NAMESPACE = "avatarChat";
		/**
		* Services this plugin needs before it activates: the dictionary registry and
		* the slot registry. Both are hard dependencies — without them the page would
		* render untranslated copy into a seat that does not exist.
		*/
		const inject = ["locale", "slots"];
		/**
		* Install the Avatar Chat settings page and the transcript decoration.
		* @param ctx - the browser-half context this plugin runs on.
		*/
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NAMESPACE, {
				zh,
				en
			}), "avatar-chat: dictionaries");
			const t = ctx.locale.bind(NAMESPACE);
			const handle = createAvatarChatStore();
			const instance = handle.create();
			const store = {
				...handle,
				create: () => instance
			};
			const storage = avatarChatStorage();
			const storageAvailable = storage !== null;
			ctx.effect(() => {
				const root = document.documentElement;
				return () => {
					clearAvatarChatStyle(root);
				};
			}, "avatar-chat: decoration lifetime");
			ctx.effect(() => {
				const sync = (state) => {
					applyAvatarChatStyle(document.documentElement, state.preferences);
					const saved = writeAvatarChatPreferences(storage, state.preferences).status === "stored";
					if (state.saved !== saved) instance.actions.noteSaved(saved);
				};
				sync(instance.getSnapshot());
				return instance.subscribe(() => {
					sync(instance.getSnapshot());
				});
			}, "avatar-chat: persist and repaint");
			/** Report one picked file, keeping the refused reason for the settings page. */
			const acceptPicked = async (side, file) => {
				const result = await readAvatarChatImage(file, browserAvatarChatImageEnvironment());
				if (result.status === "ready") instance.actions.setImage(side, result.image);
				else instance.actions.noteImageFailure(result.reason);
			};
			/** Open the browser's picker; a cancelled pick leaves the current avatar alone. */
			const chooseImage = (side) => {
				const input = document.createElement("input");
				input.type = "file";
				input.accept = AVATAR_CHAT_FILE_TYPES.join(",");
				input.addEventListener("change", () => {
					const file = input.files?.[0];
					if (file !== void 0) acceptPicked(side, file);
				}, { once: true });
				input.click();
			};
			/** Adopt a typed address once the browser confirms it resolves to a picture. */
			const applyImageUrl = (side, url) => {
				const accepted = avatarChatImage(url);
				if (accepted === null) {
					instance.actions.noteImageFailure("unsupported");
					return;
				}
				const probe = new Image();
				probe.onload = () => {
					instance.actions.setImage(side, accepted);
				};
				probe.onerror = () => {
					instance.actions.noteImageFailure("read");
				};
				probe.src = accepted;
			};
			const injected = () => ({
				chooseImage,
				applyImageUrl,
				storageAvailable
			});
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "avatar-chat",
				order: 16,
				label: () => t("nav"),
				locale: NAMESPACE,
				store,
				inject: injected
			}, AvatarChatSection));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map