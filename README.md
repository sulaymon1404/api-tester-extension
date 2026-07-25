# API Tester — Session-Aware API Client

A Chrome extension that lets you inspect, edit, and resend API requests using your browser's real, logged-in session — no copying tokens or cookies out of DevTools by hand.

It lives inside Chrome DevTools itself, as a new **API Tester** tab next to Elements, Console, and Network — not a popup you have to click and lose the moment you look away.

## Why

Tools like Postman or Insomnia run outside the browser, so testing an authenticated endpoint means manually copying cookies or auth headers out of DevTools first. This extension runs *inside* the browser tab's own context, so it can capture real traffic as it happens and replay it with the session already attached.

## Features

- **Live network capture** — every `fetch`/`XHR` request the page makes shows up automatically while DevTools is open, filtered to API calls by default (toggle off to see everything, or filter by URL).
- **Click a request to inspect it** — shows the actual response that request got (status, headers, body, pretty-printed JSON) immediately.
- **Edit and resend** — the same click also loads the request into an editable builder (method, URL, headers, body), so you can tweak a parameter and fire it again.
- **Real session cookies, not spoofed headers** — a checkbox sends the request with `credentials: 'include'`, so the browser attaches your actual cookies for that site. (Browsers block scripts from setting a `Cookie` header directly — this is the correct way to replay an authenticated session.)
- **Content-Type helper** — a dropdown for JSON / form URL-encoded / plain text / custom that sets the header for you and adjusts the body placeholder.
- **Copy as curl** — with a manual-copy fallback, since DevTools panels block the scripted clipboard API.
- **Request history** — past manually-sent requests are saved locally and can be reloaded with one click.
- **New Request** — resets the builder back to blank at any time.

## Getting started

```bash
npm install
npm run build
```

Then in Chrome:
1. Go to `chrome://extensions`, enable **Developer mode**
2. Click **Load unpacked** and select the `dist/` folder
3. Open any page, open DevTools (`F12` / `Ctrl+Shift+I` / `Cmd+Option+I`)
4. Click the **API Tester** tab

For local development with hot-reload, use `npm run dev` instead of `npm run build` — but note that after changing `src/devtools/devtools.ts` specifically, you need to fully close and reopen the DevTools window (a Chrome limitation: once a DevTools panel is created, it can't be torn down and recreated in place).

Clicking the toolbar icon opens a small popup with these same instructions, since Chrome doesn't give extensions a way to open DevTools programmatically.

## Tech stack

- React + TypeScript + Vite
- [`@crxjs/vite-plugin`](https://crxjs.dev/) for the Manifest V3 build
- Tailwind CSS v4 + Radix UI primitives, styled shadcn/ui-style
- `chrome.devtools.network` for capture, plain `fetch()` for resending, `chrome.storage.local` for history

## Project structure

```
manifest.config.ts        Manifest V3 definition
src/
  devtools/                DevTools page — creates the "API Tester" panel
  panel/                   The panel itself (network list + request builder + response viewer)
  popup/                   Small informational popup (toolbar icon)
  components/
    request/               Request builder, response viewer, history list
    ui/                     shadcn-style primitives (button, input, select, tabs, ...)
  lib/                      Shared logic: request-sending hook, header sanitization, curl export, clipboard fallback, storage
```

## Permissions

- `storage` — saves request history locally, never leaves your machine
- `host_permissions: <all_urls>` — needed so the extension can resend requests to any API domain from its own context (this is what lets requests bypass CORS the way a normal page fetch wouldn't)

## Known limitations

- Firefox is not currently supported (Chrome/Chromium only)
- File uploads (`multipart/form-data`) aren't supported — the body editor is plain text
- The Network tab only captures traffic while DevTools is open, same as Chrome's own Network panel

## License

MIT — see [LICENSE](LICENSE).
