# AGENTS.md

## Project Overview

This repository is a browser extension built with WXT, Vue 3, TypeScript, Tailwind CSS 4, and `@wxt-dev/i18n`. Its purpose is to export ChatGPT conversations to a plain text file with one click.

## Main User Flow

1. The popup UI lets the user choose whether to include user prompts and whether to include role names.
2. The popup sends a `logContent` message to the background script.
3. The background script finds an open ChatGPT conversation tab on `chatgpt.com` and forwards a `log` message to the content script.
4. The content script reads the conversation from the page DOM, formats the text, and downloads it as a `.txt` file.

## Important Files

- `entrypoints/popup/App.vue`: popup UI and message trigger.
- `entrypoints/background.ts`: tab lookup and message forwarding.
- `entrypoints/content.ts`: content script entrypoint for ChatGPT pages.
- `utils/get-conversation.ts`: conversation extraction logic from the DOM.
- `utils/download-helper.ts`: plain text file download helper.
- `components/toggle.vue`: reusable toggle control used in the popup.
- `wxt.config.ts`: extension manifest configuration, modules, and Vite/Tailwind setup.

## Project Structure Notes

- This is a WXT file-based extension project.
- Entry points live under `entrypoints/`.
- Shared UI components live under `components/`.
- Shared utilities live under `utils/`.
- Localization strings live under `locales/`.
- Static assets live under `assets/` and `public/`.

## Runtime Behavior Notes

- The extension targets `chatgpt.com` pages and related conversation/group URLs.
- Conversation extraction currently relies on DOM attributes like `data-message-author-role='assistant'` and `data-message-author-role='user'`.
- The extracted text is cleaned by replacing `CopyEdit` with a space before download.
- The popup checks for an open ChatGPT conversation tab before requesting export.

## Commands

- `bun run dev`: start the extension in dev mode.
- `bun run dev:firefox`: start a Firefox build in dev mode.
- `bun run build`: create a production build.
- `bun run build:firefox`: create a Firefox production build.
- `bun run zip`: package the extension.
- `bun run zip:firefox`: package a Firefox build.
- `bun run zip:edge`: package an Edge build.
- `bun run compile`: type-check with `vue-tsc --noEmit`.

## Working Guidance

- Keep changes minimal and focused on the existing extension flow.
- Preserve the current message chain between popup, background, and content script unless a change explicitly requires a redesign.
- If DOM selectors for ChatGPT change, update `utils/get-conversation.ts` first.
- Prefer updating localized strings in `locales/` when changing user-facing text.
