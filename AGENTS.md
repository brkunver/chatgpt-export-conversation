# AGENTS.md

## Project Overview

This repository is a browser extension built with WXT, Vue 3, TypeScript, Tailwind CSS 4, and `@wxt-dev/i18n`. It exports the currently active ChatGPT conversation or group chat as a local text file.

The extension is intentionally small: keep changes focused on the popup -> background -> content-script export flow unless the task explicitly asks for a broader redesign.

The package manager is `pnpm` (`packageManager` is pinned in `package.json`). Use `pnpm run ...` for project scripts.

## Main User Flow

1. The popup UI lets the user choose:
   - whether to include user prompts,
   - whether to include role names,
   - whether to download as TXT or Markdown.
2. The popup sends a `logContent` message to the background script.
3. The background script looks at the active tab in the current window, verifies that it is a `chatgpt.com` URL, and forwards a `log` message to the content script.
4. The content script reads the conversation from the ChatGPT DOM, formats it, and downloads a `.txt` or `.md` file.
5. The popup receives a typed success/error response and displays localized errors when export fails.

## Important Files

- `entrypoints/popup/App.vue`: popup UI, toggles, TXT/Markdown buttons, loading state, localized error display, and `logContent` message trigger.
- `entrypoints/background.ts`: active-tab lookup, ChatGPT URL check, message forwarding to the content script, and background-side error mapping.
- `entrypoints/content.ts`: content script entrypoint for ChatGPT pages, `log` message handler, conversation extraction, download trigger, and content-side error mapping.
- `utils/get-conversation.ts`: DOM extraction, user/assistant filtering, role-label formatting, TXT normalization, Markdown export selection, and legacy `CopyEdit` cleanup.
- `utils/html-to-markdown.ts`: small local HTML-to-Markdown converter used for assistant Markdown exports. Prefer extending this helper over adding a large dependency.
- `utils/download-helper.ts`: `.txt`/`.md` file config, safe filename generation from `document.title`, Blob URL creation, and download link click.
- `utils/export-flow.ts`: shared export response/error types, `ConversationExportError`, and ChatGPT URL helpers.
- `utils/dev-log.ts`: development-only logging helper.
- `components/toggle.vue`: reusable toggle control used by the popup.
- `locales/*.yml`: localized extension name, description, labels, and error messages.
- `wxt.config.ts`: WXT modules, manifest metadata, localized manifest fields, development name prefix, disabled `webExt`, and Tailwind Vite plugin setup.
- `assets/fonts/*.woff2`: bundled Inter font files used by the popup. Keep only the weights the UI actually uses.

## Project Structure Notes

- This is a WXT file-based extension project.
- Entry points live under `entrypoints/`.
- Shared Vue components live under `components/`.
- Shared utilities live under `utils/`.
- Localization strings live under `locales/`.
- Bundled assets live under `assets/`; WXT/Vite processes referenced files there and emits hashed output.
- Public passthrough assets live under `public/`; WXT copies them directly into builds, so avoid placing large generated or unused files there.
- WXT-generated files live under `.wxt/` and `.output/`; do not edit generated output directly.

## Runtime Behavior Notes

- The content script matches `*://chatgpt.com/*` and `*://*.chatgpt.com/*`.
- The background currently accepts any active tab whose hostname ends with `chatgpt.com`; it does not search all open tabs.
- `isConversationTabUrl` exists for stricter path checks (`/c`, `/g`, `/gg`) but the current background flow uses `isChatGptTabUrl`.
- Conversation extraction relies on ChatGPT DOM attributes:
  - `[data-message-author-role='assistant']`
  - `[data-message-author-role='user']`
- User message content prefers `[data-testid='collapsible-user-message-content']`.
- Assistant message content prefers `.markdown`.
- TXT export uses plain text normalization.
- Markdown export preserves richer assistant formatting through `htmlToMarkdown`; user messages are still exported as plain text.
- Role labels are `User` and `Assistant`; Markdown role labels are emitted as `##` headings.
- The downloaded filename is based on `document.title`, sanitized, truncated, and given the selected extension.
- `CopyEdit` text is stripped during final export cleanup.
- Popup typography uses local Inter WOFF2 files from `assets/fonts` for normal `400`, medium `500`, semibold `600`, and black `900`. Do not reintroduce the large variable `public/Inter.ttf` unless there is a strong reason.

## Error Handling Notes

- Popup, background, and content communicate with `ExportResponse`.
- Known error codes live in `utils/export-flow.ts`.
- User-facing error text belongs in every `locales/*.yml` file under `content`.
- Content script extraction failures should throw `ConversationExportError` when they represent an expected export problem.
- Background messaging failures like "receiving end does not exist" map to `content_script_unavailable`.

## Commands

- `pnpm run dev`: start the extension in dev mode.
- `pnpm run dev:firefox`: start a Firefox dev build.
- `pnpm run build`: create a production Chromium build.
- `pnpm run build:firefox`: create a Firefox production build.
- `pnpm run zip`: package the Chromium build.
- `pnpm run zip:firefox`: package the Firefox build.
- `pnpm run zip:edge`: package the Edge build.
- `pnpm run compile`: type-check with `vue-tsc --noEmit`.

## Verification Guidance

- For TypeScript/Vue changes, run `pnpm run compile`.
- For manifest, WXT config, entrypoint, asset, font, or packaging-sensitive changes, run the relevant `pnpm run build` command.
- For Firefox-specific manifest behavior, inspect `.output/firefox-*/manifest.json` after building.
- For popup text changes, update all locale files or make a deliberate scoped locale-only change.
- For ChatGPT DOM extraction changes, prefer testing against a saved/real page shape when available, such as `reference.html` in this repo.
- For popup font changes, inspect `.output/chrome-mv3/assets/` and confirm no large `.ttf` passthrough file appears in the build.

## Working Guidance

- Read this file before changing the repo.
- Keep changes minimal and aligned with the existing WXT/Vue structure.
- Preserve the current message chain between popup, background, and content script unless the task explicitly requires changing it.
- If ChatGPT DOM selectors change, update `utils/get-conversation.ts` first.
- If adding a new export format, update the shared `ConversationExportFormat`, popup buttons, content handling, download file config, and localized UI strings together.
- If adding or changing user-facing text, prefer `locales/*.yml` instead of hardcoded strings.
- Avoid large dependencies for formatting/export logic unless the existing local helpers are clearly insufficient.
- Do not edit `.output/`, `.wxt/`, or `node_modules/` by hand.
